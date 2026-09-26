import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ProgressiveIdentity } from "../../lib/agent-b/application/progressive-identity.ts";
import { AuthenticatedIdentitySchema, DiscoveryRootSchema, DiscoveryAccessSchema, FoundationError } from "../../lib/agent-b/core/identity-access.ts";
import type { IdentityPort } from "../../lib/agent-b/ports/identity.ts";

const discoveryId="11111111-1111-4111-8111-111111111111",actor="22222222-2222-4222-8222-222222222222";
const input={discoveryId,email:"synthetic@example.invalid"};
function fixture() {
  let principal:ReturnType<typeof AuthenticatedIdentitySchema.parse>|null=AuthenticatedIdentitySchema.parse({identityId:actor,kind:"ANONYMOUS"});
  let denied=false,expired=false,mismatch=false,unverified=false;
  const counts={request:0,verify:0};
  const root=DiscoveryRootSchema.parse({discoveryId,ownerId:actor,entityVersion:0,createdAt:"2026-09-24T12:00:00Z"});
  const access=DiscoveryAccessSchema.parse({discoveryId,identityId:actor,role:"OWNER"});
  const identity:IdentityPort={current:async()=>principal,signInAnonymously:async()=>{throw Error("must not create identity");},
    requestEmailUpgrade:async(id)=>{assert.equal(id,actor);counts.request++;},
    verifyEmailUpgrade:async(id)=>{assert.equal(id,actor);counts.verify++;if(expired)throw new FoundationError("EMAIL_VERIFICATION_REQUIRED");
      principal=AuthenticatedIdentitySchema.parse({identityId:mismatch?discoveryId:actor,kind:unverified?"EMAIL_UNVERIFIED":"EMAIL_VERIFIED"});return principal;}};
  const service=new ProgressiveIdentity(identity,{readRoot:async()=>denied?null:root,findAccess:async()=>denied?null:access});
  return{service,counts,root,access,deny:()=>{denied=true;},signOut:()=>{principal=null;},expire:()=>{expired=true;},mismatch:()=>{mismatch=true;},unverified:()=>{unverified=true;},
    confirmAtProvider:()=>{principal=AuthenticatedIdentitySchema.parse({identityId:actor,kind:"EMAIL_VERIFIED"});},
    foreignPrincipal:()=>{principal=AuthenticatedIdentitySchema.parse({identityId:discoveryId,kind:"EMAIL_VERIFIED"});}};
}
test("R08-12R link confirmation is observed from trusted identity without OTP or mutation",async()=>{
  const f=fixture(),before=JSON.stringify([f.root,f.access]);
  assert.deepEqual(await f.service.status({discoveryId}),{discoveryId,status:"VERIFICATION_REQUIRED"});
  await f.service.execute(input,"request");
  assert.equal((await f.service.status({discoveryId})).status,"VERIFICATION_REQUIRED");
  f.confirmAtProvider();
  assert.deepEqual(await f.service.status({discoveryId}),{discoveryId,status:"VERIFIED"});
  await f.service.status({discoveryId});
  assert.deepEqual(f.counts,{request:1,verify:0});assert.equal(JSON.stringify([f.root,f.access]),before);
});
test("R08-12R status never consumes link tokens or client verification assertions",async()=>{
  const f=fixture();for(const patch of [{token:"untrusted"},{token_hash:"untrusted"},{verified:true},{email:input.email}])
    await assert.rejects(f.service.status({discoveryId,...patch}),/INVALID_INPUT/);
  assert.deepEqual(f.counts,{request:0,verify:0});
});
for(const mode of ["deny","signOut","foreignPrincipal"] as const)test(`R08-12R status ${mode} denied`,async()=>{
  const f=fixture();f[mode]();await assert.rejects(f.service.status({discoveryId}),/ACCESS_DENIED|AUTHENTICATION_REQUIRED/);
});
test("R08-12 request and verified retry preserve same root/access without governed writes",async()=>{
  const f=fixture(),before=JSON.stringify([f.root,f.access]);
  assert.deepEqual(await f.service.execute(input,"request"),{discoveryId,status:"VERIFICATION_REQUESTED"});
  await f.service.execute(input,"request");
  assert.deepEqual(await f.service.execute({...input,token:"123456"},"verify"),{discoveryId,status:"VERIFIED"});
  await f.service.execute({...input,token:"123456"},"verify");await f.service.execute(input,"request");
  assert.deepEqual(f.counts,{request:2,verify:1});assert.equal(JSON.stringify([f.root,f.access]),before);
});
for(const mode of ["deny","signOut"] as const)test(`R08-12 ${mode} fails before provider mutation`,async()=>{
  const f=fixture();f[mode]();for(const op of ["request","verify"] as const)
    await assert.rejects(f.service.execute(op==="request"?input:{...input,token:"123456"},op),/ACCESS_DENIED|AUTHENTICATION_REQUIRED/);
  assert.deepEqual(f.counts,{request:0,verify:0});
});
test("R08-12 foreign Discovery cannot be assumed",async()=>{
  const f=fixture();await assert.rejects(f.service.execute({...input,discoveryId:actor},"request"),/ACCESS_DENIED/);
  assert.equal(f.counts.request,0);
});
for(const mode of ["expire","mismatch","unverified"] as const)test(`R08-12 ${mode} never produces verified response`,async()=>{
  const f=fixture();f[mode]();await assert.rejects(f.service.execute({...input,token:"123456"},"verify"),/EMAIL_VERIFICATION_REQUIRED|IDENTITY_CONTINUITY_FAILED/);
  assert.equal(f.root.ownerId,actor);assert.equal(f.access.identityId,actor);
});
test("R08-12 strict input rejects client verification assertions and malformed OTP",async()=>{
  const f=fixture();for(const patch of [{verified:true},{identityId:actor},{token:"invalid"},{token:""}])
    await assert.rejects(f.service.execute({...input,token:"123456",...patch},"verify"),/INVALID_INPUT/);
  assert.equal(f.counts.verify,0);
});
test("R08-12 route has no sensitive logging, analytics, governance writes or direct delivery",()=>{
  const route=readFileSync(new URL("../../lib/agent-b/infrastructure/progressive-identity-route.server.ts",import.meta.url),"utf8");
  assert.doesNotMatch(route,/console\.|trackAgentB|Resend|service.role|GovernanceAuthority|HumanDecision/);
  assert.ok(route.indexOf("schema.safeParse")<route.indexOf("const client = createAgentBSupabaseClient"));
  assert.match(route,/private, no-store/);
});
