import type { ConversationalInformationCapture } from "./information-capture.ts";
import { ProductInitializeSchema, ProductHandleSchema, ProductActionSchema } from "../core/product-runtime.ts";
import { FoundationError } from "../core/identity-access.ts";
import { IdentityFoundation } from "./identity-foundation.ts";
import { DiscoveryFoundation } from "./discovery-foundation.ts";
import { RuntimeFoundation } from "./runtime-foundation.ts";
import { GovernedContextResolver } from "./governed-context.ts";
import { GovernedOrchestration } from "./orchestration.ts";
import type { IdentityPort } from "../ports/identity.ts";
import type { DiscoveryPersistencePort } from "../ports/discovery-persistence.ts";
import type { RuntimePersistencePort } from "../ports/runtime-persistence.ts";
import type { GovernedContextReadPort } from "../ports/governed-context.ts";
import type { DiscoveryId } from "../core/primitives.ts";
import { ProductConversationRequestSchema, ProductConversationResultSchema } from "../core/product-conversation.ts";
import { projectConversation } from "../core/conversation-projection.ts";
import { agendaTopic, createConversationalState, parseBoundConversationalState, transitionConversationalState } from "../core/conversational-state.ts";

export class ProductRuntime {
  private readonly capture?: ConversationalInformationCapture;
  private readonly identity: IdentityPort;
  private readonly discovery: DiscoveryFoundation;
  private readonly runtime: RuntimeFoundation;
  private readonly persistence: RuntimePersistencePort;
  private readonly resolver: GovernedContextResolver;
  constructor(identity: IdentityPort, discovery: DiscoveryPersistencePort, runtime: RuntimePersistencePort, context: GovernedContextReadPort, capture?: ConversationalInformationCapture) {
    this.capture=capture; this.identity=identity; this.discovery=new DiscoveryFoundation(identity,discovery);
    this.runtime=new RuntimeFoundation(identity,runtime); this.persistence=runtime;
    this.resolver=new GovernedContextResolver(identity,discovery,context);
  }
  private async open(discoveryId: DiscoveryId) {
    await this.discovery.readRoot(discoveryId);
    const actor=await this.identity.current();
    if(!actor)throw new FoundationError("AUTHENTICATION_REQUIRED");
    const runtime=await this.runtime.read({discoveryId});
    if(!runtime)return null;
    const sessions=await this.persistence.listSessions({identityId:actor.identityId,discoveryId});
    const open=sessions.filter(s=>s.lifecycle==="OPEN");
    if(runtime.discoveryId!==discoveryId||open.length!==1||open[0].discoveryId!==discoveryId||runtime.current.sessionId!==open[0].sessionId)
      throw new FoundationError("CONCURRENT_MODIFICATION");
    return ProductHandleSchema.parse({discoveryId,sessionId:open[0].sessionId,runtimeVersion:runtime.runtimeVersion});
  }
  async initialize(input:unknown) {
    const p=ProductInitializeSchema.safeParse(input);
    if(!p.success)throw new FoundationError("INVALID_INPUT");
    // Missing identity on an existing Discovery must not create a replacement user.
    if(!p.data.discoveryId) await new IdentityFoundation(this.identity).ensureAuthenticatedIdentity();
    const root=p.data.discoveryId ? await this.discovery.readRoot(p.data.discoveryId)
      : await this.discovery.createOwnedDiscovery(p.data.operationId);
    const existing=await this.open(root.discoveryId);
    if(existing)return existing;
    await this.runtime.initialize({discoveryId:root.discoveryId,operationId:p.data.operationId,sessionId:p.data.sessionId,now:p.data.now});
    // Resolve the actual current state, rather than mistaking an accepted replay snapshot for current.
    const current=await this.open(root.discoveryId);
    if(!current)throw new FoundationError("PROVIDER_UNAVAILABLE");
    return current;
  }
  async converse(input:unknown) {
    const p=ProductConversationRequestSchema.safeParse(input);
    if(!p.success)throw new FoundationError("INVALID_INPUT");
    const {conversation,capture,conversationalState:priorConversationState,...handle}=p.data;
    let captureResult;
    if(capture){
      if(!conversation||!this.capture)throw new FoundationError("INVALID_INPUT");
      await this.open(handle.discoveryId); // Server-side ownership and OPEN Session checks.
      captureResult=await this.capture.execute({...handle,message:conversation.message,capture});
    }
    // Always resolve again after publication/replay. Never evaluate the old projection.
    const refreshed=capture?await this.open(handle.discoveryId):handle;
    if(!refreshed||refreshed.sessionId!==handle.sessionId)throw new FoundationError("CONCURRENT_MODIFICATION");
    const action=await this.evaluate(refreshed);
    const response=projectConversation(action,conversation);
    const conversationProgress=conversation
      ? transitionConversationalState({prior:priorConversationState,discoveryId:handle.discoveryId,
        sessionId:handle.sessionId,action,message:conversation.message,acceptedCapture:captureResult?.accepted??0,
        evaluations:captureResult?.evaluations??[]})
      : {state:parseBoundConversationalState(priorConversationState,handle.discoveryId,handle.sessionId)??
        createConversationalState(handle.discoveryId,handle.sessionId,action.kind==="ABSTAIN"&&action.reason==="UNKNOWN_CRITICAL_PENDING"),progression:"NO_TURN" as const};
    const pending=captureResult?.evaluations.find(e=>e.outcome==="REQUIRE_HUMAN_DECISION")??captureResult?.evaluations.find(e=>e.outcome==="REQUIRE_CLARIFICATION");
    if(pending&&response.conversationEligible&&!(action.kind==="SUBSTANTIVE"&&(action.progression==="BLOCK"||action.requiresHumanDecision))){
      response.intent=pending.outcome==="REQUIRE_HUMAN_DECISION"?"HUMAN_REVIEW":"CLARIFY";
      response.text=pending.question!;
    }else if(conversationProgress.progression==="DEFERRED"||conversationProgress.progression==="AGENDA_CONTINUATION"){
      const topic=agendaTopic(conversationProgress.state.nextAgendaTopicId);
      response.intent=topic?"DEEPEN":"CLARIFY";
      const open="Esse ponto continua em aberto; nenhuma resolução foi presumida.";
      const recorded=captureResult?.accepted?" A nova informação foi registrada como não verificada.":"";
      response.text=topic
        ? `${open}${recorded} Podemos continuar a Discovery por outro tópico: ${topic.prompt}`
        : `${open}${recorded} Não há outro tópico disponível na agenda inicial desta sessão; você pode trazer outro aspecto da Discovery ou retomar essa questão depois.`;
    }else if(conversationProgress.progression==="USER_STATED_UNKNOWN"){
      response.intent="CLARIFY";
      const recorded=captureResult?.accepted?" A declaração foi registrada somente como não verificada.":"";
      response.text=(conversationProgress.state.unknownDeclarationCount>1
        ? "Entendi que essa informação continua desconhecida. O estado governado permanece em aberto. Se quiser explorar outro aspecto agora, peça explicitamente para manter este ponto em aberto e continuar a Discovery."
        : "Entendi que essa informação ainda não é conhecida. O estado governado permanece em aberto. Você pode fornecer uma definição ou referência aprovada, ou pedir explicitamente para manter este ponto em aberto e continuar a Discovery.")+recorded;
    }else if(conversationProgress.progression==="ACCEPTED_CAPTURE"&&response.conversationEligible){
      response.text=action.kind==="ABSTAIN"&&action.reason==="UNKNOWN_CRITICAL_PENDING"
        ? "A nova informação foi registrada como não verificada, mas ainda não permite determinar se existe uma dependência crítica pendente. Que condição necessária para avaliar as dependências da operação ainda precisa ser esclarecida? Se isso não for conhecido, diga que permanece desconhecido."
        : "As declarações elegíveis foram registradas como não verificadas. "+response.text;
    }else if(conversationProgress.progression==="NONPERSISTED_FOLLOW_UP"||conversationProgress.progression==="FOLLOW_UP"){
      response.intent="CLARIFY";
      response.text=conversationProgress.state.clarificationAttempt>1
        ? "Ainda não é possível determinar se existe uma dependência crítica pendente. Que definição operacional ou referência aprovada poderia esclarecer esse ponto? Se isso continua desconhecido, diga se deseja mantê-lo em aberto e explorar outro tópico."
        : "Essa resposta ainda não permite determinar se existe uma dependência crítica pendente. Que condição operacional ou referência aprovada poderia esclarecer esse estado? Se ainda não for conhecida, você pode dizê-lo explicitamente.";
    }else if(captureResult?.accepted&&response.conversationEligible){
      response.text="As declarações elegíveis foram registradas como não verificadas. "+response.text;
    }
    return ProductConversationResultSchema.parse({action,response,conversationalState:conversationProgress.state});
  }
  async evaluate(input:unknown) {
    const p=ProductHandleSchema.safeParse(input);
    if(!p.success)throw new FoundationError("INVALID_INPUT");
    const current=await this.open(p.data.discoveryId);
    if(!current||current.sessionId!==p.data.sessionId||current.runtimeVersion!==p.data.runtimeVersion)
      throw new FoundationError("CONCURRENT_MODIFICATION");
    const context=await this.resolver.resolve({discoveryId:current.discoveryId,sessionId:current.sessionId});
    if(context.runtimeVersion!==current.runtimeVersion)throw new FoundationError("CONCURRENT_MODIFICATION");
    const candidate=new GovernedOrchestration().evaluate(context);
    if(candidate.kind==="ABSTAIN")return ProductActionSchema.parse(candidate);
    // Never expose free-form rationale, state, source material, prompts or identity.
    const {rationale: _rationale,...safe}=candidate;
    return ProductActionSchema.parse(safe);
  }
}
