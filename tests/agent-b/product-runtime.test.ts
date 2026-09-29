import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ProductRuntime} from "../../lib/agent-b/application/product-runtime.ts";
import {ProductActionSchema} from "../../lib/agent-b/core/product-runtime.ts";
import {AuthenticatedIdentitySchema,DiscoveryRootSchema,DiscoveryAccessSchema,FoundationError} from "../../lib/agent-b/core/identity-access.ts";
import {DiscoveryRuntimeSchema,SessionSchema,type DiscoveryRuntime,type Session} from "../../lib/agent-b/core/mc04.ts";
import {GovernedContextSnapshotSchema} from "../../lib/agent-b/ports/governed-context.ts";
import type {IdentityPort} from "../../lib/agent-b/ports/identity.ts";
import type {DiscoveryPersistencePort} from "../../lib/agent-b/ports/discovery-persistence.ts";
import type {RuntimePersistencePort} from "../../lib/agent-b/ports/runtime-persistence.ts";
import {productFailure,readProductInput} from "../../lib/agent-b/transport/product.ts";
import {initializeProduct,evaluateProduct,evaluateProductConversation,ProductRequestError} from "../../app/components/agent-b/runtime-client.ts";
const uuid=(n:number)=>`00000000-0000-4000-8000-${String(n).padStart(12,"0")}`;
const now="2026-09-23T12:00:00Z";
const input=()=>({operationId:uuid(1),sessionId:uuid(2),now});
function fixture() {
  let principal:ReturnType<typeof AuthenticatedIdentitySchema.parse>|null=null;
  let runtime:DiscoveryRuntime|null=null;let sessions:Session[]=[];let deny=false;let failure=false;
  let understanding:"CONFLICTING"|"UNDERSTOOD"|null=null;
  const counts={signIn:0,create:0,initialize:0,context:0};const operations=new Map<string,string>();
  const root=DiscoveryRootSchema.parse({discoveryId:uuid(3),ownerId:uuid(4),entityVersion:0,createdAt:now});
  const identity={
    current:async()=>principal,
    signInAnonymously:async()=>{counts.signIn++;principal=AuthenticatedIdentitySchema.parse({identityId:uuid(4),kind:"ANONYMOUS"});return principal;}
  } as IdentityPort;
  const discovery={
    createOwnedRoot:async(_actor:string,op?:string)=>{if(!op)throw Error("operation required");if(!operations.has(op)){counts.create++;operations.set(op,uuid(3));}return root;},
    readRoot:async(d:string)=>!deny&&d===uuid(3)?root:null,
    findAccess:async(d:string)=>!deny&&d===uuid(3)?DiscoveryAccessSchema.parse({discoveryId:d,identityId:uuid(4),role:"OWNER"}):null
  } as unknown as DiscoveryPersistencePort;
  const persistence={
    read:async()=>{if(failure)throw new FoundationError("PROVIDER_UNAVAILABLE");return runtime;},
    listSessions:async()=>sessions,
    initializeAtomic:async(i:Parameters<RuntimePersistencePort["initializeAtomic"]>[0])=>{
      counts.initialize++;
      runtime=DiscoveryRuntimeSchema.parse({discoveryId:i.discoveryId,runtimeVersion:0,freshness:"CURRENT",current:{sessionId:i.sessionId,pendingIds:[]},pending:[]});
      const session=SessionSchema.parse({sessionId:i.sessionId,discoveryId:i.discoveryId,previousSessionId:null,lifecycle:"OPEN",createdAt:i.now});
      sessions=[session];return{runtime,session};
    },
    createSession:async()=>{throw Error("direct insert prohibited");},
    resumeAtomic:async()=>{throw Error("implicit resume prohibited");}
  } as unknown as RuntimePersistencePort;
  const repository={read:async(actor:string,request:{discoveryId:string;sessionId:string})=>{
    assert.equal(actor,uuid(4));assert.equal(request.discoveryId,uuid(3));counts.context++;
    return GovernedContextSnapshotSchema.parse({runtime,session:sessions.find(s=>s.sessionId===request.sessionId)??null,
      classification:understanding?{discoveryId:uuid(3),entityVersion:1,understandingState:understanding}:null,
      scope:null,information:[],catalog:null,dependencies:null});
  }};
  return {service:new ProductRuntime(identity,discovery,persistence,repository),counts,
    deny:()=>{deny=true;},fail:()=>{failure=true;},signOut:()=>{principal=null;},
    terminal:()=>{sessions=sessions.map(s=>({...s,lifecycle:"CLOSED"}));},
    duplicate:()=>{sessions.push(SessionSchema.parse({...sessions[0],sessionId:uuid(88)}));},
    advance:()=>{runtime=DiscoveryRuntimeSchema.parse({...runtime,runtimeVersion:1});},
    classification:(v:"CONFLICTING"|"UNDERSTOOD",current=true)=>{understanding=v;runtime=DiscoveryRuntimeSchema.parse({...runtime,current:{...runtime!.current,classificationVersion:current?1:0}});}
  };
}
test("R08-13 authorized conversation uses MC03 unchanged; replay has zero material consequence",async()=>{
  const f=fixture();const handle=await f.service.initialize(input());
  const candidate=await f.service.evaluate(handle);
  const request={...handle,conversation:{message:"Quero estruturar um novo produto digital."}};
  const first=await f.service.converse(request);
  assert.deepEqual(first.action,candidate);
  assert.equal(first.response.intent,"CLARIFY");
  assert.match(first.response.text,/Não é possível determinar.*dependência crítica pendente/);
  assert.doesNotMatch(first.response.text,/decisão humana|Que problema você quer resolver/);
  assert.deepEqual(await f.service.converse(request),first);
  assert.equal(f.counts.create,1);assert.equal(f.counts.initialize,1);
  assert.deepEqual(await f.service.initialize({...input(),discoveryId:handle.discoveryId}),handle);
  f.classification("CONFLICTING");
  const conflict=await f.service.converse(request);
  assert.equal(conflict.action.kind,"SUBSTANTIVE");
  assert.match(conflict.response.text,/interpretações em conflito/);
  assert.equal(conflict.response.materialExecutionAllowed,false);
});
test("R08-13 conversation preserves authorization, CAS and strict input boundaries",async()=>{
  const f=fixture();const handle=await f.service.initialize(input());
  await assert.rejects(()=>f.service.converse({...handle,conversation:{message:"ok"},missingFieldCount:0}),/INVALID_INPUT/);
  f.advance();await assert.rejects(()=>f.service.converse({...handle,conversation:{message:"ok"}}),/CONCURRENT_MODIFICATION/);
  f.deny();await assert.rejects(()=>f.service.converse({...handle,conversation:{message:"ok"}}),/ACCESS_DENIED/);
  assert.equal(f.counts.context,0);assert.equal(f.counts.initialize,1);
});
test("R08-13 browser/application multi-turn uses disposable input without state writes",async()=>{
  const f=fixture();const handle=await f.service.initialize(input());
  const send=(async(_path:unknown,init?:RequestInit)=>Response.json({ok:true,...await f.service.converse(JSON.parse(String(init?.body)))})) as typeof fetch;
  const first=await evaluateProductConversation(handle,{message:"Uma iniciativa nova"},send);
  const second=await evaluateProductConversation(handle,{message:"Quero reduzir a espera",previousPrompt:first.response.intent},send);
  assert.equal(first.response.intent,"CLARIFY");
  assert.equal(first.response.text,second.response.text);
  assert.doesNotMatch(second.response.text,/decisão humana|Este ponto precisa de uma decisão humana/);
  assert.deepEqual(first.action,second.action);
  assert.equal(f.counts.create,1);assert.equal(f.counts.initialize,1);
  assert.equal(second.response.materialExecutionAllowed,false);
});
test("R08-04 anonymous authenticated creation uses idempotent root + atomic runtime initialization",async()=>{
  const f=fixture();const handle=await f.service.initialize(input());
  assert.deepEqual(handle,{discoveryId:uuid(3),sessionId:uuid(2),runtimeVersion:0});
  assert.deepEqual(f.counts,{signIn:1,create:1,initialize:1,context:0});
  assert.deepEqual(await f.service.initialize(input()),handle);
  assert.equal(f.counts.create,1);assert.equal(f.counts.initialize,1);assert.equal(f.counts.signIn,1);
});
test("R08-04 existing authorized runtime resolves without new runtime/session",async()=>{
  const f=fixture();const handle=await f.service.initialize(input());
  assert.deepEqual(await f.service.initialize({...input(),discoveryId:handle.discoveryId}),handle);
  assert.equal(f.counts.initialize,1);assert.equal(f.counts.create,1);
});
test("R08-04 material UNKNOWN is explicit ABSTAIN from real resolver, no mutation",async()=>{
  const f=fixture();const handle=await f.service.initialize(input());
  const action=await f.service.evaluate(handle);
  assert.equal(action.kind,"ABSTAIN");
  if(action.kind==="ABSTAIN")assert.equal(action.reason,"UNKNOWN_CRITICAL_PENDING");
  assert.equal(f.counts.context,1);assert.equal(f.counts.initialize,1);
  assert.deepEqual(await f.service.evaluate(handle),action);
});
test("R08-04 current MC02 conflict permits substantive action despite unknown catalog; DTO omits rationale",async()=>{
  const f=fixture();const handle=await f.service.initialize(input());f.classification("CONFLICTING");
  const action=await f.service.evaluate(handle);
  assert.equal(action.kind,"SUBSTANTIVE");
  if(action.kind==="SUBSTANTIVE"){assert.equal(action.interaction,"CLARIFY");assert.equal(action.progression,"BLOCK");}
  assert.equal("rationale" in action,false);assert.equal("information" in action,false);
  f.classification("CONFLICTING",false);
  assert.equal((await f.service.evaluate(handle)).kind,"ABSTAIN");
});
test("R08-04 unauthorized Discovery and missing identity never create a replacement identity",async()=>{
  const f=fixture();await assert.rejects(()=>f.service.initialize({...input(),discoveryId:uuid(99)}),/AUTHENTICATION_REQUIRED/);
  assert.equal(f.counts.signIn,0);
  const handle=await f.service.initialize(input());f.deny();
  await assert.rejects(()=>f.service.initialize({...input(),discoveryId:handle.discoveryId}),/ACCESS_DENIED/);
  await assert.rejects(()=>f.service.evaluate(handle),/ACCESS_DENIED/);assert.equal(f.counts.initialize,1);
});
test("R08-04 terminal Session is never reopened; multiple OPEN sessions conflict",async()=>{
  for(const corrupt of ["terminal","duplicate"] as const){
    const f=fixture();const handle=await f.service.initialize(input());f[corrupt]();
    await assert.rejects(()=>f.service.initialize({...input(),discoveryId:handle.discoveryId}),/CONCURRENT_MODIFICATION/);
    assert.equal(f.counts.initialize,1);
  }
});
test("R08-04 stale runtime or wrong Session safely rejects before context evaluation",async()=>{
  const f=fixture();const handle=await f.service.initialize(input());
  await assert.rejects(()=>f.service.evaluate({...handle,sessionId:uuid(99)}),/CONCURRENT_MODIFICATION/);
  f.advance();await assert.rejects(()=>f.service.evaluate(handle),/CONCURRENT_MODIFICATION/);assert.equal(f.counts.context,0);
});
test("R08-04 no authoritative semantic values accepted from client",async()=>{
  const f=fixture();const handle=await f.service.initialize(input());
  for(const patch of [{informationNeed:"NONE"},{missingFieldCount:0},{unresolvedCriticalPending:false},{classification:{}},{completion:"COMPLETE"},{ownerId:uuid(4)}]){
    await assert.rejects(()=>f.service.evaluate({...handle,...patch}),/INVALID_INPUT/);
    await assert.rejects(()=>f.service.initialize({...input(),...patch}),/INVALID_INPUT/);
  }
  assert.equal(f.counts.context,0);
});
test("R08-04 operational failure remains retryable and sanitized",async()=>{
  const f=fixture();const handle=await f.service.initialize(input());f.fail();
  await assert.rejects(()=>f.service.evaluate(handle),/PROVIDER_UNAVAILABLE/);
  assert.deepEqual(productFailure(new Error("private token prompt")).body,{ok:false,error:{code:"RUNTIME_UNAVAILABLE",retryable:true}});
  assert.equal(productFailure(new FoundationError("ACCESS_DENIED")).status,403);
  assert.equal(productFailure(new FoundationError("CONCURRENT_MODIFICATION")).status,409);
});
test("R08-04 transport rejects cross-origin, oversized/malformed and wrong media requests",async()=>{
  const request=(body:string,headers:Record<string,string>={})=>new Request("https://example.test/api/agent-b/initialize",{method:"POST",headers:{"content-type":"application/json",...headers},body});
  assert.deepEqual(await readProductInput(request(JSON.stringify(input()))),input());
  await assert.rejects(()=>readProductInput(request("{}",{origin:"https://foreign.test"})),/ACCESS_DENIED/);
  await assert.rejects(()=>readProductInput(request("x".repeat(2049))),/INVALID_INPUT/);
  await assert.rejects(()=>readProductInput(request("{")),/INVALID_INPUT/);
  await assert.rejects(()=>readProductInput(request("{}",{"content-type":"text/plain"})),/INVALID_INPUT/);
});
test("R08-04 browser-to-application flow uses IDs only and preserves retry request",async()=>{
  const f=fixture();const values=new Map<string,string>();
  const storage={getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);}};
  const calls:{path:string;body:Record<string,unknown>}[]=[];
  const send=(async(path:unknown,init?:RequestInit)=>{
    const body=JSON.parse(String(init?.body));calls.push({path:String(path),body});
    try{return Response.json(String(path).endsWith("initialize")?{ok:true,runtime:await f.service.initialize(body)}:{ok:true,action:await f.service.evaluate(body)});}
    catch(error){const response=productFailure(error);return Response.json(response.body,{status:response.status});}
  }) as typeof fetch;
  const handle=await initializeProduct(storage,send);
  assert.equal((await evaluateProduct(handle,send)).kind,"ABSTAIN");
  await initializeProduct(storage,send);
  assert.equal(f.counts.create,1);assert.equal(f.counts.initialize,1);
  assert.deepEqual(Object.keys(calls[1].body).sort(),["discoveryId","runtimeVersion","sessionId"]);
  assert.equal(calls[0].body.operationId,calls[2].body.operationId);
});
for(const [status,state] of [[401,"unauthorized"],[403,"unauthorized"],[409,"conflict"],[503,"error"]] as const)
test(`R08-04 browser presents safe ${state} state for HTTP ${status}`,async()=>{
  const send=(async()=>new Response("private error",{status})) as typeof fetch;
  await assert.rejects(()=>evaluateProduct({discoveryId:uuid(3) as never,sessionId:uuid(2) as never,runtimeVersion:0 as never},send),
    (error:unknown)=>error instanceof ProductRequestError&&error.state===state&&error.message==="RUNTIME_REQUEST_FAILED");
});
test("R08-04 safe DTO rejects provider/free-form payloads",()=>{
  assert.equal(ProductActionSchema.safeParse({kind:"ABSTAIN",discoveryId:uuid(3),runtimeVersion:0,reason:"UNKNOWN_INFORMATION_NEED",resolution:"CLARIFY",prompt:"private"}).success,false);
});
test("R08-04 production wiring removes synthetic context and exposes no governance/analytics content",()=>{
  const read=(p:string)=>readFileSync(new URL("../../"+p,import.meta.url),"utf8");
  const ui=read("app/components/agent-b/AgentBExperience.tsx");
  const client=read("app/components/agent-b/runtime-client.ts");
  const route=read("lib/agent-b/infrastructure/product-route.server.ts");
  const app=read("lib/agent-b/application/product-runtime.ts");
  assert.doesNotMatch(ui+client,/["']prototype["']|informationNeed|missingFieldCount|unresolvedCriticalPending|service.role|signInAnonymously|\.from\(/i);
  assert.match(ui,/action.kind === "ABSTAIN"/);assert.match(ui,/enterDiscovery/);assert.match(ui,/evaluateProduct/);
  assert.match(app,/this.runtime.initialize/);assert.match(app,/this.resolver.resolve/);
  assert.doesNotMatch(app,/createSession|openSession|new Governance|recordHuman|latest|\.at\(-1\)/);
  assert.match(route,/new SupabaseGovernedContext/);assert.match(route,/new SupabaseRuntimePersistence/);
  assert.doesNotMatch(route,/trackAgentBEvent\([^;]+,\s*\{/);
  assert.match(read("lib/agent-b/infrastructure/analytics.server.ts"),/session_recording:false/);
  const sql=read("supabase/migrations/20260922000700_agent_b_reconciliation.sql");
  assert.match(sql,/LEGACY_RESUME_RECONCILIATION_REQUIRED/);
  assert.match(sql,/prior.actor_identity_id<>p_expected_identity/);
  assert.match(sql,/pg_advisory_xact_lock/);
});
