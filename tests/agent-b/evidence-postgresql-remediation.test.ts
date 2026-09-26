import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { FileReferenceSchema } from "../../lib/agent-b/core/evidence.ts";
import { EvidenceMutationSchema } from "../../lib/agent-b/core/evidence-lifecycle.ts";
import { SourceReferenceSchema } from "../../lib/agent-b/core/primitives.ts";
import { SupabaseEvidenceAdapter } from "../../lib/agent-b/infrastructure/supabase/evidence.server.ts";

const discoveryId="00000000-0000-4000-8000-000000000001";
const stamp="2026-09-24T12:00:00Z";
const source=SourceReferenceSchema.parse({sourceId:"synthetic-source",reference:"synthetic-reference"});
const reference={fileReferenceId:"ref-synthetic-object",objectId:"synthetic-object",discoveryId,source};

for(const recordedAt of [undefined,stamp]){
  test(`R08-07 adapter serializes valid FileReference/source${recordedAt?" with timestamp":""} without double encoding`,async()=>{
    let calls=0;
    const expected=FileReferenceSchema.parse({...reference,source:{...source,...(recordedAt?{recordedAt}:{})}});
    const client={auth:{getUser:async()=>({data:{user:{id:"actor"}},error:null})},storage:{from:()=>({upload:async()=>({error:null})})},rpc:async(name:string,args:unknown)=>{
      calls++;assert.equal(name,"agent_b_register_evidence_file");
      const serialized=JSON.parse(JSON.stringify(args));assert.deepEqual(serialized.p_reference,expected);
      assert.equal(serialized.p_stored.discoveryId,discoveryId);assert.equal(serialized.p_stored.byteSize,1);
      return {error:null};
    }};
    const adapter=new SupabaseEvidenceAdapter(client as unknown as ConstructorParameters<typeof SupabaseEvidenceAdapter>[0]);
    await adapter.upload({discoveryId,objectId:reference.objectId,path:discoveryId+"/"+reference.objectId,bytes:new TextEncoder().encode("x"),fileType:"TXT",createdAt:stamp,source:expected.source});
    assert.equal(calls,1);
  });
}

for(const [label,bad] of Object.entries({missingSource:{...reference,source:undefined},nullSource:{...reference,source:null},blankSourceId:{...reference,source:{...source,sourceId:" "}},emptyReference:{...reference,source:{...source,reference:""}},invalidTimestamp:{...reference,source:{...source,recordedAt:"invalid"}},extraSource:{...reference,source:{...source,extra:true}},extraReference:{...reference,extra:true},missingObject:{...reference,objectId:undefined}})){
  test(`R08-07 rejects ${label} before any Storage or persistence call`,async()=>{
    assert.equal(FileReferenceSchema.safeParse(bad).success,false);
    if(!label.startsWith("extraReference")&&!label.startsWith("missingObject")){
      const client={auth:{getUser:async()=>{assert.fail("invalid source reached external boundary");}}};
      const adapter=new SupabaseEvidenceAdapter(client as unknown as ConstructorParameters<typeof SupabaseEvidenceAdapter>[0]);
      await assert.rejects(async()=>adapter.upload({discoveryId,objectId:reference.objectId,path:discoveryId+"/"+reference.objectId,bytes:new Uint8Array([120]),fileType:"TXT",createdAt:stamp,source:SourceReferenceSchema.parse(bad.source)}));
    }
  });
}

test("R08-07 decision serialization preserves both nested objects affected by SQL precedence",async()=>{
  const input=EvidenceMutationSchema.parse({action:"REJECT",discoveryId,operationId:"00000000-0000-4000-8000-000000000002",evidenceId:"evidence",expectedEntityVersion:0,decision:{decisionId:"decision",recordedAt:stamp,source:{...source,recordedAt:stamp}}});
  const client={rpc:async(name:string,args:unknown)=>{assert.equal(name,"agent_b_mutate_evidence");assert.deepEqual(JSON.parse(JSON.stringify(args)),{p_actor:"actor",p_input:input});return {data:{},error:null};}};
  const adapter=new SupabaseEvidenceAdapter(client as unknown as ConstructorParameters<typeof SupabaseEvidenceAdapter>[0]);
  await adapter.mutate("actor",input as Exclude<typeof input,{action:"DEFER"}>);
});

test("R08-07 migration replaces only two Evidence functions with three grouping corrections",()=>{
  const original=readFileSync(new URL("../../supabase/migrations/20260922000700_agent_b_reconciliation.sql",import.meta.url),"utf8");
  const sql=readFileSync(new URL("../../supabase/migrations/20260922001000_agent_b_evidence_json_precedence.sql",import.meta.url),"utf8");
  const start=original.indexOf("create function agent_b_private.register_evidence_file(");
  const end=original.indexOf("create function public.agent_b_register_evidence_file(",start);
  const expected=original.slice(start,end).replaceAll("create function agent_b_private.","create or replace function agent_b_private.")
    .replace("p_reference->'source'-array","(p_reference->'source')-array")
    .replace("p_input->'decision'-array","(p_input->'decision')-array")
    .replace("p_input->'decision'->'source'-array","(p_input->'decision'->'source')-array");
  assert.equal(sql.slice(sql.indexOf("create or replace function")).trim(),expected.trim());
  assert.equal((sql.match(/create or replace function/g)??[]).length,2);
  assert.doesNotMatch(sql,/\b(grant|revoke|drop|alter)\s/i);
  assert.equal((sql.match(/perform agent_b_private.lock_governance_access/g)??[]).length,2);
  assert.match(sql,/perform agent_b_private.validate_human_decision\(p_actor,intent\)/);
});
