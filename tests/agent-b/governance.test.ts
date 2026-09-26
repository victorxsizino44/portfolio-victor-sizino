import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { assertDecisionMatches, GovernanceAuthoritySchema, HumanDecisionSchema, DecisionValidationSchema } from "../../lib/agent-b/core/governance.ts";
import { HumanGovernance } from "../../lib/agent-b/application/governance.ts";
import type { IdentityPort } from "../../lib/agent-b/ports/identity.ts";
import type { GovernancePort } from "../../lib/agent-b/ports/governance.ts";
import { IdentityIdSchema } from "../../lib/agent-b/core/identity-access.ts";
import { SupabaseGovernance } from "../../lib/agent-b/infrastructure/supabase/governance.server.ts";

const authority = GovernanceAuthoritySchema.parse({ authorityId:"authority-1", discoveryId:"discovery-1", actorIdentityId:"human-1", role:"HUMAN_GOVERNANCE_AUTHORITY",status:"ACTIVE",version:0 });
const decision = HumanDecisionSchema.parse({decisionId:"decision-1",discoveryId:"discovery-1",authorityId:"authority-1",actorIdentityId:"human-1",action:"VALIDATE_EVIDENCE",targetType:"EVIDENCE",targetId:"evidence-1",targetVersion:2,outcome:"VALIDATED",operationId:"00000000-0000-4000-8000-000000000001",recordedAt:"2026-09-22T12:00:00Z",version:0});
const intent = DecisionValidationSchema.parse({discoveryId:decision.discoveryId,action:decision.action,targetType:decision.targetType,targetId:decision.targetId,targetVersion:decision.targetVersion,outcome:decision.outcome,operationId:decision.operationId,reference:{decisionId:decision.decisionId,source:{sourceId:"source-1",reference:"human decision"},recordedAt:decision.recordedAt}});
const identity = { current: async()=>({identityId:IdentityIdSchema.parse("human-1"),kind:"EMAIL_VERIFIED" as const}) } as IdentityPort;

test("governance accepts an exact decision/authority/intent match",()=>{
  assert.doesNotThrow(()=>assertDecisionMatches(authority,decision,intent,"human-1"));
});
for (const [name, patch] of Object.entries({revoked:{status:"REVOKED"},discovery:{discoveryId:"other"},actor:{actorIdentityId:"other"},authority:{authorityId:"other"}})) {
  test(`governance denies ${name} authority without mutation`,()=>{
    const before=JSON.stringify(decision);
    assert.throws(()=>assertDecisionMatches(GovernanceAuthoritySchema.parse({...authority,...patch}),decision,intent,"human-1"));
    assert.equal(JSON.stringify(decision),before);
  });
}
for (const [name, patch] of Object.entries({action:{action:"ISSUE_HANDOFF"},type:{targetType:"HANDOFF"},target:{targetId:"other"},version:{targetVersion:3},outcome:{outcome:"REJECTED"},operation:{operationId:"00000000-0000-4000-8000-000000000002"},discovery:{discoveryId:"other"}})) {
  test(`governance rejects mismatched ${name}`,()=>assert.throws(()=>assertDecisionMatches(authority,decision,DecisionValidationSchema.parse({...intent,...patch}),"human-1")));
}
test("governance distinguishes absent target version from a versioned target",()=>{
  const unversioned={...intent}; delete unversioned.targetVersion;
  assert.throws(()=>assertDecisionMatches(authority,decision,unversioned,"human-1"));
});
test("a reference alone cannot establish authority",()=>{
  assert.equal(HumanDecisionSchema.safeParse(intent.reference).success,false);
  assert.equal(GovernanceAuthoritySchema.safeParse({discoveryId:"discovery-1",actorIdentityId:"human-1",role:"OWNER",status:"ACTIVE",version:0}).success,false);
});
test("service denies unauthenticated access and actor impersonation before persistence",async()=>{
  let writes=0;
  const port:GovernancePort={record:async()=>{writes++;return decision;},validate:async()=>{writes++;}};
  const anonymous=new HumanGovernance({current:async()=>null} as unknown as IdentityPort,port);
  await assert.rejects(()=>anonymous.record(decision),/AUTHENTICATION_REQUIRED/);
  await assert.rejects(()=>anonymous.validate(intent),/AUTHENTICATION_REQUIRED/);
  await assert.rejects(()=>new HumanGovernance(identity,port).record({...decision,actorIdentityId:"other"}),/ACCESS_DENIED/);
  assert.equal(writes,0);
});
test("service refuses malformed decisions and propagates persistence denial",async()=>{
  const port:GovernancePort={record:async()=>{throw new Error("ACCESS_DENIED");},validate:async()=>{throw new Error("ACCESS_DENIED");}};
  const service=new HumanGovernance(identity,port);
  await assert.rejects(()=>service.record({...decision,action:"AI_APPROVE"}),/INVALID_INPUT/);
  await assert.rejects(()=>service.record(decision),/ACCESS_DENIED/);
  await assert.rejects(()=>service.validate(intent),/ACCESS_DENIED/);
});
test("service preserves original decision on replay and never consumes preflight as mutation",async()=>{
  let validationCalls=0;
  const service=new HumanGovernance(identity,{record:async()=>decision,validate:async()=>{validationCalls++;}});
  assert.deepEqual(await service.record(decision),decision);
  assert.deepEqual(await service.record(decision),decision);
  assert.equal(await service.validate(intent),undefined);
  assert.equal(validationCalls,1);
});
test("SQL governance boundary denies direct writes, preserves immutable history and locks authority validation",()=>{
  const sql=readFileSync(new URL("../../supabase/migrations/20260922000700_agent_b_reconciliation.sql",import.meta.url),"utf8");
  assert.match(sql,/revoke all on public\.agent_b_governance_authorities, public\.agent_b_human_decisions from public, anon, authenticated, service_role/);
  assert.match(sql,/agent_b_authority_immutable before update or delete/);
  assert.match(sql,/agent_b_decision_immutable before update or delete/);
  assert.match(sql,/new\.version <> previous\.version\+1/);
  assert.match(sql,/operation_id uuid not null unique/);
  assert.match(sql,/existing\.payload is distinct from p_decision/);
  assert.match(sql,/owner_id=p_actor for update/);
  assert.match(sql,/a\.status <> 'ACTIVE'/);
  assert.match(sql,/d\.payload->k is distinct from p_intent->k/);
  assert.doesNotMatch(sql,/grant (?:insert|update|delete|all).*governance_authorities.*to authenticated/i);
});

test("adapter uses only guarded RPCs, forwards actor and intent, and sanitizes failures",async()=>{
  const calls: {name:string;args:unknown}[]=[];
  let code:string|null=null;
  const gateway={rpc:async(name:string,args:unknown)=>{
    calls.push({name,args});
    return {data:name==="agent_b_record_human_decision"?decision:null,error:code?{code,message:"private provider detail"}:null};
  }};
  const adapter=new SupabaseGovernance(gateway as unknown as ConstructorParameters<typeof SupabaseGovernance>[0]);
  assert.deepEqual(await adapter.record("human-1",decision),decision);
  await adapter.validate("human-1",intent);
  assert.deepEqual(calls,[{name:"agent_b_record_human_decision",args:{p_actor:"human-1",p_decision:decision}},{name:"agent_b_validate_human_decision",args:{p_actor:"human-1",p_intent:intent}}]);
  for (const [provider,expected] of [["42501","ACCESS_DENIED"],["40001","CONCURRENT_MODIFICATION"],["23505","CONCURRENT_MODIFICATION"],["22023","INVALID_INPUT"],["unexpected","PROVIDER_UNAVAILABLE"]]) {
    code=provider;
    await assert.rejects(()=>adapter.validate("human-1",intent),(error:Error)=>error.message===expected);
  }
});
