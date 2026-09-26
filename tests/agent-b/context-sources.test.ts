import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { CatalogPublicationSchema, GovernedCatalogSchema, composeApplicability, publicationIntent, type CatalogPublication, type GovernedCatalog } from "../../lib/agent-b/core/context-sources.ts";
import { DiscoveryScopeContractSchema } from "../../lib/agent-b/core/mc02.ts";
import { GovernanceAuthoritySchema, HumanDecisionSchema, assertDecisionMatches } from "../../lib/agent-b/core/governance.ts";
import { projectContextSources } from "../../lib/agent-b/application/context-source-projection.ts";
import { deriveGovernedContext } from "../../lib/agent-b/application/governed-context.ts";
import { ContextRequestSchema } from "../../lib/agent-b/ports/governed-context.ts";
import { VALIDATION_PIPELINE } from "../../lib/agent-b/core/mc01.ts";
import { TimestampSchema } from "../../lib/agent-b/core/primitives.ts";
const uuid=(n:number)=>"00000000-0000-4000-8000-"+String(n).padStart(12,"0");
const d=uuid(1), actor=uuid(2), stamp="2026-09-23T12:00:00Z";
const ref={decisionId:"decision",source:{sourceId:"human",reference:"explicit"},recordedAt:stamp};
const field=(id="field",requirement="REQUIRED",scopeBinding:unknown={kind:"DISCOVERY_WIDE"})=>({fieldId:id,requirement,scopeBinding,
  contract:{fieldId:id,domainId:"domain",entityVersion:0,informationRecordIds:[],completion:{level:"FIELD",status:"INCOMPLETE",dependencies:[]}}});
function publication(version=0):CatalogPublication {return CatalogPublicationSchema.parse({catalog:{kind:"FIELD_CATALOG",catalogId:"catalog",discoveryId:d,version,status:"PUBLISHED",predecessorVersion:version===0?null:version-1,createdAt:stamp,completeness:"COMPLETE",definitions:[field()]},expectedVersion:version===0?null:version-1,operationId:uuid(10+version),decision:ref});}
function scope(states:string[]) {return DiscoveryScopeContractSchema.parse({discoveryId:d,entityVersion:0,kind:"SCOPED_SEGMENTS",segments:states.map((applicability,i)=>({segmentId:String(i),applicability,boundary:"INCLUDED"}))});}
for(const [states,expected] of [
  [["APPLICABLE","EXCLUDED"],"APPLICABLE"],[["APPLICABLE","CANDIDATE"],"APPLICABLE"],[["APPLICABLE","UNRESOLVED"],"APPLICABLE"],
  [["APPLICABLE"],"APPLICABLE"],[["EXCLUDED"],"UNRESOLVED"],[["EXCLUDED","CANDIDATE"],"CANDIDATE"],
  [["EXCLUDED","UNRESOLVED"],"UNRESOLVED"],[["CANDIDATE","UNRESOLVED"],"UNRESOLVED"],[["EXCLUDED","EXCLUDED"],"EXCLUDED"],
] as [string[],string][]) test("R08-06 segment composition "+states.join("+")+" = "+expected,()=>{
  assert.equal(composeApplicability({kind:"SEGMENT_BOUND",segmentIds:["0","1"]},scope(states),true),expected);
});
test("R08-06 DISCOVERY_WIDE ignores mixed segment applicability; invalid context remains unresolved",()=>{
  assert.equal(composeApplicability({kind:"DISCOVERY_WIDE"},scope(["EXCLUDED","CANDIDATE","UNRESOLVED"]),true),"APPLICABLE");
  assert.equal(composeApplicability({kind:"DISCOVERY_WIDE"},scope(["EXCLUDED"]),false),"UNRESOLVED");
});
function raw() {return {runtime:{discoveryId:d,runtimeVersion:0,freshness:"CURRENT",current:{sessionId:"session",scopeVersion:0,pendingIds:[] as string[]},pending:[] as unknown[]},
 session:{sessionId:"session",discoveryId:d,previousSessionId:null,lifecycle:"OPEN",createdAt:stamp},information:[] as unknown[],classification:null,
 scope:scope(["APPLICABLE","EXCLUDED","UNRESOLVED","CANDIDATE"]),catalog:publication().catalog as unknown,
 dependencies:{catalogId:"deps",discoveryId:d,kind:"DEPENDENCY_CATALOG",version:0,predecessorVersion:null,status:"PUBLISHED",createdAt:stamp,definitions:[] as unknown[]} as unknown};}
const derive=(r:ReturnType<typeof raw>)=>deriveGovernedContext(ContextRequestSchema.parse({discoveryId:d,sessionId:"session"}),projectContextSources(r,d));
test("R08-06 complete sources count 1; optional and excluded do not increment; explicit empty complete catalog yields 0",()=>{
 const r=raw();const c=publication().catalog;if(c.kind!=="FIELD_CATALOG")throw Error();
 c.definitions=CatalogPublicationSchema.parse({...publication(),catalog:{...c,definitions:[field(),field("optional","OPTIONAL"),field("excluded","REQUIRED",{kind:"SEGMENT_BOUND",segmentIds:["1"]})]}}).catalog.definitions as typeof c.definitions;
 r.catalog=c;assert.equal(derive(r).missingFieldCount,1);c.definitions=[];assert.equal(derive(r).missingFieldCount,0);
});
test("R08-06 current information satisfies required field without validated Evidence",()=>{
 const r=raw();Object.assign(r.runtime.current,{informationRecordId:"record"});
 r.information=[{recordId:"record",discoveryId:d,fieldId:"field",domainId:"domain",entityVersion:0,content:{kind:"STATEMENT",value:"synthetic"},sources:[],evidence:[],confidence:{level:"UNVERIFIED",sources:[]},validation:{steps:VALIDATION_PIPELINE.map(stage=>({stage,result:{status:"PENDING"}}))}}];
 assert.equal(derive(r).missingFieldCount,0);
});
test("R08-06 INCOMPLETE, absent catalog and material uncertain bindings produce null",()=>{
 const r=raw();const c=publication().catalog;if(c.kind!=="FIELD_CATALOG")throw Error();
 c.completeness="INCOMPLETE";r.catalog=c;assert.equal(derive(r).missingFieldCount,null);
 for(const segment of ["2","3","missing"]){r.catalog={...c,completeness:"COMPLETE",definitions:[field("field","REQUIRED",{kind:"SEGMENT_BOUND",segmentIds:[segment]})]};assert.equal(derive(r).missingFieldCount,null);}
 r.catalog=null;assert.equal(derive(r).missingFieldCount,null);
});
test("R08-06 dependency identity, criticality, sufficient absence and missing source",()=>{
 const r=raw();assert.equal(derive(r).unresolvedCriticalPending,"FALSE");
 r.runtime.pending=[{pendingId:"p",state:"PENDING",reference:"ignored",dependencyId:"dep"}];r.runtime.current.pendingIds=["p"];
 const cat=r.dependencies as {definitions:unknown[]};
 const def={dependencyId:"dep",contract:{dependencyId:"dep",critical:true,target:{kind:"DISCOVERY",discoveryId:d},status:"UNRESOLVED"},scopeBinding:{kind:"DISCOVERY_WIDE"}};
 cat.definitions=[def];assert.equal(derive(r).unresolvedCriticalPending,"TRUE");
 def.contract.critical=false;assert.equal(derive(r).unresolvedCriticalPending,"FALSE");
 cat.definitions=[{...def,scopeBinding:{kind:"SEGMENT_BOUND",segmentIds:["2"]}}];assert.equal(derive(r).unresolvedCriticalPending,"UNKNOWN");
 cat.definitions=[];assert.equal(derive(r).unresolvedCriticalPending,"UNKNOWN");
 r.dependencies=null;r.runtime.pending=[];r.runtime.current.pendingIds=[];assert.equal(derive(r).unresolvedCriticalPending,"UNKNOWN");
});
test("R08-06 projection is deterministic/read-only, rejects foreign sources and client semantics",()=>{
 const r=raw();const before=JSON.stringify(r);assert.deepEqual(derive(r),derive(r));assert.equal(JSON.stringify(r),before);
 assert.equal(ContextRequestSchema.safeParse({discoveryId:d,sessionId:"session",missingFieldCount:0}).success,false);
 r.catalog={...publication().catalog,discoveryId:uuid(99)};assert.throws(()=>derive(r),/ACCESS_DENIED/);
});
// Transactional contract model; real PostgreSQL validation is a separate gate.
class CatalogStore {
 rows:GovernedCatalog[]=[];requests=new Map<string,string>();current:GovernedCatalog|null=null;fail=false;
 authority=GovernanceAuthoritySchema.parse({authorityId:"authority",discoveryId:d,actorIdentityId:actor,role:"HUMAN_GOVERNANCE_AUTHORITY",status:"ACTIVE",version:0});
 publish(input:CatalogPublication,patch:Record<string,unknown>={}) {
  const intent=publicationIntent(input);
  const {reference: _reference,...decisionIntent}=intent;
  const decision=HumanDecisionSchema.parse({...decisionIntent,decisionId:ref.decisionId,recordedAt:stamp,authorityId:"authority",actorIdentityId:actor,version:0,...patch});
  assertDecisionMatches(this.authority,decision,intent,actor);
  const prior=this.requests.get(input.operationId);
  if(prior){if(prior!==JSON.stringify(input))throw Error("CONFLICT");return structuredClone(this.rows.find(r=>r.version===input.catalog.version)!);}
  if((this.current?.version??null)!==input.expectedVersion)throw Error("STALE");
  if(this.fail)throw Error("ROLLBACK");
  this.rows.push(structuredClone(input.catalog));this.current=structuredClone(input.catalog);this.requests.set(input.operationId,JSON.stringify(input));return structuredClone(input.catalog);
 }
}
test("R08-06 catalog publication preserves immutable versions, predecessor/current and historical replay",()=>{
 const s=new CatalogStore();const a=publication();const first=s.publish(a);s.publish(publication(1));
 assert.deepEqual(s.publish(a),first);assert.equal(s.rows.length,2);assert.equal(s.current?.version,1);assert.equal(s.current?.predecessorVersion,0);
 first.catalogId="caller-modified";assert.equal(s.rows[0].catalogId,"catalog");
 assert.throws(()=>s.publish({...a,catalog:{...a.catalog,createdAt:TimestampSchema.parse("2026-09-24T00:00:00Z")}}),/CONFLICT/);
 assert.throws(()=>s.publish({...publication(1),operationId:uuid(88)}),/STALE/);assert.equal(s.rows.length,2);
});
test("R08-06 publication requires active matching governance, never ownership alone",()=>{
 for(const patch of [{actorIdentityId:uuid(9)},{action:"ISSUE_HANDOFF"},{discoveryId:uuid(9)},{targetId:"foreign"},{targetVersion:9},{operationId:uuid(9)},{decisionId:"missing"}]){
  const s=new CatalogStore();assert.throws(()=>s.publish(publication(),patch));assert.equal(s.rows.length,0);
 }
 const s=new CatalogStore();s.authority.status="REVOKED";assert.throws(()=>s.publish(publication()),/ACCESS_DENIED/);assert.equal(s.rows.length,0);
});
test("R08-06 failed publication has no partial state and malformed/AI material cannot publish",()=>{
 const s=new CatalogStore();s.fail=true;assert.throws(()=>s.publish(publication()),/ROLLBACK/);assert.equal(s.rows.length,0);assert.equal(s.current,null);
 assert.equal(CatalogPublicationSchema.safeParse({...publication(),decision:undefined}).success,false);
 assert.equal(CatalogPublicationSchema.safeParse({...publication(),aiApproved:true}).success,false);
 assert.equal(GovernedCatalogSchema.safeParse({...publication().catalog,version:2,predecessorVersion:0}).success,false);
});
test("R08-06 SQL limits writes to verified atomic publication with immutable history and current joins",()=>{
 const sql=readFileSync(new URL("../../supabase/migrations/20260922000900_agent_b_governed_context_sources.sql",import.meta.url),"utf8");
 assert.match(sql,/before update or delete/);assert.match(sql,/enable row level security/);assert.match(sql,/validate_human_decision\(p_actor/);
 const body=sql.split("create function agent_b_private.publish_context_catalog")[1];
 assert.ok(body.indexOf("validate_human_decision")<body.indexOf("where operation_id=op"));
 assert.ok(body.indexOf("return accepted.payload")<body.indexOf("prior.version<>expected"));
 assert.match(sql,/using\(discovery_id,kind,catalog_id,version\)/);assert.doesNotMatch(sql,/insert into public.agent_b_governance_authorities/);
});
