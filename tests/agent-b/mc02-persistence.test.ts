import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { GovernedMc02 } from "../../lib/agent-b/application/mc02.ts";
import { SupabaseMc02Persistence } from "../../lib/agent-b/infrastructure/supabase/mc02-persistence.server.ts";
import { Mc02WriteSchema, PersistedMc02Schema, type Mc02Read, type Mc02Write, type PersistedMc02 } from "../../lib/agent-b/core/mc02-persistence.ts";
import { AuthenticatedIdentitySchema, DiscoveryAccessSchema, DiscoveryRootSchema, FoundationError } from "../../lib/agent-b/core/identity-access.ts";
import { ContextRequestSchema, GovernedContextSnapshotSchema } from "../../lib/agent-b/ports/governed-context.ts";
import { deriveGovernedContext } from "../../lib/agent-b/application/governed-context.ts";
import type { Mc02PersistencePort } from "../../lib/agent-b/ports/mc02-persistence.ts";
import type { IdentityPort } from "../../lib/agent-b/ports/identity.ts";
import type { DiscoveryPersistencePort } from "../../lib/agent-b/ports/discovery-persistence.ts";
const stamp="2026-09-22T12:00:00Z";
const uuid=(n:number)=>"00000000-0000-4000-8000-"+n.toString().padStart(12,"0");
function write(version=0,operation=1):Mc02Write {
  return Mc02WriteSchema.parse({discoveryId:"d",operationId:uuid(operation),expectedEntityVersion:version===0?null:version-1,value:{kind:"CLASSIFICATION",contract:{discoveryId:"d",entityVersion:version,understandingState:"PARTIALLY_UNDERSTOOD",primaryNature:["product","service"]}}});
}
// Executable transactional port contract. SQL is checked separately below; this
// model is not presented as a live PostgreSQL integration test.
class MemoryMc02 implements Mc02PersistencePort {
  rows:PersistedMc02[]=[]; requests=new Map<string,Mc02Write>(); pointers=new Map<string,string>();
  failBeforeCommit=false; denied=false; runtimeVersion=19;
  private authorize(actor:string,input:Mc02Read|Mc02Write){if(this.denied||actor!=="actor"||input.discoveryId!=="d")throw new FoundationError("ACCESS_DENIED");}
  async read(actor:string,input:Mc02Read){this.authorize(actor,input);return structuredClone(this.rows.find(r=>r.recordId===this.pointers.get(input.kind))??null);}
  async history(actor:string,input:Mc02Read){this.authorize(actor,input);return structuredClone(this.rows.filter(r=>r.value.kind===input.kind));}
  async write(actor:string,input:Mc02Write){
    this.authorize(actor,input);
    const replay=this.rows.find(r=>r.operationId===input.operationId);
    if(replay){if(JSON.stringify(this.requests.get(input.operationId))!==JSON.stringify(input))throw new FoundationError("CONCURRENT_MODIFICATION");return structuredClone(replay);}
    const prior=this.rows.find(r=>r.recordId===this.pointers.get(input.value.kind));
    if((prior?.entityVersion??null)!==input.expectedEntityVersion)throw new FoundationError("CONCURRENT_MODIFICATION");
    const recordId=uuid(100+this.rows.length);
    const row=PersistedMc02Schema.parse({recordId,operationId:input.operationId,discoveryId:input.discoveryId,entityVersion:input.value.contract.entityVersion,lineageRootId:prior?.lineageRootId??recordId,supersedesId:prior?.recordId??null,createdAt:stamp,value:input.value});
    if(this.failBeforeCommit)throw new FoundationError("PROVIDER_UNAVAILABLE");
    this.rows.push(row);this.pointers.set(input.value.kind,row.recordId);this.requests.set(input.operationId,structuredClone(input));
    return structuredClone(row);
  }
}
function fixture(){
  const repository=new MemoryMc02();
  const identity:Pick<IdentityPort,"current">={current:async()=>AuthenticatedIdentitySchema.parse({identityId:"actor",kind:"ANONYMOUS"})};
  const access:Pick<DiscoveryPersistencePort,"readRoot"|"findAccess">={
    readRoot:async()=>DiscoveryRootSchema.parse({discoveryId:"d",ownerId:"actor",entityVersion:8,createdAt:stamp}),
    findAccess:async()=>DiscoveryAccessSchema.parse({discoveryId:"d",identityId:"actor",role:"OWNER"}),
  };
  return {repository,identity,access,service:new GovernedMc02(identity,access,repository)};
}
test("MC02 authorized create/update preserves classification/non-exclusive primaryNature and versions",async()=>{
  const {service,repository}=fixture();const first=await service.write(write());const second=await service.write(write(1,2));
  assert.deepEqual(first.value.contract,write().value.contract);
  assert.equal(second.entityVersion,1);assert.equal(repository.runtimeVersion,19);
  assert.equal((await service.read({discoveryId:"d",kind:"CLASSIFICATION"}))?.recordId,second.recordId);
});
test("MC02 rejects unauthenticated and missing/cross-Discovery ownership before persistence",async()=>{
  const x=fixture();x.identity.current=async()=>null;
  await assert.rejects(()=>x.service.write(write()),/AUTHENTICATION_REQUIRED/);assert.equal(x.repository.rows.length,0);
  const y=fixture();y.access.findAccess=async()=>null;
  await assert.rejects(()=>y.service.write(write()),/ACCESS_DENIED/);assert.equal(y.repository.rows.length,0);
  const z=fixture();await assert.rejects(()=>z.service.read({discoveryId:"foreign",kind:"CLASSIFICATION"}),/ACCESS_DENIED/);
  z.repository.denied=true;await assert.rejects(()=>z.service.write(write()),/ACCESS_DENIED/);
});
test("MC02 stale CAS and concurrent contenders produce exactly one accepted successor",async()=>{
  const {service,repository}=fixture();await service.write(write());
  const results=await Promise.allSettled([service.write(write(1,2)),service.write(write(1,3))]);
  assert.equal(results.filter(r=>r.status==="fulfilled").length,1);assert.equal(repository.rows.length,2);
  const before=JSON.stringify(repository.rows);
  await assert.rejects(()=>service.write(write(1,4)),/CONCURRENT_MODIFICATION/);assert.equal(JSON.stringify(repository.rows),before);
});
test("MC02 exact replay returns original result and cannot republish a historical state",async()=>{
  const {service,repository}=fixture();const first=await service.write(write());const next=await service.write(write(1,2));
  assert.deepEqual(await service.write(write()),first);assert.equal(repository.rows.length,2);
  assert.equal((await service.read({discoveryId:"d",kind:"CLASSIFICATION"}))?.recordId,next.recordId);
  const altered=write();if(altered.value.kind==="CLASSIFICATION")altered.value.contract.understandingState="CONFLICTING";
  await assert.rejects(()=>service.write(altered),/CONCURRENT_MODIFICATION/);assert.equal(repository.rows.length,2);
});
test("MC02 preserves material lineage; reads cannot mutate history",async()=>{
  const {service}=fixture();const a=await service.write(write());const b=await service.write(write(1,2));const c=await service.write(write(2,3));
  assert.equal(b.supersedesId,a.recordId);assert.equal(c.supersedesId,b.recordId);assert.equal(c.lineageRootId,a.recordId);
  const history=await service.history({discoveryId:"d",kind:"CLASSIFICATION"});assert.deepEqual(history.map(r=>r.entityVersion),[0,1,2]);
  if(history[0].value.kind==="CLASSIFICATION")history[0].value.contract.understandingState="CONFLICTING";
  assert.deepEqual((await service.history({discoveryId:"d",kind:"CLASSIFICATION"}))[0],a);
});
test("MC02 scoped segments preserve all applicability/boundary states",async()=>{
  const {service}=fixture();
  const contract={discoveryId:"d",entityVersion:0,kind:"SCOPED_SEGMENTS",segments:[
    {segmentId:"a",applicability:"APPLICABLE",boundary:"INCLUDED"},
    {segmentId:"b",applicability:"CANDIDATE",boundary:"CONDITIONAL"},
    {segmentId:"c",applicability:"EXCLUDED",boundary:"EXCLUDED"},
    {segmentId:"d",applicability:"UNRESOLVED",boundary:"DEFERRED"},
  ]};
  const result=await service.write({discoveryId:"d",operationId:uuid(1),expectedEntityVersion:null,value:{kind:"SCOPE",contract}});
  assert.deepEqual(result.value.contract,contract);
  assert.deepEqual((await service.read({discoveryId:"d",kind:"SCOPE"}))?.value.contract,contract);
});
test("MC02 specialization alternatives persist without resolving candidate semantics",async()=>{
  const {service}=fixture();
  const alternatives=[{status:"CORE_SUFFICIENT"},{status:"EXISTING_SPECIALIZATION_APPLICABLE",specializationId:"specialty"},{status:"SPECIALIZATION_CANDIDATE",candidate:"proposal"},{status:"SPECIALIZATION_UNRESOLVED"}];
  for(let i=0;i<alternatives.length;i++){
    const contract={discoveryId:"d",entityVersion:i,...alternatives[i]};
    const result=await service.write({discoveryId:"d",operationId:uuid(i+1),expectedEntityVersion:i===0?null:i-1,value:{kind:"SPECIALIZATION",contract}});
    assert.deepEqual(result.value.contract,contract);
  }
  assert.equal((await service.history({discoveryId:"d",kind:"SPECIALIZATION"})).length,4);
});
test("MC02 three contracts have independent entity sequences and never advance runtime",async()=>{
  const {service,repository}=fixture();await service.write(write());await service.write(write(1,2));
  await service.write({discoveryId:"d",operationId:uuid(3),expectedEntityVersion:null,value:{kind:"SPECIALIZATION",contract:{discoveryId:"d",entityVersion:0,status:"CORE_SUFFICIENT"}}});
  assert.equal((await service.read({discoveryId:"d",kind:"SPECIALIZATION"}))?.entityVersion,0);assert.equal(repository.runtimeVersion,19);
});
test("MC02 invalid payload, version, extra runtime fields and Discovery mismatch leave zero state",async()=>{
  const {service,repository}=fixture();const input=write();
  for(const bad of [{...input,runtimeVersion:0},{...input,expectedEntityVersion:0},{...input,value:{kind:"CLASSIFICATION",contract:{...input.value.contract,discoveryId:"other"}}},{...input,value:{kind:"CLASSIFICATION",contract:{...input.value.contract,understandingState:"AUTO_VALID"}}}]){
    await assert.rejects(()=>service.write(bad),/INVALID_INPUT/);
  }
  assert.equal(repository.rows.length,0);
});
test("MC02 rejected persistence leaves history/current unchanged",async()=>{
  const {service,repository}=fixture();const first=await service.write(write());repository.failBeforeCommit=true;
  await assert.rejects(()=>service.write(write(1,2)),/PROVIDER_UNAVAILABLE/);
  assert.deepEqual(await service.read({discoveryId:"d",kind:"CLASSIFICATION"}),first);assert.equal(repository.rows.length,1);assert.equal(repository.requests.size,1);
});
test("MC02 read projection is compatible with R08-CTX without copying state",async()=>{
  const {service}=fixture();const classification=await service.write(write());
  const scope=await service.write({discoveryId:"d",operationId:uuid(2),expectedEntityVersion:null,value:{kind:"SCOPE",contract:{discoveryId:"d",entityVersion:0,kind:"ONE_DISCOVERY",applicability:"APPLICABLE",boundary:"INCLUDED"}}});
  const snapshot=GovernedContextSnapshotSchema.parse({runtime:{discoveryId:"d",runtimeVersion:19,freshness:"CURRENT",current:{classificationVersion:0,scopeVersion:0,sessionId:"s",pendingIds:[]},pending:[]},session:{sessionId:"s",discoveryId:"d",previousSessionId:null,lifecycle:"OPEN",createdAt:stamp},information:[],classification:classification.value.contract,scope:scope.value.contract,catalog:null,dependencies:null});
  const ctx=deriveGovernedContext(ContextRequestSchema.parse({discoveryId:"d",sessionId:"s"}),snapshot);
  assert.equal(ctx.sufficientGovernedContext,true);assert.equal(ctx.runtimeVersion,19);assert.equal(ctx.informationNeed,"UNKNOWN");
  // After MC-02 advances, the SQL reader does not substitute a historical row
  // for current MC-02 merely because an old runtime reference still names it.
  await service.write(write(1,3));
  snapshot.classification=null;
  const stale=deriveGovernedContext(ContextRequestSchema.parse({discoveryId:"d",sessionId:"s"}),snapshot);
  assert.equal(stale.sufficientGovernedContext,false);assert.equal(stale.runtimeVersion,19);
});
test("MC02 Supabase adapter uses guarded RPCs and sanitizes errors",async()=>{
  const f=fixture();const record=await f.service.write(write());const calls:unknown[]=[];let error:{code:string;message:string}|null=null;
  const client={rpc:async(name:string,args:unknown)=>{calls.push({name,args});return {data:name==="agent_b_read_mc02"&&((args as {p_history:boolean}).p_history)?[record]:record,error};}};
  const adapter=new SupabaseMc02Persistence(client as unknown as ConstructorParameters<typeof SupabaseMc02Persistence>[0]);
  assert.deepEqual(await adapter.write("actor",write()),record);
  const read={discoveryId:write().discoveryId,kind:"CLASSIFICATION" as const};
  assert.deepEqual(await adapter.read("actor",read),record);assert.deepEqual(await adapter.history("actor",read),[record]);
  assert.deepEqual(calls[0],{name:"agent_b_write_mc02",args:{p_actor:"actor",p_input:write()}});
  for(const [code,expected] of [["42501","ACCESS_DENIED"],["40001","CONCURRENT_MODIFICATION"],["23505","CONCURRENT_MODIFICATION"],["22023","INVALID_INPUT"],["other","PROVIDER_UNAVAILABLE"]]){
    error={code,message:"private provider detail"};await assert.rejects(()=>adapter.write("actor",write()),(e:Error)=>e.message===expected);
  }
});
test("MC02 SQL enforces explicit references, immutable history, RLS and serialized CAS/replay",()=>{
  const sql=readFileSync(new URL("../../supabase/migrations/20260922000700_agent_b_reconciliation.sql",import.meta.url),"utf8");
  const writeSql=sql.split("create function agent_b_private.write_mc02")[1].split("create function public.agent_b_write_mc02")[0];
  assert.match(sql,/foreign key\(discovery_id,kind,supersedes_id\).*on delete restrict/);
  assert.match(sql,/foreign key\(discovery_id,kind,record_id\).*on delete restrict/);
  assert.match(sql,/agent_b_mc02_immutable before update or delete/);
  assert.match(sql,/alter table public.agent_b_mc02_state enable row level security/);
  assert.match(sql,/alter table public.agent_b_mc02_current enable row level security/);
  assert.ok(writeSql.indexOf("lock_governance_access")<writeSql.indexOf("where operation_id=operation"));
  assert.ok(writeSql.indexOf("return agent_b_private.mc02_json(accepted)")<writeSql.indexOf("prior.entity_version<>expected"));
  assert.ok(writeSql.indexOf("prior.entity_version<>expected")<writeSql.indexOf("insert into public.agent_b_mc02_state"));
  assert.match(writeSql,/accepted.request is distinct from p_input/);
  assert.doesNotMatch(writeSql,/update public.agent_b_runtime_state|update public.agent_b_discoveries|validate_human_decision/);
  assert.match(sql,/join public.agent_b_mc02_current c on c.discovery_id=m.discovery_id and c.kind=m.kind and c.record_id=m.record_id/);
});
