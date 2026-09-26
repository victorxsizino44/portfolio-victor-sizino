import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { GovernedHandoff } from "../../lib/agent-b/application/handoff.ts";
import { HandoffSchema, deriveWorkingBriefing, type Handoff } from "../../lib/agent-b/core/handoff.ts";
import { HandoffMutationSchema, handoffDecisionIntent, type HandoffMutation } from "../../lib/agent-b/core/handoff-lifecycle.ts";
import { assertDecisionMatches, GovernanceAuthoritySchema, HumanDecisionSchema, type HumanDecision } from "../../lib/agent-b/core/governance.ts";
import { FoundationError, IdentityIdSchema } from "../../lib/agent-b/core/identity-access.ts";
import { DiscoveryIdSchema, EntityVersionSchema, RuntimeVersionSchema, TimestampSchema } from "../../lib/agent-b/core/primitives.ts";
import type { DiscoveryRuntime } from "../../lib/agent-b/core/mc04.ts";
import type { HandoffPort } from "../../lib/agent-b/ports/handoff.ts";
import { SupabaseHandoffAdapter } from "../../lib/agent-b/infrastructure/supabase/handoff.server.ts";

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12,"0")}`;
const discoveryId = DiscoveryIdSchema.parse(uuid(1));
const actor = IdentityIdSchema.parse(uuid(2));
const now = TimestampSchema.parse("2026-09-22T12:00:00Z");
const reference = (n: number) => ({decisionId:`decision-${n}`,source:{sourceId:"human-source",reference:"synthetic decision"},recordedAt:now});
const issue = () => HandoffMutationSchema.parse({action:"ISSUE_HANDOFF",discoveryId,operationId:uuid(3),handoffId:uuid(4),sourceRuntimeVersion:7,decision:reference(1),issuedAt:now});
const replacement = () => HandoffMutationSchema.parse({...issue(),action:"SUPERSEDE_HANDOFF",operationId:uuid(5),handoffId:uuid(6),decision:reference(2),expectedHandoffId:uuid(4),expectedVersion:1});

// Executable transaction contract double, NOT a PostgreSQL integration test.
// Copy-on-commit permits deliberate late failure and inspection of zero partial state.
class TransactionModel implements HandoffPort {
  authority = GovernanceAuthoritySchema.parse({authorityId:"human-authority",discoveryId,actorIdentityId:actor,role:"HUMAN_GOVERNANCE_AUTHORITY",status:"ACTIVE",version:0});
  decisions = new Map<string, HumanDecision>();
  artifacts: Handoff[] = [];
  currentId: string|null = null;
  edges: {previous:string;replacement:string}[] = [];
  operations = new Map<string,{input:HandoffMutation;result:Handoff}>();
  runtimeVersion = 7;
  failLate = false;
  register(input: HandoffMutation) {
    const intent = handoffDecisionIntent(input);
    this.decisions.set(input.decision.decisionId,HumanDecisionSchema.parse({
      ...Object.fromEntries(Object.entries(intent).filter(([key])=>key!=="reference")),
      decisionId:input.decision.decisionId,authorityId:this.authority.authorityId,actorIdentityId:actor,recordedAt:now,version:0,
    }));
  }
  private authorize(identityId:string, d:string) {
    if(identityId!==actor || d!==discoveryId) throw new FoundationError("ACCESS_DENIED");
  }
  async current(identityId:string,d:typeof discoveryId) {
    this.authorize(identityId,d);
    return structuredClone(this.artifacts.find(x=>x.handoffId===this.currentId)??null);
  }
  async list(identityId:string,d:typeof discoveryId) {
    this.authorize(identityId,d);
    return this.artifacts.map(x=>({...structuredClone(x),status:this.edges.some(e=>e.previous===x.handoffId)?"SUPERSEDED" as const:x.status}));
  }
  async mutate(identityId:string,input:HandoffMutation) {
    this.authorize(identityId,input.discoveryId);
    const decision=this.decisions.get(input.decision.decisionId);
    if(!decision) throw new FoundationError("ACCESS_DENIED");
    assertDecisionMatches(this.authority,decision,handoffDecisionIntent(input),identityId);
    const replay=this.operations.get(input.operationId);
    if(replay) {
      if(JSON.stringify(replay.input)!==JSON.stringify(input)) throw new FoundationError("CONCURRENT_MODIFICATION");
      return structuredClone(replay.result);
    }
    const head=this.artifacts.find(x=>x.handoffId===this.currentId);
    if(input.action==="ISSUE_HANDOFF" ? this.artifacts.length>0 :
      !head || head.handoffId!==input.expectedHandoffId || head.version!==input.expectedVersion)
      throw new FoundationError("CONCURRENT_MODIFICATION");
    if(input.sourceRuntimeVersion!==this.runtimeVersion || this.artifacts.some(x=>x.handoffId===input.handoffId))
      throw new FoundationError("CONCURRENT_MODIFICATION");
    const result=HandoffSchema.parse({handoffId:input.handoffId,discoveryId:input.discoveryId,version:head?head.version+1:1,
      status:"ISSUED",sourceRuntimeVersion:input.sourceRuntimeVersion,decision:input.decision,
      previousHandoffId:head?.handoffId??null,issuedAt:input.issuedAt});
    const artifacts=[...this.artifacts,structuredClone(result)];
    const edges=head?[...this.edges,{previous:head.handoffId,replacement:result.handoffId}]:[...this.edges];
    const operations=new Map(this.operations).set(input.operationId,{input:structuredClone(input),result:structuredClone(result)});
    if(this.failLate) throw new FoundationError("PROVIDER_UNAVAILABLE");
    this.artifacts=artifacts; this.edges=edges; this.operations=operations; this.currentId=result.handoffId;
    return result;
  }
  snapshot(){return JSON.stringify({artifacts:this.artifacts,edges:this.edges,operations:[...this.operations],current:this.currentId,runtime:this.runtimeVersion});}
}
function fixture() {
  const db=new TransactionModel();
  const access={
    readRoot:async(d:typeof discoveryId)=>d===discoveryId?{discoveryId,ownerId:actor,entityVersion:EntityVersionSchema.parse(0),createdAt:now}:null,
    findAccess:async(d:typeof discoveryId,a:typeof actor)=>d===discoveryId&&a===actor?{discoveryId,identityId:actor,role:"OWNER" as const}:null,
  };
  const identity={current:async()=>({identityId:actor,kind:"EMAIL_VERIFIED" as const})};
  const service=new GovernedHandoff(identity,access,db);
  db.register(issue()); db.register(replacement());
  return {db,access,identity,service};
}
test("R08-03 initial issue retains source version and current reference",async()=>{
  const {service,db}=fixture(); const result=await service.issue(issue());
  assert.equal(result.version,1); assert.equal(result.sourceRuntimeVersion,7);
  assert.equal(result.previousHandoffId,null); assert.deepEqual(await service.current({discoveryId}),result);
  assert.equal(db.runtimeVersion,7);
});
test("R08-03 composite supersession preserves immutable predecessor and source",async()=>{
  const {service,db}=fixture(); const first=await service.issue(issue()); const bytes=JSON.stringify(db.artifacts[0]);
  const next=await service.supersede(replacement());
  assert.equal(next.version,2); assert.equal(next.previousHandoffId,first.handoffId);
  assert.equal(JSON.stringify(db.artifacts[0]),bytes);
  assert.equal((await service.current({discoveryId}))?.handoffId,next.handoffId);
  assert.deepEqual((await service.history({discoveryId})).map(x=>x.status),["SUPERSEDED","ISSUED"]);
  assert.deepEqual(db.edges,[{previous:first.handoffId,replacement:next.handoffId}]);
});
test("R08-03 issue and supersession replay return original result even after replacement",async()=>{
  const {service,db}=fixture(); const first=await service.issue(issue()); const second=await service.supersede(replacement());
  const before=db.snapshot(); db.runtimeVersion=8;
  assert.deepEqual(await service.issue(issue()),first);
  assert.deepEqual(await service.supersede(replacement()),second);
  db.runtimeVersion=7; assert.equal(db.snapshot(),before);
  assert.equal(db.artifacts.length,2); assert.equal(db.edges.length,1);
});
test("R08-03 missing/unknown decision and briefing alone cannot issue",async()=>{
  const {service,db}=fixture(); const input={...issue()} as Record<string,unknown>; delete input.decision;
  await assert.rejects(()=>service.issue(input),/INVALID_INPUT/);
  const unknown=HandoffMutationSchema.parse({...issue(),decision:reference(999)});
  await assert.rejects(()=>service.issue(unknown),/ACCESS_DENIED/);
  await assert.rejects(()=>service.issue({discoveryId,runtimeVersion:7,currentReferences:[],pendingReferences:[],freshness:"CURRENT"}),/INVALID_INPUT/);
  assert.equal(db.artifacts.length,0);
});
for(const [name,patch] of Object.entries({
  revoked:{status:"REVOKED"},discovery:{discoveryId:uuid(99)},actor:{actorIdentityId:uuid(99)},id:{authorityId:"other"}
})) test(`R08-03 denies ${name} authority without mutation`,async()=>{
  const {service,db}=fixture(); db.authority=GovernanceAuthoritySchema.parse({...db.authority,...patch});
  const before=db.snapshot(); await assert.rejects(()=>service.issue(issue()),/ACCESS_DENIED/); assert.equal(db.snapshot(),before);
});
for(const [name,patch] of Object.entries({
  action:{action:"SUPERSEDE_HANDOFF"},target:{targetId:uuid(99)},version:{targetVersion:2},
  type:{targetType:"EVIDENCE"},operation:{operationId:uuid(99)},outcome:{outcome:"SUPERSEDED"},discovery:{discoveryId:uuid(99)}
})) test(`R08-03 rejects wrong decision ${name}`,async()=>{
  const {service,db}=fixture(); db.decisions.set("decision-1",HumanDecisionSchema.parse({...db.decisions.get("decision-1"),...patch}));
  const before=db.snapshot(); await assert.rejects(()=>service.issue(issue()),/ACCESS_DENIED/); assert.equal(db.snapshot(),before);
});
test("R08-03 supersession decision cannot authorize independent initial issuance",async()=>{
  const {service,db}=fixture();
  const forged=HandoffMutationSchema.parse({...issue(),operationId:uuid(5),decision:reference(2)});
  await assert.rejects(()=>service.issue(forged),/ACCESS_DENIED/);
  await assert.rejects(()=>service.issue(replacement()),/INVALID_INPUT/);
  await assert.rejects(()=>service.supersede(replacement()),/CONCURRENT_MODIFICATION/);
  assert.equal(db.artifacts.length,0);
});
test("R08-03 stale head and runtime versions leave no partial state",async()=>{
  const {service,db}=fixture(); await service.issue(issue());
  for(const patch of [{expectedVersion:2},{expectedHandoffId:uuid(88)},{sourceRuntimeVersion:6}]) {
    const stale=HandoffMutationSchema.parse({...replacement(),...patch}); db.register(stale);
    const before=db.snapshot(); await assert.rejects(()=>service.supersede(stale),/CONCURRENT_MODIFICATION/); assert.equal(db.snapshot(),before);
  }
});
test("R08-03 late failure rolls back artifact, lineage, pointer and operation",async()=>{
  const {service,db}=fixture(); db.failLate=true; let before=db.snapshot();
  await assert.rejects(()=>service.issue(issue()),/PROVIDER_UNAVAILABLE/); assert.equal(db.snapshot(),before);
  db.failLate=false; await service.issue(issue()); db.failLate=true; before=db.snapshot();
  await assert.rejects(()=>service.supersede(replacement()),/PROVIDER_UNAVAILABLE/); assert.equal(db.snapshot(),before);
});
test("R08-03 authentication/access denied before material port, including read paths",async()=>{
  const {db,access,identity}=fixture(); let calls=0;
  const port:HandoffPort={mutate:async()=>{calls++;throw Error("unexpected");},current:async()=>{calls++;return null;},list:async()=>{calls++;return[];}};
  const unauthenticated=new GovernedHandoff({current:async()=>null},access,port);
  await assert.rejects(()=>unauthenticated.issue(issue()),/AUTHENTICATION_REQUIRED/);
  const denied=new GovernedHandoff(identity,{...access,findAccess:async()=>null},port);
  await assert.rejects(()=>denied.issue(issue()),/ACCESS_DENIED/);
  await assert.rejects(()=>denied.current({discoveryId}),/ACCESS_DENIED/);
  await assert.rejects(()=>denied.history({discoveryId}),/ACCESS_DENIED/);
  await assert.rejects(()=>new GovernedHandoff(identity,access,db).issue({...issue(),discoveryId:uuid(99)}),/ACCESS_DENIED/);
  assert.equal(calls,0);
});
test("R08-03 altered replay and revoked replay rejected; no duplicate consequences",async()=>{
  const {service,db}=fixture(); await service.issue(issue()); const before=db.snapshot();
  await assert.rejects(()=>service.issue({...issue(),issuedAt:"2026-09-22T12:01:00Z"}),/CONCURRENT_MODIFICATION/);
  db.authority={...db.authority,status:"REVOKED"};
  await assert.rejects(()=>service.issue(issue()),/ACCESS_DENIED/); assert.equal(db.snapshot(),before);
});
test("R08-03 current is explicit, not inferred from latest list",async()=>{
  const {service,db}=fixture(); await service.issue(issue()); db.currentId=null;
  assert.equal(await service.current({discoveryId}),null);
  assert.equal((await service.history({discoveryId})).length,1);
});
test("R08-03 AI/client supplied governance flags are rejected",async()=>{
  const {service,db}=fixture();
  for(const extra of [{authorized:true},{authority:"HUMAN_GOVERNANCE_AUTHORITY"},{aiApproved:true},{status:"ISSUED"}])
    await assert.rejects(()=>service.issue({...issue(),...extra}),/INVALID_INPUT/);
  assert.equal(db.artifacts.length,0);
});
test("R08-03 adapter uses only typed guarded RPCs and sanitizes errors",async()=>{
  const {db}=fixture(); const result=await db.mutate(actor,issue());
  const calls:{name:string;args:unknown}[]=[]; let code:string|null=null; let malformed=false;
  const gateway={rpc:async(name:string,args:unknown)=>{
    calls.push({name,args});
    const history=(args as {p_history?:boolean}).p_history;
    return {data:malformed?{private:"do not expose"}:history?[result]:result,error:code?{code,message:"private diagnostics"}:null};
  }};
  const adapter=new SupabaseHandoffAdapter(gateway as unknown as ConstructorParameters<typeof SupabaseHandoffAdapter>[0]);
  assert.deepEqual(await adapter.mutate(actor,issue()),result);
  assert.deepEqual(await adapter.current(actor,discoveryId),result);
  assert.deepEqual(await adapter.list(actor,discoveryId),[result]);
  assert.deepEqual(calls.map(c=>c.name),["agent_b_mutate_handoff","agent_b_read_handoff","agent_b_read_handoff"]);
  assert.deepEqual(calls[0].args,{p_actor:actor,p_input:issue()});
  for(const [provider,expected] of [["42501","ACCESS_DENIED"],["40001","CONCURRENT_MODIFICATION"],["23505","CONCURRENT_MODIFICATION"],["22023","INVALID_INPUT"],["unknown","PROVIDER_UNAVAILABLE"]]) {
    code=provider; await assert.rejects(()=>adapter.mutate(actor,issue()),(error:Error)=>error.message===expected);
  }
  code=null; malformed=true; await assert.rejects(()=>adapter.current(actor,discoveryId),/PROVIDER_UNAVAILABLE/);
});
test("R08-03 SQL enforces transactional decision/CAS/replay, immutability, RLS and source snapshot",()=>{
  const sql=readFileSync(new URL("../../supabase/migrations/20260922000700_agent_b_reconciliation.sql",import.meta.url),"utf8");
  const section=sql.split("-- R08-03:")[1].split("-- R08-CTX:")[0];
  const mutation=section.split("create function agent_b_private.mutate_handoff")[1].split("create function public.agent_b_mutate_handoff")[0];
  assert.match(mutation,/lock_governance_access\(p_actor,d\)/);
  assert.match(mutation,/validate_human_decision\(p_actor,intent\)/);
  assert.ok(mutation.indexOf("validate_human_decision")<mutation.indexOf("return replay.result"));
  assert.ok(mutation.indexOf("return replay.result")<mutation.indexOf("insert into public.agent_b_handoffs"));
  assert.match(mutation,/replay.request is distinct from p_input/);
  assert.match(mutation,/head.handoff_id is distinct from prior_id or head.version is distinct from expected/);
  assert.match(mutation,/runtime.runtime_version is distinct from/);
  assert.match(mutation,/next_version:=expected\+1/);
  assert.match(mutation,/current_state/);
  assert.match(mutation,/insert into public.agent_b_handoff_supersessions/);
  assert.doesNotMatch(mutation,/update public.agent_b_handoffs|exception when|commit;|rollback;|update public.agent_b_runtime_state/i);
  for(const table of ["operations","current","supersessions"]) {
    assert.match(section,new RegExp(`alter table public.agent_b_handoff_${table} enable row level security`));
    assert.match(section,new RegExp(`on public.agent_b_handoff_${table} for select to authenticated`));
  }
  for(const trigger of ["handoff","handoff_operation","handoff_supersession"])
    assert.match(section,new RegExp(`create trigger agent_b_${trigger}_immutable before update or delete`));
  assert.match(section,/foreign key\(discovery_id,decision_id\)/);
  assert.doesNotMatch(section,/on delete cascade|grant (?:insert|update|delete|all).*to authenticated/i);
});
test("B08 briefing remains deterministic and derived independently from issuance",()=>{
  const runtime={discoveryId,runtimeVersion:RuntimeVersionSchema.parse(7),freshness:"CURRENT",current:{informationRecordId:"info"},pending:[]} as unknown as DiscoveryRuntime;
  assert.deepEqual(deriveWorkingBriefing(runtime),deriveWorkingBriefing(runtime));
  assert.equal(HandoffSchema.safeParse(deriveWorkingBriefing(runtime)).success,false);
});
