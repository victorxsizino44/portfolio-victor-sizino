import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { RuntimeFoundation } from "../../lib/agent-b/application/runtime-foundation.ts";
import { SupabaseRuntimePersistence } from "../../lib/agent-b/infrastructure/supabase/runtime-persistence.server.ts";
import { DiscoveryRuntimeSchema, SessionSchema, type DiscoveryRuntime, type Session } from "../../lib/agent-b/core/mc04.ts";
import { InitializeRuntimeSchema, ResumeRuntimeSchema, type RuntimeOperationResult } from "../../lib/agent-b/core/runtime-operations.ts";
import type { RuntimePersistencePort } from "../../lib/agent-b/ports/runtime-persistence.ts";
import type { IdentityPort } from "../../lib/agent-b/ports/identity.ts";
import { IdentityIdSchema, FoundationError } from "../../lib/agent-b/core/identity-access.ts";

const uuid=(n:number)=>`00000000-0000-4000-8000-${String(n).padStart(12,"0")}`;
const actor=IdentityIdSchema.parse(uuid(1));
const first=()=>InitializeRuntimeSchema.parse({discoveryId:uuid(2),operationId:uuid(3),sessionId:uuid(4),now:"2026-09-22T12:00:00Z"});
const resume=()=>ResumeRuntimeSchema.parse({...first(),operationId:uuid(5),sessionId:uuid(6),expectedRuntimeVersion:0,previousSessionId:uuid(4)});
type Init=Parameters<RuntimePersistencePort["initializeAtomic"]>[0];
type Resume=Parameters<RuntimePersistencePort["resumeAtomic"]>[0];
// Transaction contract model. PostgreSQL execution is deliberately NOT claimed.
class MemoryRuntime {
  runtimes=new Map<string,DiscoveryRuntime>(); sessions=new Map<string,Session>();
  ledger=new Map<string,{actor:string;discovery:string;kind:string;request:string;result:RuntimeOperationResult}>();
  failure=false; zeroRowCAS=false; writes=0;
  snapshot(){return JSON.stringify({runtimes:[...this.runtimes],sessions:[...this.sessions],ledger:[...this.ledger]});}
  async initializeAtomic(i:Init){return this.operation(i,true);}
  async resumeAtomic(i:Resume){return this.operation(i,false);}
  private async operation(i:Init|Resume,initial:boolean):Promise<RuntimeOperationResult>{
    if(i.identityId!==actor || ![uuid(2),uuid(20)].includes(i.discoveryId))throw new FoundationError("ACCESS_DENIED");
    const kind=initial?"INITIALIZE":"RESUME"; const request=JSON.stringify(i); const replay=this.ledger.get(i.operationId);
    if(replay){
      if(replay.actor!==i.identityId||replay.discovery!==i.discoveryId||replay.kind!==kind||replay.request!==request)throw new FoundationError("CONCURRENT_MODIFICATION");
      return structuredClone(replay.result);
    }
    const runtimes=structuredClone(this.runtimes),sessions=structuredClone(this.sessions),ledger=structuredClone(this.ledger);
    let runtime=runtimes.get(i.discoveryId);let previous:Session|undefined;
    if(initial){
      if(runtime||[...sessions.values()].some(s=>s.discoveryId===i.discoveryId))throw new FoundationError("CONCURRENT_MODIFICATION");
      runtime=DiscoveryRuntimeSchema.parse({discoveryId:i.discoveryId,runtimeVersion:0,freshness:"CURRENT",current:{sessionId:i.sessionId,pendingIds:[]},pending:[]});
    } else {
      const r=i as Resume;
      if(!runtime||runtime.runtimeVersion!==r.expectedRuntimeVersion||runtime.current.sessionId!==r.previousSessionId)throw new FoundationError("CONCURRENT_MODIFICATION");
      previous=sessions.get(r.previousSessionId);
      if(!previous||previous.discoveryId!==r.discoveryId)throw new FoundationError("ACCESS_DENIED");
      if(previous.lifecycle==="OPEN")sessions.set(previous.sessionId,{...previous,lifecycle:"INTERRUPTED"});
      runtime=DiscoveryRuntimeSchema.parse({...runtime,runtimeVersion:r.expectedRuntimeVersion+1,current:{...runtime.current,sessionId:r.sessionId}});
    }
    if(sessions.has(i.sessionId)||[...sessions.values()].some(s=>s.discoveryId===i.discoveryId&&s.lifecycle==="OPEN"))throw new FoundationError("CONCURRENT_MODIFICATION");
    const session=SessionSchema.parse({sessionId:i.sessionId,discoveryId:i.discoveryId,previousSessionId:previous?.sessionId??null,lifecycle:"OPEN",createdAt:i.now});
    sessions.set(session.sessionId,session);runtimes.set(i.discoveryId,runtime);
    if(this.zeroRowCAS&&!initial)throw new FoundationError("CONCURRENT_MODIFICATION");
    const result={runtime,session};ledger.set(i.operationId,{actor:i.identityId,discovery:i.discoveryId,kind,request,result});
    if(this.failure)throw new FoundationError("PROVIDER_UNAVAILABLE");
    this.runtimes=runtimes;this.sessions=sessions;this.ledger=ledger;this.writes++;
    return structuredClone(result);
  }
}
function fixture(){
  const db=new MemoryRuntime();
  const identity={current:async()=>({identityId:actor,kind:"ANONYMOUS"})} as IdentityPort;
  const service=new RuntimeFoundation(identity,db as unknown as RuntimePersistencePort);
  return {db,service};
}
test("R08-04A initializes version zero, exactly one runtime and first OPEN Session",async()=>{
  const {db,service}=fixture();const result=await service.initialize(first());
  assert.equal(result.runtime.runtimeVersion,0);assert.equal(result.runtime.current.sessionId,result.session.sessionId);
  assert.equal(result.session.previousSessionId,null);assert.equal(result.session.lifecycle,"OPEN");
  assert.equal(db.runtimes.size,1);assert.equal(db.sessions.size,1);
});
test("R08-04A initialization replay returns accepted result without another write",async()=>{
  const {db,service}=fixture();const original=await service.initialize(first());await service.resume(resume());
  const before=db.snapshot();assert.deepEqual(await service.initialize(first()),original);assert.equal(db.snapshot(),before);assert.equal(db.writes,2);
});
test("R08-04A different initialization operation rejects without material consequence",async()=>{
  const {db,service}=fixture();await service.initialize(first());const before=db.snapshot();
  await assert.rejects(()=>service.initialize({...first(),operationId:uuid(10),sessionId:uuid(11)}),/CONCURRENT_MODIFICATION/);
  assert.equal(db.snapshot(),before);
});
test("R08-04A resume returns persisted new projection and preserves pending/freshness",async()=>{
  const {db,service}=fixture();await service.initialize(first());
  const r=db.runtimes.get(uuid(2))!;
  db.runtimes.set(uuid(2),DiscoveryRuntimeSchema.parse({...r,freshness:"REEVALUATION_REQUIRED",pending:[{pendingId:"p",state:"PENDING",reference:"need"}],current:{...r.current,pendingIds:["p"]}}));
  const result=await service.resume(resume());
  assert.equal(result.runtime.runtimeVersion,1);assert.equal(result.context.runtimeVersion,1);
  assert.equal(result.runtime.current.sessionId,uuid(6));assert.equal(result.context.current.sessionId,uuid(6));
  assert.equal(result.runtime.freshness,"REEVALUATION_REQUIRED");assert.equal(result.context.pending[0].pendingId,"p");
  assert.equal(db.sessions.get(uuid(4))?.lifecycle,"INTERRUPTED");
  assert.equal(result.session.previousSessionId,uuid(4));
  assert.equal([...db.sessions.values()].filter(s=>s.lifecycle==="OPEN").length,1);
});
test("R08-04A resume replay bypasses pre-read stale rejection and returns original result",async()=>{
  const {db,service}=fixture();await service.initialize(first());const accepted=await service.resume(resume());
  const before=db.snapshot();assert.deepEqual(await service.resume(resume()),accepted);assert.equal(db.snapshot(),before);assert.equal(db.writes,2);
});
for(const lifecycle of ["CLOSED","INTERRUPTED"] as const)test(`R08-04A ${lifecycle} predecessor remains terminal`,async()=>{
  const {db,service}=fixture();await service.initialize(first());const old=db.sessions.get(uuid(4))!;
  db.sessions.set(uuid(4),{...old,lifecycle});await service.resume(resume());
  assert.equal(db.sessions.get(uuid(4))?.lifecycle,lifecycle);
});
test("R08-04A replay operationId cannot disclose another owned Discovery result",async()=>{
  const {db,service}=fixture();await service.initialize(first());await service.resume(resume());const before=db.snapshot();
  await assert.rejects(()=>service.resume({...resume(),discoveryId:uuid(20)}),/CONCURRENT_MODIFICATION/);
  await assert.rejects(()=>service.initialize({...first(),discoveryId:uuid(20)}),/CONCURRENT_MODIFICATION/);
  assert.equal(db.snapshot(),before);
});
test("R08-04A foreign predecessor rejected even with a corrupt current reference",async()=>{
  const {db,service}=fixture();await service.initialize(first());
  const session=db.sessions.get(uuid(4))!;db.sessions.set(uuid(4),SessionSchema.parse({...session,discoveryId:uuid(20)}));
  const before=db.snapshot();await assert.rejects(()=>service.resume(resume()),/ACCESS_DENIED/);assert.equal(db.snapshot(),before);
});
test("R08-04A stale version and zero-row CAS roll back Session terminalization/insertion",async()=>{
  const {db,service}=fixture();await service.initialize(first());const before=db.snapshot();
  await assert.rejects(()=>service.resume({...resume(),expectedRuntimeVersion:1}),/CONCURRENT_MODIFICATION/);
  db.zeroRowCAS=true;await assert.rejects(()=>service.resume(resume()),/CONCURRENT_MODIFICATION/);assert.equal(db.snapshot(),before);
});
test("R08-04A late failure leaves no partial initialization or Resume",async()=>{
  const {db,service}=fixture();db.failure=true;let before=db.snapshot();
  await assert.rejects(()=>service.initialize(first()),/PROVIDER_UNAVAILABLE/);assert.equal(db.snapshot(),before);
  db.failure=false;await service.initialize(first());before=db.snapshot();db.failure=true;
  await assert.rejects(()=>service.resume(resume()),/PROVIDER_UNAVAILABLE/);assert.equal(db.snapshot(),before);
});
test("R08-04A unauthorized and unauthenticated operations cannot mutate",async()=>{
  const {db,service}=fixture();const before=db.snapshot();
  await assert.rejects(()=>service.initialize({...first(),discoveryId:uuid(99)}),/ACCESS_DENIED/);
  const noIdentity=new RuntimeFoundation({current:async()=>null} as unknown as IdentityPort,db as unknown as RuntimePersistencePort);
  await assert.rejects(()=>noIdentity.initialize(first()),/AUTHENTICATION_REQUIRED/);
  await assert.rejects(()=>noIdentity.resume(resume()),/AUTHENTICATION_REQUIRED/);assert.equal(db.snapshot(),before);
});
test("R08-04A rejects arbitrary projection and timestamp-derived Session identifiers",async()=>{
  const {service}=fixture();
  await assert.rejects(()=>service.resume({...resume(),runtime:{freshness:"CURRENT"}}),/INVALID_INPUT/);
  await assert.rejects(()=>service.initialize({...first(),sessionId:"1727000000"}),/INVALID_INPUT/);
});
test("R08-04A adapter returns database projection rather than caller runtime",async()=>{
  const {service}=fixture();const result=await service.initialize(first());
  const calls:{name:string;args:unknown}[]=[];let errorCode:string|null=null;
  const gateway={rpc:async(name:string,args:unknown)=>{calls.push({name,args});return{data:result,error:errorCode?{code:errorCode,message:"private"}:null};}};
  const adapter=new SupabaseRuntimePersistence(gateway as unknown as ConstructorParameters<typeof SupabaseRuntimePersistence>[0]);
  const normalized={...result,runtime:{...result.runtime,current:{...result.runtime.current,informationReferences:[]}}};
  assert.deepEqual(await adapter.initializeAtomic({identityId:actor,...first()}),normalized);
  assert.deepEqual(await adapter.resumeAtomic({identityId:actor,...resume()}),normalized);
  assert.equal(calls[0].name,"agent_b_initialize_runtime");assert.equal(calls[1].name,"agent_b_resume_atomic");
  assert.deepEqual(calls[1].args,{p_actor:actor,p_input:resume()});
  for(const [code,expected] of [["42501","ACCESS_DENIED"],["40001","CONCURRENT_MODIFICATION"],["23505","CONCURRENT_MODIFICATION"],["unknown","PROVIDER_UNAVAILABLE"]]){
    errorCode=code;await assert.rejects(()=>adapter.initializeAtomic({identityId:actor,...first()}),(e:Error)=>e.message===expected);
  }
});
test("R08-04A SQL contracts enforce CAS row count, replay scope, immutable ledger, RLS and terminal guard",()=>{
  const sql=readFileSync(new URL("../../supabase/migrations/20260922000700_agent_b_reconciliation.sql",import.meta.url),"utf8");
  const repair=sql.split("-- R08-04A corrective DDL:")[1].split("-- R08-CTX:")[0];
  assert.match(repair,/drop function public.agent_b_resume_atomic\(uuid,uuid,uuid,text,bigint,text,jsonb,timestamptz\)/);
  assert.match(repair,/replay.discovery_id<>d or replay.actor_identity_id<>p_actor/);
  assert.match(repair,/replay.request is distinct from p_input/);
  assert.match(repair,/get diagnostics affected = row_count/);
  assert.match(repair,/if affected<>1 then raise exception/);
  assert.match(repair,/where discovery_id=d and runtime_version=expected returning \* into r/);
  assert.match(repair,/where discovery_id=d and session_id=prev for update/);
  assert.match(repair,/jsonb_set\(current_state,'\{sessionId\}',to_jsonb\(sid\),true\)/);
  assert.match(repair,/old.lifecycle <> 'OPEN'/);
  assert.match(repair,/foreign key\(discovery_id,previous_session_id\)/);
  assert.match(repair,/agent_b_runtime_operations enable row level security/);
  assert.match(repair,/lock_governance_access\(p_actor,d\)/);
  assert.doesNotMatch(repair,/grant (?:insert|update|all).*to authenticated|exception when|p_input->'runtime'/i);
  assert.ok(repair.indexOf("return replay.result")<repair.indexOf("select * into r from public.agent_b_runtime_state"));
});
