import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { bindingOf, DomainBindingSchema } from "../../lib/agent-b/core/domain-binding.ts";
import { DiscoveryInformationRecordSchema, FieldContractSchema, VALIDATION_PIPELINE } from "../../lib/agent-b/core/mc01.ts";
import { InformationReferencesSchema, resolveInformationReferences, currentRecordIds } from "../../lib/agent-b/core/current-information.ts";
import { INFORMATION_FIELDS } from "../../lib/agent-b/core/information-cardinality.ts";
import { InformationPublicationSchema } from "../../lib/agent-b/core/information-publication.ts";
import { InformationPublication } from "../../lib/agent-b/application/information-publication.ts";
import { SupabaseInformationPublication } from "../../lib/agent-b/infrastructure/supabase/information-publication.server.ts";
import { SupabaseRuntimePersistence } from "../../lib/agent-b/infrastructure/supabase/runtime-persistence.server.ts";
import { deriveWorkingBriefing, HandoffSchema } from "../../lib/agent-b/core/handoff.ts";
import { DiscoveryRuntimeSchema, ResumeContextSchema } from "../../lib/agent-b/core/mc04.ts";
import { deriveGovernedContext } from "../../lib/agent-b/application/governed-context.ts";
import { GovernedContextSnapshotSchema, ContextRequestSchema } from "../../lib/agent-b/ports/governed-context.ts";
import { AuthenticatedIdentitySchema } from "../../lib/agent-b/core/identity-access.ts";
import type { IdentityPort } from "../../lib/agent-b/ports/identity.ts";

const d="00000000-0000-4000-8000-000000000001",op="00000000-0000-4000-8000-000000000002",cid="00000000-0000-4000-8000-000000000003";
const now="2026-09-25T12:00:00Z";
function record(id="r",fieldId="field.subject_context") {
  const f=INFORMATION_FIELDS[fieldId as keyof typeof INFORMATION_FIELDS];
  return DiscoveryInformationRecordSchema.parse({recordId:id,discoveryId:d,fieldId,domainBinding:f.domainId?{kind:"DOMAIN",domainId:f.domainId}:{kind:"CORE_NEUTRAL"},entityVersion:0,
    content:{kind:"STATEMENT",value:"Synthetic declared information"},sources:[],evidence:[],confidence:{level:"UNVERIFIED",sources:[]},validation:{steps:VALIDATION_PIPELINE.map(stage=>({stage,result:{status:"PENDING"}}))}});
}
function publication(){return InformationPublicationSchema.parse({discoveryId:d,operationId:op,expectedRuntimeVersion:0,capturedAt:now,candidates:[{candidateId:cid,record:record(),predecessorRecordId:null,expectedEntityVersion:null}]});}
function runtime(){return DiscoveryRuntimeSchema.parse({discoveryId:d,runtimeVersion:1,freshness:"CURRENT",current:{informationReferences:[{fieldId:"field.subject_context",recordIds:["r"]}],sessionId:"s",pendingIds:[]},pending:[]});}
const identity={current:async()=>AuthenticatedIdentitySchema.parse({identityId:"actor",kind:"ANONYMOUS"})} as IdentityPort;

test("B14 physical DOMAIN and CORE_NEUTRAL are explicit, missing is never neutral",()=>{
  assert.deepEqual(bindingOf({domainId:"legacy"}),{kind:"DOMAIN",domainId:"legacy"});
  assert.deepEqual(bindingOf({domainBinding:{kind:"CORE_NEUTRAL"}}),{kind:"CORE_NEUTRAL"});
  for(const x of [null,{kind:"UNRESOLVED"},{kind:"CORE_NEUTRAL",domainId:"invented"}])assert.equal(DomainBindingSchema.safeParse(x).success,false);
  const r=record();delete r.domainBinding;assert.equal(DiscoveryInformationRecordSchema.safeParse(r).success,false);
  assert.throws(()=>bindingOf({}));
});
test("B14 coexistence binding requires exact equivalence; FieldContract also supports neutral",()=>{
  assert.equal(DiscoveryInformationRecordSchema.safeParse({...record(),domainId:"domain.identity"}).success,false);
  assert.equal(FieldContractSchema.safeParse({fieldId:"field.subject_context",domainBinding:{kind:"CORE_NEUTRAL"},entityVersion:0,informationRecordIds:[],completion:{level:"FIELD",status:"INCOMPLETE",dependencies:[]}}).success,true);
});
test("B14 SINGLE/MULTIPLE and canonical ordering across independent Fields",()=>{
  const refs=InformationReferencesSchema.parse([{fieldId:"field.subject_context",recordIds:["s"]},{fieldId:"field.constraints",recordIds:["b","a"]}]);
  assert.deepEqual(refs.map(r=>r.recordIds),[["a","b"],["s"]]);
  assert.equal(InformationReferencesSchema.safeParse([{fieldId:"field.current_state",recordIds:["a","b"]}]).success,false);
  assert.equal(InformationReferencesSchema.safeParse([{fieldId:"field.constraints",recordIds:[]}]).success,true);
});
test("B14 duplicate Fields and duplicate IDs rejected including across Fields",()=>{
  for(const refs of [[{fieldId:"f",recordIds:[]},{fieldId:"f",recordIds:[]}],[{fieldId:"f",recordIds:["r","r"]}],[{fieldId:"f",recordIds:["r"]},{fieldId:"g",recordIds:["r"]}]])assert.equal(InformationReferencesSchema.safeParse(refs).success,false);
});
test("B14 legacy reference resolves authorized Field, absent is empty, history is not inferred",()=>{
  assert.deepEqual(resolveInformationReferences({informationRecordId:"r"},[record()],d),runtime().current.informationReferences);
  assert.deepEqual(resolveInformationReferences({},[record()],d),[]);
  assert.throws(()=>resolveInformationReferences({informationRecordId:"missing"},[record()],d));
});
test("B14 reference integrity rejects foreign Discovery and wrong Field",()=>{
  assert.throws(()=>resolveInformationReferences(runtime().current,[{...record(),discoveryId:"foreign"}],d));
  assert.throws(()=>resolveInformationReferences(runtime().current,[record("r","field.current_state")],d));
});
test("B14 dual references must be equivalent, never silently prioritize",()=>{
  assert.deepEqual(resolveInformationReferences({...runtime().current,informationRecordId:"r"},[record()],d),runtime().current.informationReferences);
  assert.throws(()=>resolveInformationReferences({...runtime().current,informationRecordId:"other"},[record(),record("other")],d));
  assert.throws(()=>currentRecordIds({...runtime().current,informationRecordId:"other"}));
});
test("B14 accepted set supports independent candidates and explicit distinct predecessor",()=>{
  const p=publication();p.candidates.push({...p.candidates[0],candidateId:"00000000-0000-4000-8000-000000000004",record:record("second","field.constraints")});
  assert.equal(InformationPublicationSchema.safeParse(p).success,true);
  p.candidates[0]={...p.candidates[0],predecessorRecordId:"old" as never,expectedEntityVersion:0 as never,record:{...record(),entityVersion:1 as never}};
  assert.equal(InformationPublicationSchema.safeParse(p).success,true);
  p.candidates[0].predecessorRecordId="r" as never;assert.equal(InformationPublicationSchema.safeParse(p).success,false);
});
test("B14 unknown Field, wrong binding and in-set predecessor rejected",()=>{
  for(const recordOverride of [{fieldId:"invented"},{domainBinding:{kind:"DOMAIN",domainId:"domain.identity"}},{discoveryId:"foreign"}]){
    const p=publication();assert.equal(InformationPublicationSchema.safeParse({...p,candidates:[{...p.candidates[0],record:{...p.candidates[0].record,...recordOverride}}]}).success,false);
  }
});
test("B14 malformed sets fail before persistence; unauthenticated publication denied",async()=>{
  let calls=0;const port={publish:async()=>{calls++;throw new Error("unexpected");}};
  await assert.rejects(()=>new InformationPublication(identity,port).publish({...publication(),expectedRuntimeVersion:-1}),/INVALID_INPUT/);
  await assert.rejects(()=>new InformationPublication({current:async()=>null} as IdentityPort,port).publish(publication()),/AUTHENTICATION_REQUIRED/);
  assert.equal(calls,0);
});
test("B14 physical publication preserves supported validation without granting human approval",()=>{
  const p=publication();
  p.candidates[0].record.validation.steps[0].result={status:"PASSED",source:{sourceId:"capture" as never,reference:"technical capture"},recordedAt:now as never};
  assert.equal(InformationPublicationSchema.safeParse(p).success,true);
  p.candidates[0].record.validation.steps[5].result={status:"PASSED",decision:{decisionId:"fabricated" as never,source:{sourceId:"s" as never,reference:"not authority"},recordedAt:now as never}};
  assert.equal(InformationPublicationSchema.safeParse(p).success,false);
});
test("B14 service normalizes legacy binding without inventing neutral, retains stable replay input",async()=>{
  const p=publication();p.candidates[0].record=record("r","field.current_state");delete p.candidates[0].record.domainBinding;p.candidates[0].record.domainId="domain.business" as never;
  const requests:unknown[]=[];
  const service=new InformationPublication(identity,{publish:async(_a,input)=>{requests.push(input);return{operationId:op,runtime:runtime(),records:input.candidates.map(c=>c.record)};}});
  await service.publish(p);await service.publish(p);assert.deepEqual(requests[0],requests[1]);
  assert.equal(JSON.stringify(requests).includes('"kind":"DOMAIN"'),true);
});
test("B14 adapter propagates CAS, collision and authorization safely with one RPC and no retry",async()=>{
  for(const [code,expected] of [["40001","CONCURRENT_MODIFICATION"],["23505","CONCURRENT_MODIFICATION"],["42501","ACCESS_DENIED"],["22023","INVALID_INPUT"]]){
    let calls=0;const adapter=new SupabaseInformationPublication({rpc:async()=>{calls++;return{data:null,error:{code,message:"private"}};}} as never);
    await assert.rejects(()=>adapter.publish("actor" as never,publication()),new RegExp(expected));assert.equal(calls,1);
  }
});
test("B14 runtime adapter reconstructs old immutable Resume result without rewriting it",async()=>{
  const persisted={runtime:{...runtime(),current:{informationRecordId:"r",sessionId:"s",pendingIds:[]}},session:{discoveryId:d,sessionId:"s",previousSessionId:"old-session",lifecycle:"OPEN",createdAt:now}};
  const before=structuredClone(persisted);
  const adapter=new SupabaseRuntimePersistence({rpc:async()=>({data:persisted,error:null}),from:()=>({select:()=>({eq:()=>({in:async()=>({data:[{record_id:"r",discovery_id:d,payload:record()}],error:null})})})})} as never);
  const result=await adapter.resumeAtomic({identityId:"actor",discoveryId:d} as never);
  assert.deepEqual(result.runtime.current.informationReferences,runtime().current.informationReferences);assert.deepEqual(persisted,before);
});
test("B14 ResumeContext and Briefing preserve independent nested references, Handoff remains historical",()=>{
  const r=runtime();r.current.informationReferences=InformationReferencesSchema.parse([...r.current.informationReferences!,{fieldId:"field.constraints",recordIds:["c2","c1"]}]);
  const ctx=ResumeContextSchema.parse({discoveryId:d,runtimeVersion:1,current:r.current,pending:[],previousSessionId:"old"});
  assert.deepEqual(currentRecordIds(ctx.current),["c1","c2","r"]);
  assert.deepEqual(deriveWorkingBriefing(r).currentReferences,["c1","c2","r","s"]);
  const historical={handoffId:op,discoveryId:d,version:1,status:"ISSUED",sourceRuntimeVersion:0,decision:{decisionId:"decision",source:{sourceId:"source",reference:"human"},recordedAt:now},previousHandoffId:null,issuedAt:now};
  assert.deepEqual(HandoffSchema.parse(historical),historical);
});
test("B14 resolver reads all and only published information without validated evidence",()=>{
  const r=runtime();r.current.informationReferences=InformationReferencesSchema.parse([...r.current.informationReferences!,{fieldId:"field.current_state",recordIds:["state"]}]);r.current.scopeVersion=0 as never;
  const s=GovernedContextSnapshotSchema.parse({runtime:r,session:{discoveryId:d,sessionId:"s",previousSessionId:null,lifecycle:"OPEN",createdAt:now},information:[record(),record("state","field.current_state"),record("historical","field.constraints")],classification:null,scope:{discoveryId:d,entityVersion:0,kind:"ONE_DISCOVERY",applicability:"APPLICABLE",boundary:"INCLUDED"},catalog:{complete:true,fields:[{fieldId:"field.subject_context",domainBinding:{kind:"CORE_NEUTRAL"},required:true,applicability:"APPLICABLE"},{fieldId:"field.current_state",domainBinding:{kind:"DOMAIN",domainId:"domain.business"},required:true,applicability:"APPLICABLE"}]},dependencies:[]});
  const ctx=deriveGovernedContext(ContextRequestSchema.parse({discoveryId:d,sessionId:"s"}),s);assert.equal(ctx.missingFieldCount,0);assert.equal(ctx.hasCurrentInformation,true);
});

const sql=readFileSync("supabase/migrations/20260922001100_agent_b_information_publication.sql","utf8");
test("B14 static SQL registry/cardinality parity and migration ordering",()=>{
  for(const [field,definition] of Object.entries(INFORMATION_FIELDS))assert.ok(sql.includes(`when '${field}' then '${definition.cardinality}'`));
  const files=readdirSync("supabase/migrations").filter(f=>f.endsWith(".sql")).sort();assert.equal(files.length,11);assert.ok(files[10].startsWith("20260922001100"));
});
test("B14 static SQL atomicity: runtime lock, exact replay before CAS, checked UPDATE, deferred ledger FK",()=>{
  const body=sql.slice(sql.indexOf("create function agent_b_private.publish_information"),sql.indexOf("create function public.agent_b_publish_information"));
  assert.ok(body.indexOf("lock_governance_access")<body.indexOf("return replay.result"));
  assert.ok(body.indexOf("return replay.result")<body.indexOf("r.runtime_version<>expected"));
  for(const fragment of ["replay.request is distinct from p_input","replay.actor_id<>p_actor","replay.discovery_id<>d","where discovery_id=d and runtime_version=expected","get diagnostics affected=row_count","if affected<>1","seen_predecessors","insert into public.agent_b_information_candidates"])assert.ok(body.includes(fragment));
  assert.ok(sql.includes("deferrable initially deferred"));assert.equal(/exception\s+when/i.test(body),false);assert.match(sql,/begin;[\s\S]*commit;/);
});
test("B14 static SQL supersession, additive references, history retention and legacy write revocation",()=>{
  assert.ok(sql.includes("where discovery_id=d and record_id=pred for share"));
  assert.ok(sql.includes("values(rid,d,next_version,rec,root,pred"));
  assert.ok(sql.includes("where x->>'fieldId'<>field"));
  assert.equal(/(?:update|delete from) public\.agent_b_information_records/i.test(sql),false);
  assert.ok(sql.includes("EXPLICIT_PREDECESSOR_REQUIRED"));assert.ok(sql.includes("revoke all on function public.agent_b_create_information_record"));
});
test("B14 static SQL Evidence uses reference membership, immutable Handoff/Resume ledgers not rewritten",()=>{
  assert.ok(sql.includes("agent_b_private.information_current(d,current_state,info.record_id)"));
  assert.equal(/(?:update|delete from) public\.agent_b_(?:handoff|runtime)_operations/i.test(sql),false);
  assert.ok(sql.includes("alter table public.agent_b_information_operations enable row level security"));
  assert.equal(/grant\s+(?:insert|update|delete|all)/i.test(sql),false);
});
