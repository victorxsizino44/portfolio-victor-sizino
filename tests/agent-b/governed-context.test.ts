import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { deriveGovernedContext, GovernedContextResolver } from "../../lib/agent-b/application/governed-context.ts";
import { GovernedOrchestration } from "../../lib/agent-b/application/orchestration.ts";
import { GovernedContextSnapshotSchema, ContextRequestSchema, type GovernedContextSnapshot } from "../../lib/agent-b/ports/governed-context.ts";
import { ActionCandidateSchema, InteractionActionSchema } from "../../lib/agent-b/core/mc03.ts";
import { VALIDATION_PIPELINE } from "../../lib/agent-b/core/mc01.ts";
import { TimestampSchema, SourceReferenceSchema } from "../../lib/agent-b/core/primitives.ts";
import { AuthenticatedIdentitySchema, DiscoveryRootSchema, DiscoveryAccessSchema } from "../../lib/agent-b/core/identity-access.ts";
import { SupabaseGovernedContext } from "../../lib/agent-b/infrastructure/supabase/governed-context.server.ts";
import type { IdentityPort } from "../../lib/agent-b/ports/identity.ts";
import type { DiscoveryPersistencePort } from "../../lib/agent-b/ports/discovery-persistence.ts";
const request=ContextRequestSchema.parse({discoveryId:"d",sessionId:"s"});
const source={sourceId:"source",reference:"governed"};
const stamp="2026-09-22T12:00:00Z";
function fixture():GovernedContextSnapshot {
  return GovernedContextSnapshotSchema.parse({
    runtime:{discoveryId:"d",runtimeVersion:7,freshness:"CURRENT",current:{informationRecordId:"r",classificationVersion:1,scopeVersion:1,pendingIds:[],sessionId:"s"},pending:[]},
    session:{sessionId:"s",discoveryId:"d",previousSessionId:null,lifecycle:"OPEN",createdAt:stamp},
    information:[{recordId:"r",discoveryId:"d",domainId:"domain",fieldId:"field",entityVersion:0,content:{kind:"STATEMENT",value:"synthetic"},sources:[source],evidence:[],confidence:{level:"UNVERIFIED",sources:[]},validation:{steps:VALIDATION_PIPELINE.map(stage=>({stage,result:stage==="HUMAN_CONFIRMATION"||stage==="OPERATIONAL_APPROVAL"?{status:"PASSED",decision:{decisionId:"human",source,recordedAt:stamp}}:{status:"PASSED",source,recordedAt:stamp}}))}}],
    classification:{discoveryId:"d",entityVersion:1,understandingState:"UNDERSTOOD"},
    scope:{discoveryId:"d",entityVersion:1,kind:"ONE_DISCOVERY",applicability:"APPLICABLE",boundary:"INCLUDED"},
    catalog:{complete:true,fields:[{fieldId:"field",domainId:"domain",required:true,applicability:"APPLICABLE"}]},dependencies:[],
  });
}
const derive=(s:GovernedContextSnapshot)=>deriveGovernedContext(request,s);
test("CTX positively established NONE differs from missing-source UNKNOWN; zero differs from null",()=>{
  const s=fixture();assert.equal(derive(s).informationNeed,"NONE");assert.equal(derive(s).missingFieldCount,0);
  s.catalog=null;assert.equal(derive(s).informationNeed,"UNKNOWN");assert.equal(derive(s).missingFieldCount,null);
});
test("CTX presence does not require validated evidence or completed validation",()=>{
  const s=fixture();s.information[0].validation.steps[0].result={status:"PENDING"};
  assert.equal(derive(s).missingFieldCount,0);assert.equal(derive(s).informationNeed,"UNKNOWN");
});
test("CTX counts required applicable fields only; missing alone does not declare a need",()=>{
  const s=fixture();s.catalog!.fields.push({fieldId:"absent",domainId:"domain",required:true,applicability:"APPLICABLE"},{fieldId:"optional",domainId:"domain",required:false,applicability:"APPLICABLE"},{fieldId:"excluded",domainId:"domain",required:true,applicability:"EXCLUDED"});
  assert.equal(derive(s).missingFieldCount,1);assert.equal(derive(s).informationNeed,"UNKNOWN");
  s.catalog!.fields[1].applicability="UNRESOLVED";assert.equal(derive(s).missingFieldCount,null);
});
test("CTX uses current references, never the latest supplied record",()=>{
  const s=fixture();s.information[0].recordId="latest" as typeof s.information[0]["recordId"];
  assert.throws(()=>derive(s),/PROVIDER_UNAVAILABLE/); // Dangling current reference is an integrity error, never latest-as-current.
});
test("CTX unresolved/excluded scope and duplicate catalog cannot establish a missing count",()=>{
  const s=fixture();if(s.scope?.kind==="ONE_DISCOVERY")s.scope.applicability="UNRESOLVED";
  assert.equal(derive(s).missingFieldCount,null);
  if(s.scope?.kind==="ONE_DISCOVERY")s.scope.applicability="EXCLUDED";
  assert.equal(derive(s).missingFieldCount,null);
  const d=fixture();d.catalog!.fields.push({...d.catalog!.fields[0]});
  assert.equal(derive(d).missingFieldCount,null);
});
function withDependency(s:GovernedContextSnapshot,critical=true) {
  s.runtime!.pending=[{pendingId:"p",state:"PENDING",reference:"dep",dependencyId:"dep"}];
  s.runtime!.current.pendingIds=["p"];
  s.dependencies=GovernedContextSnapshotSchema.shape.dependencies.parse([{contract:{dependencyId:"dep",critical,target:{kind:"DISCOVERY",discoveryId:"d"},status:"UNRESOLVED"},applicability:"APPLICABLE"}]);
}
test("CTX critical pending TRUE/FALSE/UNKNOWN requires reliable linkage and applicability",()=>{
  const s=fixture();assert.equal(derive(s).unresolvedCriticalPending,"FALSE");
  withDependency(s);assert.equal(derive(s).unresolvedCriticalPending,"TRUE");
  s.dependencies![0].contract.critical=false;assert.equal(derive(s).unresolvedCriticalPending,"FALSE");
  s.dependencies=null;assert.equal(derive(s).unresolvedCriticalPending,"UNKNOWN");
  withDependency(s);s.dependencies![0].applicability="UNRESOLVED";assert.equal(derive(s).unresolvedCriticalPending,"UNKNOWN");
});
test("CTX missing linkage cannot be repaired by parsing reference text",()=>{
  const s=fixture();withDependency(s);delete s.runtime!.pending[0].dependencyId;
  assert.equal(derive(s).unresolvedCriticalPending,"UNKNOWN");
});
test("CTX deterministic needs derive from governed conflict, ambiguity, failed evidence and dependency",()=>{
  const s=fixture();s.classification!.understandingState="CONFLICTING";assert.equal(derive(s).informationNeed,"CONFLICT_REQUIRES_RESOLUTION");
  s.classification!.understandingState="AMBIGUOUS";assert.equal(derive(s).informationNeed,"CLARIFICATION_REQUIRED");
  s.classification!.understandingState="UNDERSTOOD";s.information[0].validation.steps[4].result={status:"FAILED",source:SourceReferenceSchema.parse(source),recordedAt:TimestampSchema.parse(stamp)};
  assert.equal(derive(s).informationNeed,"EVIDENCE_REQUIRED");
  const d=fixture();withDependency(d);assert.equal(derive(d).informationNeed,"UNRESOLVED_DEPENDENCY");
  d.catalog!.fields.push({fieldId:"absent",domainId:"domain",required:true,applicability:"APPLICABLE"});
  d.dependencies=GovernedContextSnapshotSchema.shape.dependencies.parse([{contract:{dependencyId:"dep",critical:true,target:{kind:"FIELD",fieldId:"absent"},status:"MISSING"},applicability:"APPLICABLE"}]);
  assert.equal(derive(d).informationNeed,"MISSING_REQUIRED_INFORMATION");
});
for(const [patch,reason,resolution] of [
  [{informationNeed:"UNKNOWN"},"UNKNOWN_INFORMATION_NEED","CLARIFY"],
  [{missingFieldCount:null},"UNKNOWN_MISSING_FIELD_COUNT","REQUEST_EVIDENCE"],
  [{unresolvedCriticalPending:"UNKNOWN"},"UNKNOWN_CRITICAL_PENDING","ESCALATE"],
  [{sufficientGovernedContext:false},"INSUFFICIENT_GOVERNED_CONTEXT","BLOCK"],
] as const) test("CTX material unknown abstains: "+reason,()=>{
  const c={...derive(fixture()),...patch};const before=JSON.stringify(c);
  const a=new GovernedOrchestration().evaluate(c);
  assert.deepEqual(a,{kind:"ABSTAIN",discoveryId:"d",runtimeVersion:7,reason,resolution});
  assert.equal(JSON.stringify(c),before);assert.equal("interaction" in a,false);
});
test("CTX irrelevant unknown does not suppress independently safe action",()=>{
  const c={...derive(fixture()),informationNeed:"UNKNOWN",missingFieldCount:null,unresolvedCriticalPending:"UNKNOWN",conflictingState:true};
  const a=new GovernedOrchestration().evaluate(c);assert.equal(a.kind,"SUBSTANTIVE");if(a.kind==="SUBSTANTIVE")assert.equal(a.interaction,"CLARIFY");
  const b=new GovernedOrchestration().evaluate({...c,conflictingState:false,unresolvedCriticalPending:"TRUE"});assert.equal(b.kind,"SUBSTANTIVE");if(b.kind==="SUBSTANTIVE")assert.equal(b.interaction,"REQUEST_EVIDENCE");
});
test("CTX ABSTAIN is not an InteractionAction or a mutation instruction",()=>{
  assert.equal(InteractionActionSchema.safeParse("ABSTAIN").success,false);
  assert.equal(ActionCandidateSchema.safeParse({kind:"ABSTAIN",discoveryId:"d",runtimeVersion:0,reason:"UNKNOWN_INFORMATION_NEED",resolution:"CLARIFY",completion:"COMPLETE"}).success,false);
});
test("CTX stale runtime or terminal session produces insufficient context",()=>{
  const s=fixture();s.runtime!.freshness="HISTORICAL";assert.equal(derive(s).sufficientGovernedContext,false);
  s.runtime!.freshness="CURRENT";s.session!.lifecycle="CLOSED";assert.equal(derive(s).sufficientGovernedContext,false);
});
function resolver(s=fixture()) {
  let reads=0;
  const identity={current:async()=>AuthenticatedIdentitySchema.parse({identityId:"actor",kind:"ANONYMOUS"})} as IdentityPort;
  const access:Pick<DiscoveryPersistencePort,"readRoot"|"findAccess">={readRoot:async()=>DiscoveryRootSchema.parse({discoveryId:"d",ownerId:"actor",entityVersion:0,createdAt:stamp}),findAccess:async()=>DiscoveryAccessSchema.parse({discoveryId:"d",identityId:"actor",role:"OWNER"})};
  const repository={read:async()=>{reads++;return s;}};
  return {identity,access,repository,reads:()=>reads,service:new GovernedContextResolver(identity,access,repository)};
}
test("CTX client-derived flags are rejected before reads; resolver is deterministic and read-only",async()=>{
  const x=resolver();await assert.rejects(()=>x.service.resolve({...request,informationNeed:"NONE"}),/INVALID_INPUT/);assert.equal(x.reads(),0);
  const a=await x.service.resolve(request);const b=await x.service.resolve(request);assert.deepEqual(a,b);
});
test("CTX unauthenticated/cross-Discovery and foreign governed records are rejected",async()=>{
  const x=resolver();x.identity.current=async()=>null;
  await assert.rejects(()=>x.service.resolve(request),/AUTHENTICATION_REQUIRED/);assert.equal(x.reads(),0);
  const y=resolver();y.access.findAccess=async()=>null;
  await assert.rejects(()=>y.service.resolve(request),/ACCESS_DENIED/);assert.equal(y.reads(),0);
  const s=fixture();s.information[0].discoveryId="other" as typeof s.information[0]["discoveryId"];
  assert.throws(()=>derive(s),/ACCESS_DENIED/);
});
test("CTX SQL reader and route never accept client semantic flags or persist derived state",()=>{
  const sql=readFileSync(new URL("../../supabase/migrations/20260922000700_agent_b_reconciliation.sql",import.meta.url),"utf8").split("create function public.agent_b_read_governed_context")[1];
  assert.match(sql,/stable security invoker/);assert.match(sql,/agent_b_has_owner_access/);assert.doesNotMatch(sql,/\b(insert|update|delete)\b/i);
  const route=readFileSync(new URL("../../app/api/agent-b/orchestrate/route.ts",import.meta.url),"utf8");
  assert.match(route,/productRoute\(request, "evaluate"\)/);
  const application=readFileSync(new URL("../../lib/agent-b/application/product-runtime.ts",import.meta.url),"utf8");
  assert.match(application,/this.resolver.resolve/);assert.match(application,/ProductHandleSchema.safeParse/);
  assert.doesNotMatch(route,/evaluate\(body\)/);
});
test("CTX Supabase adapter calls scoped snapshot RPC and rejects malformed/provider results safely",async()=>{
  const calls:unknown[]=[];let error:{code:string;message:string}|null=null;let data:unknown={...fixture(),catalog:null,dependencies:null};
  const client={rpc:async(name:string,args:unknown)=>{calls.push({name,args});return {data,error};}};
  const adapter=new SupabaseGovernedContext(client as unknown as ConstructorParameters<typeof SupabaseGovernedContext>[0]);
  assert.deepEqual(await adapter.read("actor",request),{...fixture(),catalog:null,dependencies:null});
  assert.deepEqual(calls,[{name:"agent_b_read_governed_context",args:{p_actor:"actor",p_discovery:"d",p_session:"s"}}]);
  data={informationNeed:"NONE"};await assert.rejects(()=>adapter.read("actor",request),/PROVIDER_UNAVAILABLE/);
  error={code:"42501",message:"private detail"};await assert.rejects(()=>adapter.read("actor",request),(e:Error)=>e.message==="ACCESS_DENIED");
});
