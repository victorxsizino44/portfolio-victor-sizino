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
    const {conversation,capture,...handle}=p.data;
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
    const pending=captureResult?.evaluations.find(e=>e.outcome==="REQUIRE_HUMAN_DECISION")??captureResult?.evaluations.find(e=>e.outcome==="REQUIRE_CLARIFICATION");
    if(pending&&response.conversationEligible&&!(action.kind==="SUBSTANTIVE"&&(action.progression==="BLOCK"||action.requiresHumanDecision))){
      response.intent=pending.outcome==="REQUIRE_HUMAN_DECISION"?"HUMAN_REVIEW":"CLARIFY";
      response.text=pending.question!;
    }else if(captureResult?.accepted&&response.conversationEligible){
      response.text=action.kind==="ABSTAIN"&&action.reason==="UNKNOWN_CRITICAL_PENDING"
        ? "A nova informação foi registrada como não verificada, mas ainda não permite determinar se existe uma dependência crítica pendente. Que condição necessária para avaliar as dependências da operação ainda precisa ser esclarecida? Se isso não for conhecido, diga que permanece desconhecido."
        : "As declarações elegíveis foram registradas como não verificadas. "+response.text;
    }else if(captureResult?.accepted===0&&captureResult.evaluations.length===0&&action.kind==="ABSTAIN"&&
      action.reason==="UNKNOWN_CRITICAL_PENDING"&&conversation?.previousPrompt==="CLARIFY"){
      response.text="Entendi. O estado governado continua sem determinar se existe uma dependência crítica pendente. Se houver uma definição ou referência aprovada sobre essas condições, informe-a; se ainda não for conhecida, podemos manter esse ponto em aberto sem presumir resolução.";
    }
    return ProductConversationResultSchema.parse({action,response});
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
