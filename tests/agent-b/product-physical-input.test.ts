import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseProductPersistenceInput } from "../../lib/agent-b/infrastructure/product-input.server.ts";
import { DiscoveryIdSchema } from "../../lib/agent-b/core/primitives.ts";
import { productFailure } from "../../lib/agent-b/transport/product.ts";
const uuid="00000000-0000-4000-8000-000000000001";
const handle={discoveryId:uuid,sessionId:uuid,runtimeVersion:0};
const initial={discoveryId:uuid,sessionId:uuid,operationId:uuid,now:"2026-09-24T12:00:00Z"};

test("R08-09A physical UUID accepted while domain identity stays opaque",()=>{
  assert.deepEqual(parseProductPersistenceInput(handle,"evaluate"),handle);
  assert.deepEqual(parseProductPersistenceInput(initial,"initialize"),initial);
  const {discoveryId,...fresh}=initial;
  assert.equal(discoveryId,uuid);
  assert.deepEqual(parseProductPersistenceInput(fresh,"initialize"),fresh);
  assert.equal(DiscoveryIdSchema.parse("prototype"),"prototype");
});
for(const bad of ["prototype","", " ","not-a-uuid",uuid.slice(0,-1),null,123,{}]) {
  test(`R08-09A invalid physical identifier ${JSON.stringify(bad)} rejected before dispatch`,()=>{
    let calls=0;
    for(const operation of ["initialize","evaluate"] as const){
      try {
        parseProductPersistenceInput({...operation==="initialize"?initial:handle,discoveryId:bad},operation);
        calls++;
        assert.fail("Invalid input reached application dispatch");
      }catch(error){
        assert.deepEqual(productFailure(error),{status:400,body:{ok:false,error:{code:"INVALID_INPUT",retryable:false}}});
      }
    }
    assert.equal(calls,0);
  });
}
test("R08-09A route validates physical input before constructing persistence",()=>{
  const route=readFileSync(new URL("../../lib/agent-b/infrastructure/product-route.server.ts",import.meta.url),"utf8");
  const parse=route.indexOf("const parsed=parseProductPersistenceInput(input,operation)");
  assert.ok(parse>=0&&parse<route.indexOf("const client=createAgentBSupabaseClient"));
});
