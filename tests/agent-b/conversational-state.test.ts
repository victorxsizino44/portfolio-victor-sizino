import assert from "node:assert/strict";
import test from "node:test";
import { conversationStateReducer, readStoredConversationalState, writeStoredConversationalState } from "../../app/components/agent-b/conversation-state-client.ts";
import { ActionCandidateSchema } from "../../lib/agent-b/core/mc03.ts";
import {
  AgendaTopicIdSchema, classifyExplicitUnknown, createConversationalState, parseBoundConversationalState,
  PHASE_1_DISCOVERY_AGENDA, transitionConversationalState,
} from "../../lib/agent-b/core/conversational-state.ts";
import { ProductHandleSchema } from "../../lib/agent-b/core/product-runtime.ts";
import { InformationCandidateSchema } from "../../lib/agent-b/core/information-capture.ts";

const discoveryId="00000000-0000-4000-8000-000000000001";
const sessionId="00000000-0000-4000-8000-000000000002";
const otherSessionId="00000000-0000-4000-8000-000000000003";
const handle=ProductHandleSchema.parse({discoveryId,sessionId,runtimeVersion:0});
const unknownAction=ActionCandidateSchema.parse({kind:"ABSTAIN",discoveryId,runtimeVersion:0,reason:"UNKNOWN_CRITICAL_PENDING",resolution:"CLARIFY"});
const resolvedAction=ActionCandidateSchema.parse({kind:"SUBSTANTIVE",discoveryId,runtimeVersion:0,interaction:"EXPLORE",navigation:"TRANSITION",progression:"CONTINUE",rationale:"test",requiresHumanDecision:false});
const transition=(patch:Partial<Parameters<typeof transitionConversationalState>[0]>={})=>transitionConversationalState({
  prior:undefined,discoveryId,sessionId,action:unknownAction,message:"",acceptedCapture:0,evaluations:[],...patch,
});

test("GF-007 agenda is explicitly versioned, allow-listed, and deterministically ordered",()=>{
  assert.equal(PHASE_1_DISCOVERY_AGENDA.length,6);
  assert.deepEqual(PHASE_1_DISCOVERY_AGENDA.map(topic=>topic.id),[
    "topic.primary_objective","topic.desired_state","topic.success_criteria",
    "topic.subject_context","topic.constraints","topic.current_state",
  ]);
  assert.ok(PHASE_1_DISCOVERY_AGENDA.every(topic=>AgendaTopicIdSchema.safeParse(topic.id).success));
});

test("GF-007 explicit unknown and explicit deferral are distinct bounded signals",()=>{
  assert.deepEqual(classifyExplicitUnknown("Ainda não sabemos quais condições se aplicam."),{unknown:true,defer:false});
  assert.deepEqual(classifyExplicitUnknown("Isso ainda não foi definido."),{unknown:true,defer:false});
  assert.deepEqual(classifyExplicitUnknown("Ainda não sabemos. Vamos manter em aberto e continuar a Discovery."),{unknown:true,defer:true});
  assert.deepEqual(classifyExplicitUnknown("Não temos essa informação. Vamos seguir com outras informações."),{unknown:true,defer:true});
  assert.deepEqual(classifyExplicitUnknown("Isso ainda não foi definido. Vamos voltar nisso depois."),{unknown:true,defer:true});
  assert.deepEqual(classifyExplicitUnknown("Podemos deixar essa questão em aberto por enquanto e continuar a Discovery."),{unknown:false,defer:true});
  assert.deepEqual(classifyExplicitUnknown("Vamos manter esse ponto em aberto e continuar levantando as demais informações."),{unknown:false,defer:true});
  assert.deepEqual(classifyExplicitUnknown("Ainda não sabemos essa definição. Vamos manter esse ponto em aberto e continuar a Discovery."),{unknown:true,defer:true});
});

test("GF-007 quoted or hypothetical unknown wording is not classified as a user declaration",()=>{
  assert.deepEqual(classifyExplicitUnknown("Ela escreveu: ‘Ainda não sabemos se isso se aplica.’"),{unknown:false,defer:false});
  assert.deepEqual(classifyExplicitUnknown("Se ainda não sabemos, talvez devêssemos esperar."),{unknown:false,defer:false});
  assert.deepEqual(classifyExplicitUnknown("Não quero deixar isso em aberto."),{unknown:false,defer:false});
  assert.deepEqual(classifyExplicitUnknown("Não sabemos onde a peça está."),{unknown:true,defer:false});
});

test("GF-007 missing state initializes from governed UNKNOWN without changing its action",()=>{
  const actionBefore=structuredClone(unknownAction);
  const result=transition();
  assert.equal(result.progression,"INITIAL");
  assert.equal(result.state.activeClarificationId,"UNKNOWN_CRITICAL_PENDING");
  assert.equal(result.state.clarificationPhase,"INITIAL");
  assert.deepEqual(unknownAction,actionBefore);
});

test("GF-007 accepted capture advances only conversational phase; later no-candidate turn defers to agenda",()=>{
  const initial=transition();
  const captured=transition({prior:initial.state,acceptedCapture:1});
  assert.equal(captured.progression,"ACCEPTED_CAPTURE");
  assert.equal(captured.state.clarificationPhase,"FOLLOW_UP");
  const deferred=transition({prior:captured.state,message:"Ainda não sabemos. Vamos manter esse ponto em aberto e continuar a Discovery."});
  assert.equal(deferred.progression,"DEFERRED");
  assert.equal(deferred.state.activeClarificationId,null);
  assert.equal(deferred.state.clarificationPhase,"DEFERRED");
  assert.equal(deferred.state.deferredClarificationIds[0],"UNKNOWN_CRITICAL_PENDING");
  assert.equal(deferred.state.nextAgendaTopicId,"topic.primary_objective");
  assert.deepEqual(deferred.state.askedTopicIds,["topic.primary_objective"]);
  assert.deepEqual(unknownAction,{...actionVersion0(),runtimeVersion:0});
});

function actionVersion0(){return {kind:"ABSTAIN" as const,discoveryId,runtimeVersion:0,reason:"UNKNOWN_CRITICAL_PENDING" as const,resolution:"CLARIFY" as const};}

test("GF-007 user-stated unknown without deferral does not silently defer or resolve",()=>{
  const initial=transition();
  const result=transition({prior:initial.state,message:"Não temos essa informação agora."});
  assert.equal(result.progression,"USER_STATED_UNKNOWN");
  assert.equal(result.state.clarificationPhase,"USER_STATED_UNKNOWN");
  assert.equal(result.state.activeClarificationId,"UNKNOWN_CRITICAL_PENDING");
  assert.deepEqual(result.state.deferredClarificationIds,[]);
});

test("GF-007 explicit defer signal on the active clarification is sufficient, unknown alone is not",()=>{
  const initial=transition();
  const unknown=transition({prior:initial.state,message:"Não sabemos essa condição."});
  assert.equal(unknown.state.clarificationPhase,"USER_STATED_UNKNOWN");
  const deferred=transition({prior:unknown.state,message:"Vamos manter em aberto e seguir com outras informações."});
  assert.equal(deferred.state.clarificationPhase,"DEFERRED");
  assert.equal(deferred.state.activeClarificationId,null);
  assert.equal(deferred.state.deferredClarificationIds[0],"UNKNOWN_CRITICAL_PENDING");
  assert.equal(deferred.state.unknownDeclarationCount,1);
  const deferOnly=transition({prior:initial.state,message:"Vamos manter em aberto e seguir com outras informações."});
  assert.equal(deferOnly.state.clarificationPhase,"DEFERRED");
  assert.equal(deferOnly.state.unknownDeclarationCount,0);
});

test("GF-007 repeated unknown stays bounded and deferred agenda skips already asked topics",()=>{
  let result=transition({message:"Ainda não sabemos. Vamos manter esse ponto em aberto e seguir com outras informações."});
  result=transition({prior:result.state,message:"Ainda não sabemos."});
  assert.equal(result.progression,"AGENDA_CONTINUATION");
  assert.equal(result.state.clarificationPhase,"DEFERRED");
  assert.equal(result.state.activeClarificationId,null);
  assert.equal(result.state.nextAgendaTopicId,"topic.desired_state");
  assert.deepEqual(result.state.askedTopicIds,["topic.primary_objective","topic.desired_state"]);
});

test("GF-007 next topic selection is only presentation state and preserves ABSTAIN",()=>{
  const deferred=transition({message:"Ainda não sabemos. Vamos deixar o ponto em aberto e continuar a Discovery."});
  const actionBefore=structuredClone(unknownAction);
  const next=transition({prior:deferred.state,message:"Meu objetivo ainda não está definido."});
  assert.equal(next.state.nextAgendaTopicId,"topic.desired_state");
  assert.deepEqual(unknownAction,actionBefore);
  assert.equal(unknownAction.kind,"ABSTAIN");
  assert.equal(unknownAction.reason,"UNKNOWN_CRITICAL_PENDING");
});

test("GF-007 valid but manipulated agenda state cannot change the governed action",()=>{
  const manipulated={...createConversationalState(discoveryId,sessionId),askedTopicIds:PHASE_1_DISCOVERY_AGENDA.map(topic=>topic.id)};
  const actionBefore=structuredClone(unknownAction);
  const result=transition({prior:manipulated});
  assert.equal(result.state.nextAgendaTopicId,null);
  assert.deepEqual(unknownAction,actionBefore);
  assert.equal(unknownAction.kind,"ABSTAIN");
  assert.equal(unknownAction.reason,"UNKNOWN_CRITICAL_PENDING");
});

test("GF-007 capture clarification does not reactivate a deferred dependency axis",()=>{
  const deferred=transition({message:"Ainda não sabemos. Vamos manter em aberto e continuar a Discovery."});
  const candidate=InformationCandidateSchema.parse({fieldId:"field.current_state",statement:"Hoje o estoque é manual.",sourceText:"Hoje o estoque é manual.",normalization:"VERBATIM",replacement:false});
  const result=transition({prior:deferred.state,evaluations:[{candidate,outcome:"REQUIRE_CLARIFICATION",question:"Que tipo de operação?"}]});
  assert.equal(result.progression,"CAPTURE_CLARIFICATION");
  assert.equal(result.state.clarificationPhase,"DEFERRED");
  assert.equal(result.state.activeClarificationId,null);
  assert.equal(result.state.nextAgendaTopicId,deferred.state.nextAgendaTopicId);
});

test("GF-007 governed action changes clear active clarification but do not invent resolution",()=>{
  const deferred=transition({message:"Ainda não sabemos. Vamos manter em aberto e continuar a Discovery."});
  const result=transition({prior:deferred.state,action:resolvedAction});
  assert.equal(result.progression,"GOVERNED_ACTION");
  assert.equal(result.state.activeClarificationId,null);
  assert.equal(result.state.clarificationPhase,"NONE");
  assert.equal(result.state.deferredClarificationIds[0],"UNKNOWN_CRITICAL_PENDING");
});

test("GF-007 malformed, unsupported, and misbound client state is rejected for reset",()=>{
  const initial=createConversationalState(discoveryId,sessionId);
  assert.equal(parseBoundConversationalState({...initial,schemaVersion:999},discoveryId,sessionId),null);
  assert.equal(parseBoundConversationalState({...initial,askedTopicIds:["attacker-topic"]},discoveryId,sessionId),null);
  assert.equal(parseBoundConversationalState(initial,"00000000-0000-4000-8000-000000000004",sessionId),null);
  assert.equal(parseBoundConversationalState(initial,discoveryId,otherSessionId),null);
  assert.equal(parseBoundConversationalState(undefined,discoveryId,sessionId),null);
  assert.equal(parseBoundConversationalState({...initial,askedTopicIds:[...PHASE_1_DISCOVERY_AGENDA.map(topic=>topic.id),"topic.extra"] as string[]},discoveryId,sessionId),null);
  assert.equal(parseBoundConversationalState({...initial,clarificationAttempt:6},discoveryId,sessionId),null);
});

test("GF-007 client hydration removes malformed or stale state and keeps only same-session state",()=>{
  const values=new Map<string,string>();
  const storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);},removeItem:(key:string)=>{values.delete(key);}};
  const initial=createConversationalState(discoveryId,sessionId);
  writeStoredConversationalState(storage,initial);
  assert.deepEqual(readStoredConversationalState(storage,handle),initial);
  const newSession=ProductHandleSchema.parse({discoveryId,sessionId:otherSessionId,runtimeVersion:1});
  assert.equal(readStoredConversationalState(storage,newSession),null);
  assert.equal(values.size,0);
  values.set(`agent-b-conversation-state:${discoveryId}`,"not-json");
  assert.equal(readStoredConversationalState(storage,handle),null);
  assert.equal(values.size,0);
  assert.equal(conversationStateReducer(initial,{type:"replace",state:null}),null);
});