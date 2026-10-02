import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateInformationCandidates as generate,evaluateInformationCandidate as evaluate,InformationCandidateSchema } from "../../lib/agent-b/core/information-capture.ts";
import { CANONICAL_INFORMATION as registry } from "../../lib/agent-b/core/canonical-information.ts";
import { ConversationalInformationCapture } from "../../lib/agent-b/application/information-capture.ts";
import { InformationPublication } from "../../lib/agent-b/application/information-publication.ts";
import { ProductRuntime } from "../../lib/agent-b/application/product-runtime.ts";
import { AuthenticatedIdentitySchema,DiscoveryRootSchema,DiscoveryAccessSchema } from "../../lib/agent-b/core/identity-access.ts";
import { DiscoveryRuntimeSchema,SessionSchema,ResumeContextSchema } from "../../lib/agent-b/core/mc04.ts";
import { ConversationalStateSchema,createConversationalState } from "../../lib/agent-b/core/conversational-state.ts";
import type { DiscoveryInformationRecord } from "../../lib/agent-b/core/mc01.ts";
import type { InformationPublication as Publication,InformationPublicationResult } from "../../lib/agent-b/core/information-publication.ts";
import type { IdentityPort } from "../../lib/agent-b/ports/identity.ts";
import type { RuntimePersistencePort } from "../../lib/agent-b/ports/runtime-persistence.ts";
import type { DiscoveryPersistencePort } from "../../lib/agent-b/ports/discovery-persistence.ts";
const id=(n:number)=>`00000000-0000-4000-8000-${String(n).padStart(12,"0")}`,now="2026-09-26T12:00:00Z";
const golden="Estou criando uma loja online. Hoje vendo pelo WhatsApp e controlo o estoque numa planilha. Quero automatizar esse processo, mas não posso ter um custo mensal alto.";
const desiredChange="Para mim, seria útil conseguir ter uma visão mais confiável do estoque disponível e reduzir o risco de vender uma peça sem saber corretamente se ela ainda está disponível.";
const mixedKnownLimits="Hoje temos alguns limites conhecidos: o estoque está dividido fisicamente entre Rio de Janeiro e São Paulo, temos poucas unidades de cada produto e a operação ainda é pequena e manual. Também precisamos manter a primeira versão simples, com baixo custo operacional, sem depender de uma estrutura complexa para funcionar. Algumas regras, como reserva temporária, confirmação de estoque e origem do envio, ainda não estão totalmente definidas.";
const clarificationUnknown="Ainda não sabemos exatamente quais condições ou dependências precisam ser definidas para estruturar essa operação. Sabemos que o estoque está dividido entre Rio de Janeiro e São Paulo e que precisamos controlar a localização e disponibilidade de cada peça, mas as regras operacionais para reserva, confirmação de estoque e origem do envio ainda precisam ser definidas.";
const messages=[
 ["Estou criando uma loja online.","field.subject_context"],
 ["Hoje vendo pelo WhatsApp.","field.current_state"],
 ["Quero automatizar esse processo.","field.desired_state"],
 ["Meu objetivo principal é reduzir a espera.","field.primary_objective"],
 ["Não posso gastar mais de cem reais.","field.constraints"],
 ["Considerarei sucesso quando a espera cair para cinco minutos.","field.success_criteria"],
 ["A aprovação depende de Maria.","field.governance_context"],
];
for(const [message,field] of messages)test(`B14 capture explicit ${field}`,()=>{const candidates=generate(message);assert.equal(candidates.length,1);assert.equal(candidates[0].fieldId,field);assert.equal(evaluate(candidates[0],message,[]).outcome,"ACCEPT_AS_DECLARED");});
test("B14 canonical registry has only approved fields/domains",()=>{assert.equal(Object.keys(registry.fields).length,7);assert.equal(registry.domains.length,6);assert.equal(registry.authority,"HUMAN_GOVERNED_BASELINE");assert.equal(registry.physical['field.subject_context'].domainId,null);});
test("B14 golden independent candidates; no unsupported meaning",()=>{assert.deepEqual(generate(golden).map(c=>c.fieldId),['field.subject_context','field.current_state','field.desired_state','field.constraints']);assert.deepEqual(generate('Olá, obrigado!'),[]);assert.deepEqual(generate('Tal sistema causou nosso problema.'),[]);});
test("B15 desired-change preference is captured verbatim as an eligible desired state",()=>{const candidates=generate(desiredChange);assert.equal(candidates.length,1);assert.equal(candidates[0].fieldId,'field.desired_state');assert.equal(candidates[0].statement,desiredChange);assert.equal(candidates[0].sourceText,desiredChange);assert.equal(evaluate(candidates[0],desiredChange,[]).outcome,'ACCEPT_AS_DECLARED');});
test("GF-008 agenda topic disambiguates only explicitly matched known-limit wording",()=>{
 const withoutTopic=generate(mixedKnownLimits);assert.equal(withoutTopic.length,1);assert.equal(withoutTopic[0].fieldId,'field.current_state');
 const withConstraintsTopic=generate(mixedKnownLimits,'topic.constraints');assert.equal(withConstraintsTopic.length,1);assert.equal(withConstraintsTopic[0].fieldId,'field.constraints');
 assert.equal(withConstraintsTopic[0].statement,mixedKnownLimits.split('. ')[0]);
 assert.equal(generate(mixedKnownLimits,'topic.primary_objective')[0].fieldId,'field.current_state');
 assert.equal(generate(mixedKnownLimits,'invalid-topic' as never)[0].fieldId,'field.current_state');
 assert.equal(generate('Hoje o estoque fica dividido entre duas cidades.','topic.constraints')[0].fieldId,'field.current_state');
 assert.deepEqual(generate('Olá, ainda não há uma declaração de limites.','topic.constraints'),[]);
 const existing=[{fieldId:'field.current_state',content:{value:'Prior stock state'}}] as unknown as DiscoveryInformationRecord[];
 assert.equal(evaluate(withoutTopic[0],mixedKnownLimits,existing).outcome,'REQUIRE_CLARIFICATION');
 assert.match(evaluate(withoutTopic[0],mixedKnownLimits,existing).question!,/nova informação/);
 assert.doesNotMatch(evaluate(withoutTopic[0],mixedKnownLimits,existing).question!,/novo objetivo/);
 assert.equal(evaluate(withConstraintsTopic[0],mixedKnownLimits,existing,'topic.constraints').outcome,'ACCEPT_AS_DECLARED');
});
test("B14 normalization L1 and conservative L2 retain source; L3 rejected",()=>{const message='Hoje vendo  produtos.';const c=generate(message)[0];assert.equal(evaluate(c,message,[]).outcome,'ACCEPT_AS_DECLARED');assert.equal(evaluate({...c,normalization:'SEMANTIC_NORMALIZATION',statement:c.statement.replace(/\s+/g,' ')},message,[]).outcome,'ACCEPT_AS_DECLARED');assert.equal(evaluate({...c,statement:'Hoje perco vendas por falta de automação'},message,[]).outcome,'REQUIRE_CLARIFICATION');assert.equal(InformationCandidateSchema.safeParse({...c,normalization:'SEMANTIC_ENRICHMENT'}).success,false);});
test("B14 preferences clarify; reserved governance outranks ambiguity",()=>{const p='Supabase would be nice.';assert.equal(evaluate(generate(p)[0],p,[]).outcome,'REQUIRE_CLARIFICATION');const h='Autorizo a conclusão, talvez.';assert.equal(evaluate(generate(h)[0],h,[]).outcome,'REQUIRE_HUMAN_DECISION');});
function fixture(){
 const actor=AuthenticatedIdentitySchema.parse({identityId:id(1),kind:'ANONYMOUS'});const identity={current:async()=>actor} as IdentityPort;
 const root=DiscoveryRootSchema.parse({discoveryId:id(2),ownerId:id(1),entityVersion:0,createdAt:now});
 let runtime=DiscoveryRuntimeSchema.parse({discoveryId:id(2),runtimeVersion:0,freshness:'CURRENT',current:{sessionId:id(3),pendingIds:[],informationReferences:[]},pending:[]});
 const session=SessionSchema.parse({sessionId:id(3),discoveryId:id(2),previousSessionId:null,lifecycle:'OPEN',createdAt:now});
 const records:Array<{record:DiscoveryInformationRecord;predecessorRecordId:string|null}>=[];const ops=new Map<string,{request:Publication;result:InformationPublicationResult}>();const events:string[]=[];let fail=false;
 const context={read:async()=>{events.push('read:'+runtime.runtimeVersion);const ids=runtime.current.informationReferences!.flatMap(r=>r.recordIds);return {runtime,session,information:records.filter(r=>ids.includes(r.record.recordId)).map(r=>r.record),classification:null,scope:null,catalog:null,dependencies:null};}};
 const read={byOperation:async(_a:unknown,_d:unknown,op:string)=>records.filter(r=>r.record.sources.some(s=>s.sourceId===op))};
 const writer={publish:async(_actor:unknown,p:Publication)=>{
  events.push('publish');if(fail)throw Error('PROVIDER_UNAVAILABLE');const previous=ops.get(p.operationId);if(previous){assert.deepEqual(p,previous.request);return previous.result;}
  if(p.expectedRuntimeVersion!==runtime.runtimeVersion)throw Error('CONCURRENT_MODIFICATION');
  const refs=structuredClone(runtime.current.informationReferences!);
  for(const c of p.candidates){let ref=refs.find(r=>r.fieldId===c.record.fieldId);if(!ref){ref={fieldId:c.record.fieldId,recordIds:[]};refs.push(ref);}if(c.predecessorRecordId)ref.recordIds=ref.recordIds.filter(r=>r!==c.predecessorRecordId);ref.recordIds.push(c.record.recordId);records.push({record:c.record,predecessorRecordId:c.predecessorRecordId});}
  runtime=DiscoveryRuntimeSchema.parse({...runtime,runtimeVersion:runtime.runtimeVersion+1,current:{...runtime.current,informationReferences:refs}});
  const result={operationId:p.operationId,runtime,records:p.candidates.map(c=>c.record)};ops.set(p.operationId,{request:structuredClone(p),result});return result;
 }};
 const capture=new ConversationalInformationCapture(identity,context,read,new InformationPublication(identity,writer));
 const discovery={readRoot:async()=>root,findAccess:async()=>DiscoveryAccessSchema.parse({discoveryId:id(2),identityId:id(1),role:'OWNER'})} as unknown as DiscoveryPersistencePort;
 const persistence={read:async()=>runtime,listSessions:async()=>[session]} as unknown as RuntimePersistencePort;
 const app=new ProductRuntime(identity,discovery,persistence,context,capture);
 const request=(message:string,op=10,version:number=runtime.runtimeVersion)=>({discoveryId:id(2),sessionId:id(3),runtimeVersion:version,conversation:{message},capture:{operationId:id(op),capturedAt:now}});
 return {app,capture,records,events,request,getRuntime:()=>runtime,fail:()=>{fail=true;}};
}
test("GF-009 occupied SINGLE Fields clarify complement versus correction without accepting replacement",()=>{
 for(const [message,field] of messages.filter(([,field])=>registry.physical[field as keyof typeof registry.physical].cardinality==='SINGLE')){
  const candidate=generate(message)[0];
  const existing=[{fieldId:field,content:{value:'Existing declaration'}}] as unknown as DiscoveryInformationRecord[];
  const result=evaluate(candidate,message,existing);
  assert.equal(candidate.replacement,false);assert.equal(result.outcome,'REQUIRE_CLARIFICATION');
  assert.match(result.question!,/complementa.*corrigi-la\/substituí-la/);assert.equal(result.predecessor,undefined);
 }
});

test("GF-009 current-state agenda preserves blocked governance and zero publication for an occupied Field",async()=>{
 const message="Hoje o controle é feito manualmente. Isabella e Bianca mantêm as informações de estoque e precisam acompanhar quais produtos estão com cada uma, as quantidades disponíveis e as movimentações conforme as peças são vendidas ou reservadas.";
 const state=ConversationalStateSchema.parse({...createConversationalState(id(2),id(3),false),clarificationPhase:'DEFERRED',deferredClarificationIds:['UNKNOWN_CRITICAL_PENDING'],askedTopicIds:['topic.primary_objective','topic.desired_state','topic.success_criteria','topic.subject_context','topic.constraints','topic.current_state'],nextAgendaTopicId:'topic.current_state'});
 const f=fixture();await f.app.converse(f.request('Hoje o estoque está dividido entre duas localidades.',80));
 const before=structuredClone(f.getRuntime()),recordsBefore=structuredClone(f.records),publications=f.events.filter(e=>e==='publish').length;
 const request={...f.request(message,81),conversation:{message,previousPrompt:'DEEPEN' as const},conversationalState:state};
 const result=await f.app.converse(request);
 assert.equal(result.action.kind,'ABSTAIN');assert.equal(result.action.reason,'UNKNOWN_CRITICAL_PENDING');assert.equal(result.action.resolution,'CLARIFY');
 assert.equal(result.response.intent,'CLARIFY');assert.equal(result.response.materialExecutionAllowed,false);
 assert.match(result.response.text,/complementa.*corrigi-la\/substituí-la/);
 assert.equal(result.conversationalState.clarificationPhase,'DEFERRED');assert.equal(result.conversationalState.nextAgendaTopicId,'topic.current_state');
 assert.deepEqual(f.getRuntime(),before);assert.deepEqual(f.records,recordsBefore);assert.equal(f.events.filter(e=>e==='publish').length,publications);
 const replay=await f.app.converse(request);assert.deepEqual(replay,result);assert.deepEqual(f.records,recordsBefore);assert.deepEqual(f.getRuntime(),before);
 const empty=fixture();const accepted=await empty.app.converse({...empty.request(message,82),conversation:{message,previousPrompt:'DEEPEN' as const},conversationalState:state});
 assert.equal(empty.records.length,1);assert.equal(empty.records[0].record.fieldId,'field.current_state');assert.equal(empty.records[0].record.content.value,'Hoje o controle é feito manualmente');
 assert.equal(empty.records[0].record.confidence.level,'UNVERIFIED');assert.equal(accepted.action.runtimeVersion,1);assert.equal(accepted.action.kind,'ABSTAIN');assert.equal(accepted.action.reason,'UNKNOWN_CRITICAL_PENDING');assert.equal(accepted.response.materialExecutionAllowed,false);
});

test("B14 accepted statements go through one MC01 publication; UNVERIFIED and provenance",async()=>{const f=fixture();const p=f.request(golden);const result=await f.app.converse(p);assert.equal(f.records.length,4);assert.equal(result.action.runtimeVersion,1);for(const {record:r} of f.records){assert.equal(r.confidence.level,'UNVERIFIED');assert.deepEqual(r.evidence,[]);assert.ok(r.validation.steps.every(s=>s.result.status==='PENDING'));const source=JSON.parse(r.sources[0].reference);assert.equal(source.sourceType,'USER_STATEMENT');assert.equal(source.speaker,'USER');assert.equal(source.operationId,p.capture.operationId);assert.equal(source.capturedAt,now);assert.equal(source.message,undefined);}assert.match(result.response.text,/não verificada/);assert.equal(result.response.materialExecutionAllowed,false);assert.ok(f.events.lastIndexOf('read:1')>f.events.indexOf('publish'));});
test("B15 desired-change publication advances runtime once and replay does not duplicate it",async()=>{const f=fixture();const p=f.request(desiredChange);const result=await f.app.converse(p);assert.equal(result.action.runtimeVersion,1);assert.equal(f.events.filter(e=>e==='publish').length,1);assert.equal(f.records.length,1);assert.equal(f.getRuntime().runtimeVersion,1);const record=f.records[0].record;assert.equal(record.content.value,desiredChange);assert.equal(record.confidence.level,'UNVERIFIED');const source=JSON.parse(record.sources[0].reference);assert.equal(source.sourceType,'USER_STATEMENT');assert.equal(source.speaker,'USER');assert.equal(source.operationId,p.capture.operationId);assert.equal(source.capturedAt,p.capture.capturedAt);await f.app.converse(p);assert.equal(f.events.filter(e=>e==='publish').length,2);assert.equal(f.records.length,1);assert.equal(f.getRuntime().runtimeVersion,1);});
test("GF-005 accepted current-state capture with UNKNOWN asks a targeted follow-up on replay",async()=>{const f=fixture();const message="Hoje o estoque fica dividido entre duas pessoas e duas localidades: parte está no Rio e parte em São Paulo. O controle é feito manualmente.";const p={...f.request(message),conversation:{message,previousPrompt:"CLARIFY" as const}};const result=await f.app.converse(p);assert.equal(result.action.kind,"ABSTAIN");assert.equal(result.action.reason,"UNKNOWN_CRITICAL_PENDING");assert.equal(result.action.resolution,"CLARIFY");assert.equal(result.action.runtimeVersion,1);assert.equal(result.response.intent,"CLARIFY");assert.match(result.response.text,/registrada como não verificada/);assert.match(result.response.text,/não permite determinar se existe uma dependência crítica pendente/);assert.doesNotMatch(result.response.text,/Que informações sobre as dependências da operação podem esclarecer esse estado\?/);assert.equal(f.records.length,1);assert.equal(f.records[0].record.fieldId,"field.current_state");assert.equal(f.records[0].record.confidence.level,"UNVERIFIED");assert.ok(f.events.lastIndexOf('read:1')>f.events.indexOf('publish'));const replay=await f.app.converse(p);assert.equal(replay.action.runtimeVersion,1);assert.deepEqual(replay.action,result.action);assert.equal(replay.response.text,result.response.text);assert.equal(f.records.length,1);assert.equal(f.getRuntime().runtimeVersion,1);});
test("GF-008 agenda hint disambiguates supported limits without replacing current state",async()=>{
 const initialMessage="Hoje o estoque da Sallma fica dividido entre Rio de Janeiro e São Paulo.";
 const noHint=fixture();await noHint.app.converse(noHint.request(initialMessage,40));const existingRecord=noHint.records[0].record;
 const noHintRequest={...noHint.request(mixedKnownLimits,41,1),conversation:{message:mixedKnownLimits,previousPrompt:"CLARIFY" as const}};
 const collision=await noHint.app.converse(noHintRequest);
 assert.equal(collision.action.runtimeVersion,1);assert.equal(collision.response.intent,"CLARIFY");
 assert.match(collision.response.text,/Já existe uma declaração atual/);assert.doesNotMatch(collision.response.text,/novo objetivo/);
 assert.equal(noHint.records.length,1);assert.equal(noHint.records[0].record.recordId,existingRecord.recordId);assert.equal(noHint.getRuntime().runtimeVersion,1);
 const mismatched=await noHint.app.converse({...noHintRequest,capture:{operationId:id(42),capturedAt:now},conversationalState:{schemaVersion:1,agendaVersion:1,discoveryId:id(99),sessionId:id(3),activeClarificationId:null,clarificationPhase:"DEFERRED",deferredClarificationIds:["UNKNOWN_CRITICAL_PENDING"],askedTopicIds:["topic.constraints"],nextAgendaTopicId:"topic.constraints",clarificationAttempt:0,unknownDeclarationCount:0}});
 assert.equal(mismatched.action.runtimeVersion,1);assert.equal(mismatched.response.intent,"CLARIFY");assert.equal(noHint.records.length,1);

 const guided=fixture();await guided.app.converse(guided.request(initialMessage,50));const guidedExistingRecord=guided.records[0].record;
 const base=createConversationalState(id(2),id(3),false);
 const state=ConversationalStateSchema.parse({...base,clarificationPhase:"DEFERRED",deferredClarificationIds:["UNKNOWN_CRITICAL_PENDING"],
     askedTopicIds:["topic.primary_objective","topic.desired_state","topic.success_criteria","topic.subject_context","topic.constraints"],nextAgendaTopicId:"topic.constraints"});
 const request={...guided.request(mixedKnownLimits,51,1),conversation:{message:mixedKnownLimits,previousPrompt:"CLARIFY" as const},conversationalState:state};
 const result=await guided.app.converse(request);
 assert.equal(result.action.kind,"ABSTAIN");assert.equal(result.action.reason,"UNKNOWN_CRITICAL_PENDING");assert.equal(result.action.runtimeVersion,2);
 assert.equal(result.response.intent,"DEEPEN");assert.match(result.response.text,/continua em aberto; nenhuma resolução foi presumida/);
 assert.equal(guided.records.length,2);assert.equal(guided.records[0].record.recordId,guidedExistingRecord.recordId);
 assert.equal(guided.records[1].record.fieldId,"field.constraints");assert.equal(guided.records[1].record.content.value,mixedKnownLimits.split(". ")[0]);
 assert.equal(guided.records[1].record.confidence.level,"UNVERIFIED");assert.deepEqual(guided.records[1].record.evidence,[]);
 assert.equal(guided.getRuntime().runtimeVersion,2);assert.equal(guided.events.filter(event=>event==="publish").length,2);
});
test("GF-007 full Golden Case defers the unknown axis and continues the bounded agenda",async()=>{
 const f=fixture();
 const firstMessage="Quero estruturar uma operação de estoque para a Sallma.";
 const first=await f.app.converse(f.request(firstMessage,20));
 assert.equal(first.action.kind,"ABSTAIN");assert.equal(first.action.reason,"UNKNOWN_CRITICAL_PENDING");assert.equal(first.action.runtimeVersion,0);
 assert.equal(first.conversationalState.clarificationPhase,"INITIAL");assert.equal(first.response.intent,"CLARIFY");
 const currentState="Hoje o estoque da Sallma fica dividido entre duas pessoas e duas localidades: parte está com a Isabella no Rio de Janeiro e outra parte com a Bianca em São Paulo. O controle é feito manualmente.";
 const second=await f.app.converse({...f.request(currentState,21),conversation:{message:currentState,previousPrompt:"CLARIFY"},conversationalState:first.conversationalState});
 assert.equal(second.action.kind,"ABSTAIN");assert.equal(second.action.reason,"UNKNOWN_CRITICAL_PENDING");assert.equal(second.action.runtimeVersion,1);
 assert.equal(second.conversationalState.clarificationPhase,"FOLLOW_UP");assert.equal(f.records.length,1);assert.equal(f.records[0].record.fieldId,"field.current_state");
 const unknownAndDefer="Neste momento essas definições ainda não são conhecidas. Vamos manter esse ponto em aberto sem presumir uma resolução e continuar levantando as demais informações necessárias para estruturar a operação da Sallma.";
 assert.deepEqual(generate(unknownAndDefer),[]);
 const thirdRequest={...f.request(unknownAndDefer,22),conversation:{message:unknownAndDefer,previousPrompt:"CLARIFY" as const},conversationalState:second.conversationalState};
 const third=await f.app.converse(thirdRequest);
 assert.deepEqual(third.action,second.action);assert.equal(third.action.runtimeVersion,1);assert.equal(third.action.reason,"UNKNOWN_CRITICAL_PENDING");
 assert.equal(third.response.intent,"DEEPEN");assert.equal(third.response.materialExecutionAllowed,false);
 assert.equal(third.conversationalState.clarificationPhase,"DEFERRED");assert.equal(third.conversationalState.activeClarificationId,null);
 assert.equal(third.conversationalState.deferredClarificationIds[0],"UNKNOWN_CRITICAL_PENDING");assert.equal(third.conversationalState.nextAgendaTopicId,"topic.primary_objective");
 assert.match(third.response.text,/continua em aberto; nenhuma resolução foi presumida/);assert.match(third.response.text,/principal resultado/);
 assert.doesNotMatch(third.response.text,/resolvido|aprovado|verificado/);assert.doesNotMatch(JSON.stringify(third.conversationalState),/Neste momento essas definições|Sallma/);assert.equal(f.records.length,1);assert.equal(f.getRuntime().runtimeVersion,1);
 const changedHint=await f.app.converse({...thirdRequest,conversation:{message:unknownAndDefer,previousPrompt:"HUMAN_REVIEW"}});
 assert.deepEqual(changedHint.action,third.action);assert.deepEqual(changedHint.conversationalState,third.conversationalState);assert.equal(changedHint.response.text,third.response.text);
 const objective="Meu objetivo principal é permitir que clientes recebam os produtos disponíveis com segurança.";
 const fourth=await f.app.converse({...f.request(objective,23),conversation:{message:objective,previousPrompt:"DEEPEN"},conversationalState:third.conversationalState});
 assert.equal(fourth.action.kind,"ABSTAIN");assert.equal(fourth.action.reason,"UNKNOWN_CRITICAL_PENDING");assert.equal(fourth.action.runtimeVersion,2);
 assert.equal(fourth.conversationalState.clarificationPhase,"DEFERRED");assert.equal(fourth.conversationalState.nextAgendaTopicId,"topic.desired_state");
 assert.equal(f.records.length,2);assert.equal(f.records[1].record.fieldId,"field.primary_objective");assert.equal(f.records[1].record.confidence.level,"UNVERIFIED");
 assert.match(fourth.response.text,/continua em aberto; nenhuma resolução foi presumida/);assert.equal(fourth.response.materialExecutionAllowed,false);
 assert.equal(f.events.filter(e=>e==='publish').length,2);
});
test("GF-006 zero-candidate follow-up varies wording without changing governed state",async()=>{const f=fixture();const opening=await f.app.converse(f.request("Quero estruturar uma operação para a Sallma.",31));assert.equal(opening.action.kind,"ABSTAIN");assert.equal(opening.action.runtimeVersion,0);assert.equal(opening.response.intent,"CLARIFY");assert.match(opening.response.text,/Que informações sobre as dependências da operação podem esclarecer esse estado/);const clarification="Ainda precisamos entender quais definições operacionais existem.";assert.deepEqual(generate(clarification),[]);const request={...f.request(clarification,32),conversation:{message:clarification,previousPrompt:"CLARIFY" as const},conversationalState:opening.conversationalState};const result=await f.app.converse(request);assert.deepEqual(result.action,opening.action);assert.equal(result.response.intent,"CLARIFY");assert.match(result.response.text,/Essa resposta ainda não permite determinar/);assert.doesNotMatch(result.response.text,/A nova informação foi registrada/);assert.equal(f.records.length,0);assert.equal(f.events.includes('publish'),false);assert.equal(f.getRuntime().runtimeVersion,0);});
test("B14 replay returns through writer without duplicate, changed operation rejected",async()=>{const f=fixture();const p=f.request(golden);await f.app.converse(p);await f.app.converse(p);assert.equal(f.records.length,4);assert.equal(f.getRuntime().runtimeVersion,1);await assert.rejects(()=>f.app.converse({...p,conversation:{message:'Hoje vendo livros.'}}),/CONCURRENT_MODIFICATION/);});
test("B14 publication/provider failure cannot project accepted state",async()=>{const f=fixture();f.fail();await assert.rejects(()=>f.app.converse(f.request(golden)),/PROVIDER_UNAVAILABLE/);assert.equal(f.records.length,0);assert.equal(f.getRuntime().runtimeVersion,0);});
test("B14 ambiguous and governance candidates remain unpersisted",async()=>{const f=fixture();for(const message of ['Supabase would be nice.','Autorizo o handoff.']){const result=await f.app.converse(f.request(message));assert.equal(result.response.materialExecutionAllowed,false);assert.match(result.response.text,/preferência|decisão humana/);}assert.equal(f.records.length,0);assert.equal(f.getRuntime().runtimeVersion,0);});
test("B15 unsupported user wording does not publish or advance runtime",async()=>{const f=fixture();const result=await f.app.converse(f.request('A previsão ficou ruim no feriado.'));assert.equal(f.records.length,0);assert.equal(f.events.includes('publish'),false);assert.equal(f.getRuntime().runtimeVersion,0);assert.match(result.response.text,/Que informações sobre as dependências da operação podem esclarecer esse estado/);assert.doesNotMatch(result.response.text,/A nova informação foi registrada/);});
test("B14 explicit replacement preserves history; ambiguous SINGLE conflict asks",async()=>{const f=fixture();await f.app.converse(f.request('Meu objetivo é reduzir espera.'));const original=f.records[0].record;const clarify=await f.app.converse(f.request('Meu objetivo é aumentar vendas.',11));assert.equal(clarify.response.intent,'CLARIFY');assert.equal(f.records.length,1);await f.app.converse(f.request('Meu novo objetivo é aumentar vendas.',12));assert.equal(f.records.length,2);assert.equal(f.records[1].predecessorRecordId,original.recordId);assert.notEqual(f.records[1].record.recordId,original.recordId);assert.equal(f.records[1].record.entityVersion,1);});
test("B14 MULTIPLE is additive; stale CAS is not silently rebased",async()=>{const f=fixture();await f.app.converse(f.request('Não posso ter custo alto.'));await f.app.converse(f.request('O limite é dez dias.',11));assert.equal(f.getRuntime().current.informationReferences![0].recordIds.length,2);await assert.rejects(()=>f.app.converse(f.request('Hoje vendo livros.',12,0)),/CONCURRENT_MODIFICATION/);assert.equal(f.records.length,2);});
test("B14 current references reconstruct Resume without transcript",async()=>{const f=fixture();await f.app.converse(f.request(golden));const r=f.getRuntime();const resumed=ResumeContextSchema.parse({discoveryId:r.discoveryId,runtimeVersion:r.runtimeVersion,current:r.current,pending:r.pending,previousSessionId:id(3)});assert.equal(resumed.current.informationReferences!.length,4);assert.equal('messages' in resumed,false);});
test("B14 capture uses no AI/provider bypass or Agent R runtime",()=>{const source=readFileSync('lib/agent-b/application/information-capture.ts','utf8');assert.doesNotMatch(source,/gemini|fetch\(|AgentR|agente-r|transcript/);const route=readFileSync('lib/agent-b/infrastructure/product-route.server.ts','utf8');assert.match(route,/SupabaseInformationPublication/);assert.doesNotMatch(route,/console\.log|service_role/);});
test("B14 potentially conflicting MULTIPLE declarations require clarification",async()=>{const f=fixture();await f.app.converse(f.request('Não posso usar Supabase.'));const response=await f.app.converse(f.request('É obrigatório usar Supabase.',11));assert.equal(response.response.intent,'CLARIFY');assert.equal(f.records.length,1);const fresh=fixture();await fresh.app.converse(fresh.request('Não posso usar Supabase. É obrigatório usar Supabase.'));assert.equal(fresh.records.length,0);});
