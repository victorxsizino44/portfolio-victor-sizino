import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { GovernedEvidenceLifecycle } from "../../lib/agent-b/application/evidence-lifecycle.ts";
import { EvidenceFoundation } from "../../lib/agent-b/application/evidence.ts";
import { SupabaseEvidenceAdapter } from "../../lib/agent-b/infrastructure/supabase/evidence.server.ts";
import { EvidenceMutationSchema,PersistedEvidenceSchema,type EvidenceMutation,type EvidenceRead,type PersistedEvidence } from "../../lib/agent-b/core/evidence-lifecycle.ts";
import { EvidenceCandidateSchema,ExtractedRepresentationSchema,FileReferenceSchema,StoredObjectSchema,type EvidenceCandidate,type ExtractedRepresentation } from "../../lib/agent-b/core/evidence.ts";
import { assertDecisionMatches,GovernanceAuthoritySchema,HumanDecisionSchema,DecisionValidationSchema,type HumanDecision } from "../../lib/agent-b/core/governance.ts";
import { FoundationError,AuthenticatedIdentitySchema,DiscoveryAccessSchema,DiscoveryRootSchema } from "../../lib/agent-b/core/identity-access.ts";
import { HumanDecisionReferenceSchema } from "../../lib/agent-b/core/primitives.ts";
import type { EvidencePersistencePort } from "../../lib/agent-b/ports/evidence.ts";
import type { IdentityPort } from "../../lib/agent-b/ports/identity.ts";
import type { DiscoveryPersistencePort } from "../../lib/agent-b/ports/discovery-persistence.ts";
const stamp="2026-09-22T12:00:00Z";const source={sourceId:"source",reference:"synthetic"};
const uuid=(n:number)=>"00000000-0000-4000-8000-"+n.toString().padStart(12,"0");
type Mutation=Exclude<EvidenceMutation,{action:"DEFER"}>;
// Transaction contract model, not an assertion that PostgreSQL was executed.
class MemoryEvidence implements EvidencePersistencePort {
  representations=new Map<string,ExtractedRepresentation>();candidates=new Map<string,EvidenceCandidate>();
  rows:PersistedEvidence[]=[];links:{evidenceVersion:number;informationRecordId:string;informationVersion:number}[]=[];
  operations=new Map<string,{input:Mutation;result:unknown}>();calls=0;intact=true;denied=false;failBeforeCommit=false;
  information={id:"information",version:4,current:true};runtimeVersion=12;
  authority=GovernanceAuthoritySchema.parse({authorityId:"authority",actorIdentityId:"actor",discoveryId:"d",role:"HUMAN_GOVERNANCE_AUTHORITY",status:"ACTIVE",version:0});
  decisions=new Map<string,HumanDecision>();
  private authorize(actor:string,discovery:string){if(this.denied||actor!=="actor"||discovery!=="d")throw new FoundationError("ACCESS_DENIED");}
  async read(actor:string,input:EvidenceRead){this.authorize(actor,input.discoveryId);return structuredClone(this.rows.filter(r=>r.evidence.evidenceId===input.evidenceId).at(-1)??null);}
  async history(actor:string,input:EvidenceRead){this.authorize(actor,input.discoveryId);return structuredClone(this.rows.filter(r=>r.evidence.evidenceId===input.evidenceId));}
  async mutate(actor:string,input:Mutation){
    this.calls++;this.authorize(actor,input.discoveryId);
    if(input.action==="VALIDATE"||input.action==="REJECT"||input.action==="SUPERSEDE"){
      const decision=this.decisions.get(input.decision.decisionId);if(!decision)throw new FoundationError("ACCESS_DENIED");
      assertDecisionMatches(this.authority,decision,DecisionValidationSchema.parse({discoveryId:input.discoveryId,action:input.action==="VALIDATE"?"VALIDATE_EVIDENCE":input.action==="REJECT"?"REJECT_EVIDENCE":"SUPERSEDE_EVIDENCE",targetType:"EVIDENCE",targetId:input.evidenceId,targetVersion:input.expectedEntityVersion,outcome:input.action==="VALIDATE"?"VALIDATED":input.action==="REJECT"?"REJECTED":"SUPERSEDED",operationId:input.operationId,reference:input.decision}),actor);
    }
    const replay=this.operations.get(input.operationId);
    if(replay){assert.deepEqual(input,replay.input,"replay altered");return structuredClone(replay.result);}
    let result:unknown;let newRow:PersistedEvidence|undefined;
    if(input.action==="PERSIST_REPRESENTATION"){
      if(!this.intact||input.representation.fileReferenceId!=="ref-object")throw new FoundationError("INVALID_INPUT");
      if(this.representations.has(input.representation.representationId))throw new FoundationError("CONCURRENT_MODIFICATION");
      result=input.representation;
    }else if(input.action==="PERSIST_CANDIDATE"){
      if(this.representations.get(input.candidate.representationId)?.status!=="EXTRACTED")throw new FoundationError("INVALID_INPUT");
      if(this.candidates.has(input.candidate.candidateId))throw new FoundationError("CONCURRENT_MODIFICATION");
      result=input.candidate;
    }else{
      const prior=this.rows.filter(r=>r.evidence.evidenceId===input.evidenceId).at(-1);
      if(input.action==="RECEIVE"){
        if(prior)throw new FoundationError("CONCURRENT_MODIFICATION");
        const candidate=this.candidates.get(input.candidateId);
        if(!candidate||!this.intact||this.rows.some(r=>r.evidence.candidateId===input.candidateId))throw new FoundationError("INVALID_INPUT");
        newRow=PersistedEvidenceSchema.parse({evidence:{evidenceId:input.evidenceId,discoveryId:input.discoveryId,candidateId:candidate.candidateId,statement:candidate.statement,validation:"RECEIVED",source,createdAt:stamp},entityVersion:0,previousVersion:null,operationId:input.operationId,decision:null,informationTarget:null});
      }else{
        if(!prior)throw new FoundationError("INVALID_INPUT");
        if(prior.entityVersion!==input.expectedEntityVersion)throw new FoundationError("CONCURRENT_MODIFICATION");
        if(input.action==="VALIDATE"&&(input.informationRecordId!==this.information.id||input.informationVersion!==this.information.version||!this.information.current))throw new FoundationError("CONCURRENT_MODIFICATION");
        newRow=PersistedEvidenceSchema.parse({evidence:{...prior.evidence,validation:input.action==="VALIDATE"?"VALIDATED":input.action==="REJECT"?"REJECTED":"SUPERSEDED"},entityVersion:prior.entityVersion+1,previousVersion:prior.entityVersion,operationId:input.operationId,decision:input.decision,informationTarget:input.action==="VALIDATE"?{informationRecordId:input.informationRecordId,informationVersion:input.informationVersion}:null});
      }
      result=newRow;
    }
    if(this.failBeforeCommit)throw new FoundationError("PROVIDER_UNAVAILABLE");
    if(input.action==="PERSIST_REPRESENTATION")this.representations.set(input.representation.representationId,structuredClone(input.representation));
    if(input.action==="PERSIST_CANDIDATE")this.candidates.set(input.candidate.candidateId,structuredClone(input.candidate));
    if(newRow){this.rows.push(newRow);if(newRow.informationTarget)this.links.push({evidenceVersion:newRow.entityVersion,...newRow.informationTarget});}
    this.operations.set(input.operationId,{input:structuredClone(input),result:structuredClone(result)});return structuredClone(result);
  }
}
function fixture(){
  const repository=new MemoryEvidence();
  const identity:Pick<IdentityPort,"current">={current:async()=>AuthenticatedIdentitySchema.parse({identityId:"actor",kind:"ANONYMOUS"})};
  const access:Pick<DiscoveryPersistencePort,"readRoot"|"findAccess">={readRoot:async()=>DiscoveryRootSchema.parse({discoveryId:"d",ownerId:"actor",entityVersion:0,createdAt:stamp}),findAccess:async()=>DiscoveryAccessSchema.parse({discoveryId:"d",identityId:"actor",role:"OWNER"})};
  return {repository,identity,access,service:new GovernedEvidenceLifecycle(identity,access,repository)};
}
const representation=ExtractedRepresentationSchema.parse({representationId:"repr",fileReferenceId:"ref-object",status:"EXTRACTED",text:"untrusted synthetic text",createdAt:stamp});
const candidate=EvidenceCandidateSchema.parse({candidateId:"candidate",discoveryId:"d",representationId:"repr",locator:"line:1",statement:"unverified assertion",status:"CANDIDATE"});
const receive={discoveryId:"d",operationId:uuid(3),action:"RECEIVE",candidateId:"candidate",evidenceId:"e"};
async function prepare(f=fixture()){
  await f.service.mutate({discoveryId:"d",operationId:uuid(1),action:"PERSIST_REPRESENTATION",representation});
  await f.service.mutate({discoveryId:"d",operationId:uuid(2),action:"PERSIST_CANDIDATE",candidate});return f;
}
function human(repository:MemoryEvidence,action:"VALIDATE"|"REJECT"|"SUPERSEDE"="VALIDATE",version=0,op=4){
  const decision=HumanDecisionSchema.parse({decisionId:"decision-"+op,discoveryId:"d",authorityId:"authority",actorIdentityId:"actor",action:action==="VALIDATE"?"VALIDATE_EVIDENCE":action==="REJECT"?"REJECT_EVIDENCE":"SUPERSEDE_EVIDENCE",targetType:"EVIDENCE",targetId:"e",targetVersion:version,outcome:action==="VALIDATE"?"VALIDATED":action==="REJECT"?"REJECTED":"SUPERSEDED",operationId:uuid(op),recordedAt:stamp,version:0});
  repository.decisions.set(decision.decisionId,decision);
  return EvidenceMutationSchema.parse({discoveryId:"d",operationId:uuid(op),action,evidenceId:"e",expectedEntityVersion:version,decision:HumanDecisionReferenceSchema.parse({decisionId:decision.decisionId,source,recordedAt:stamp}),...(action==="VALIDATE"?{informationRecordId:"information",informationVersion:4}:{})});
}
test("Evidence persists representation and candidate without semantic acceptance",async()=>{
  const f=await prepare();assert.deepEqual(f.repository.representations.get("repr"),representation);assert.deepEqual(f.repository.candidates.get("candidate"),candidate);assert.equal(f.repository.rows.length,0);
});
test("Evidence deterministic receipt remains RECEIVED, never VALIDATED",async()=>{
  const f=await prepare();const row=PersistedEvidenceSchema.parse(await f.service.mutate(receive));
  assert.equal(row.evidence.validation,"RECEIVED");assert.equal(row.entityVersion,0);assert.equal(row.decision,null);assert.equal(row.informationTarget,null);
  assert.deepEqual(await f.service.mutate(receive),row);assert.equal(f.repository.rows.length,1);assert.equal(f.repository.runtimeVersion,12);
});
test("Evidence integrity/provenance failure rejects receipt without writes",async()=>{
  const f=await prepare();f.repository.intact=false;await assert.rejects(()=>f.service.mutate(receive),/INVALID_INPUT/);assert.equal(f.repository.rows.length,0);assert.equal(f.repository.operations.size,2);
});
test("Evidence direct CANDIDATE to VALIDATED is rejected even with a valid decision",async()=>{
  const f=await prepare();await assert.rejects(()=>f.service.mutate(human(f.repository)),/INVALID_INPUT/);assert.equal(f.repository.rows.length,0);assert.equal(f.repository.links.length,0);
});
test("Evidence VALIDATED has verified HumanDecision and explicit versioned Information link",async()=>{
  const f=await prepare();await f.service.mutate(receive);const row=PersistedEvidenceSchema.parse(await f.service.mutate(human(f.repository)));
  assert.equal(row.evidence.validation,"VALIDATED");assert.equal(row.entityVersion,1);
  assert.deepEqual(row.informationTarget,{informationRecordId:"information",informationVersion:4});
  assert.deepEqual(f.repository.links,[{evidenceVersion:1,informationRecordId:"information",informationVersion:4}]);
});
for(const [name,patch] of Object.entries({revoked:{status:"REVOKED"},discovery:{discoveryId:"other"},actor:{actorIdentityId:"other"},authority:{authorityId:"other"}})){
  test("Evidence rejects "+name+" authority with zero state change",async()=>{
    const f=await prepare();await f.service.mutate(receive);const input=human(f.repository);
    f.repository.authority=GovernanceAuthoritySchema.parse({...f.repository.authority,...patch});
    await assert.rejects(()=>f.service.mutate(input),/ACCESS_DENIED/);assert.equal(f.repository.rows.length,1);assert.equal(f.repository.links.length,0);
  });
}
for(const [name,patch] of Object.entries({action:{action:"ISSUE_HANDOFF"},target:{targetId:"other"},targetType:{targetType:"INFORMATION"},version:{targetVersion:5}})){
  test("Evidence rejects decision "+name+" mismatch",async()=>{
    const f=await prepare();await f.service.mutate(receive);const input=human(f.repository);
    const decision=f.repository.decisions.values().next().value!;f.repository.decisions.set(decision.decisionId,HumanDecisionSchema.parse({...decision,...patch}));
    await assert.rejects(()=>f.service.mutate(input),/ACCESS_DENIED/);assert.equal(f.repository.rows.length,1);
  });
}
test("Evidence missing decision and ownership alone never authorize validation",async()=>{
  const f=await prepare();await f.service.mutate(receive);const input=human(f.repository);f.repository.decisions.clear();
  await assert.rejects(()=>f.service.mutate(input),/ACCESS_DENIED/);assert.equal(f.repository.rows.length,1);
  await assert.rejects(()=>f.service.mutate({...input,decision:undefined}),/INVALID_INPUT/);
});
for(const action of ["REJECT","SUPERSEDE"] as const)test("Evidence "+action+" persists authorized lineage",async()=>{
  const f=await prepare();const first=await f.service.mutate(receive);const row=PersistedEvidenceSchema.parse(await f.service.mutate(human(f.repository,action)));
  assert.equal(row.evidence.validation,action==="REJECT"?"REJECTED":"SUPERSEDED");assert.equal(row.previousVersion,0);
  const history=await f.service.history({discoveryId:"d",evidenceId:"e"});assert.equal(history.length,2);assert.deepEqual(history[0],first);
});
test("Evidence DEFER never invokes persistence mutation or creates an operation",async()=>{
  const f=await prepare();await f.service.mutate(receive);const calls=f.repository.calls;
  const before=JSON.stringify(f.repository.rows);await f.service.mutate({action:"DEFER",discoveryId:"d",evidenceId:"e"});
  assert.equal(f.repository.calls,calls);assert.equal(JSON.stringify(f.repository.rows),before);assert.equal(f.repository.operations.size,3);
});
test("Evidence stale CAS rejects without second revision or Information link",async()=>{
  const f=await prepare();await f.service.mutate(receive);await f.service.mutate(human(f.repository));
  await assert.rejects(()=>f.service.mutate(human(f.repository,"REJECT",0,5)),/CONCURRENT_MODIFICATION/);assert.equal(f.repository.rows.length,2);assert.equal(f.repository.links.length,1);
});
test("Evidence accepted operation replay cannot duplicate effects or republish historical state",async()=>{
  const f=await prepare();const received=await f.service.mutate(receive);const input=human(f.repository);const validated=await f.service.mutate(input);
  assert.deepEqual(await f.service.mutate(input),validated);assert.deepEqual(await f.service.mutate(receive),received);
  assert.equal(f.repository.rows.length,2);assert.equal(f.repository.links.length,1);
  assert.equal((await f.service.read({discoveryId:"d",evidenceId:"e"}))?.evidence.validation,"VALIDATED");
});
test("Evidence failed final write leaves lifecycle, lineage, link and ledger unchanged",async()=>{
  const f=await prepare();await f.service.mutate(receive);f.repository.failBeforeCommit=true;
  await assert.rejects(()=>f.service.mutate(human(f.repository)),/PROVIDER_UNAVAILABLE/);
  assert.equal(f.repository.rows.length,1);assert.equal(f.repository.links.length,0);assert.equal(f.repository.operations.size,3);
});
test("Evidence rejects stale/noncurrent Information targets atomically",async()=>{
  const f=await prepare();await f.service.mutate(receive);f.repository.information.current=false;
  await assert.rejects(()=>f.service.mutate(human(f.repository)),/CONCURRENT_MODIFICATION/);assert.equal(f.repository.rows.length,1);
  f.repository.information.current=true;f.repository.information.version=5;
  await assert.rejects(()=>f.service.mutate(human(f.repository)),/CONCURRENT_MODIFICATION/);assert.equal(f.repository.links.length,0);
});
test("Evidence denies unauthenticated and cross-Discovery access before persistence",async()=>{
  const f=fixture();f.identity.current=async()=>null;await assert.rejects(()=>f.service.mutate(receive),/AUTHENTICATION_REQUIRED/);assert.equal(f.repository.calls,0);
  const g=fixture();g.access.findAccess=async()=>null;await assert.rejects(()=>g.service.mutate(receive),/ACCESS_DENIED/);assert.equal(g.repository.calls,0);
  const h=fixture();await assert.rejects(()=>h.service.read({discoveryId:"other",evidenceId:"e"}),/ACCESS_DENIED/);
});
test("Evidence AI assessment and a raw candidate have zero lifecycle authority",async()=>{
  const f=fixture();
  await assert.rejects(()=>f.service.mutate({kind:"EVIDENCE_ASSESSMENT_CANDIDATE",evidenceId:"e",assessment:"validate"}),/INVALID_INPUT/);
  await assert.rejects(()=>f.service.mutate(candidate),/INVALID_INPUT/);assert.equal(f.repository.calls,0);
});
test("Evidence SQL uses atomic decision/CAS/link/ledger boundary and restricts direct DML",()=>{
  const sql=readFileSync(new URL("../../supabase/migrations/20260922000700_agent_b_reconciliation.sql",import.meta.url),"utf8");
  const body=sql.split("create function agent_b_private.mutate_evidence")[1].split("create function public.agent_b_register_evidence_file")[0];
  assert.ok(body.indexOf("lock_governance_access")<body.indexOf("insert into"));
  assert.ok(body.indexOf("validate_human_decision")<body.indexOf("insert into public.agent_b_governed_evidence"));
  assert.match(body,/prior.entity_version<>expected/);assert.match(body,/existing.request is distinct from p_input/);
  assert.match(body,/insert into public.agent_b_evidence_information_links/);assert.match(body,/insert into public.agent_b_evidence_operations/);
  assert.match(sql,/foreign key\(discovery_id,information_record_id,information_version\).*on delete restrict/);
  assert.match(sql,/agent_b_evidence_immutable before update or delete/);
  assert.match(sql,/evidence_cleanup_allowed/);assert.match(sql,/for share/);
  assert.doesNotMatch(body,/update public.agent_b_runtime_state|update public.agent_b_information_records/);
});
test("Evidence adapter hashes upload bytes, keeps private MIME limits and rejects tampered extraction",async()=>{
  const calls:unknown[]=[];const bytes=new TextEncoder().encode("hello");
  const client={auth:{getUser:async()=>({data:{user:{id:"actor"}},error:null})},storage:{from:(bucket:string)=>({upload:async(path:string,body:Uint8Array,options:unknown)=>{calls.push({bucket,path,body,options});return {error:null};},remove:async()=>({error:null})})},rpc:async(name:string,args:unknown)=>{calls.push({name,args});return {data:null,error:null};}};
  const adapter=new SupabaseEvidenceAdapter(client as unknown as ConstructorParameters<typeof SupabaseEvidenceAdapter>[0]);
  const output=await new EvidenceFoundation(adapter).upload({discoveryId:"d",objectId:"object",path:"d/object",bytes,contentType:"text/plain",source,createdAt:stamp});
  assert.equal(output.stored.sha256,createHash("sha256").update(bytes).digest("hex"));
  assert.deepEqual((calls[0] as {options:unknown}).options,{contentType:"text/plain",upsert:false});
  assert.equal((calls[0] as {bucket:string}).bucket,"agent-b-private");
  assert.equal((await adapter.extract(output.stored,output.reference,bytes)).text,"hello");
  await assert.rejects(()=>adapter.extract(output.stored,output.reference,new Uint8Array([0])),/INVALID_INPUT/);
  const binary=new Uint8Array([255]);const file=StoredObjectSchema.parse({...output.stored,byteSize:1,sha256:createHash("sha256").update(binary).digest("hex")});
  assert.equal((await adapter.extract(file,FileReferenceSchema.parse(output.reference),binary)).status,"FAILED");
  assert.equal((await adapter.extract({...file,fileType:"PNG"},output.reference,binary)).status,"UNSUPPORTED");
});
