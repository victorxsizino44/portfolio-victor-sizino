import test from "node:test";
import assert from "node:assert/strict";
import { ProductContinuity } from "../../lib/agent-b/application/product-continuity.ts";
import { ProductRuntime } from "../../lib/agent-b/application/product-runtime.ts";
import { DiscoveryRuntimeSchema, SessionSchema, type DiscoveryRuntime, type Session } from "../../lib/agent-b/core/mc04.ts";
import { DiscoveryRootSchema, DiscoveryAccessSchema, AuthenticatedIdentitySchema, FoundationError, type DiscoveryRoot } from "../../lib/agent-b/core/identity-access.ts";
import type { IdentityPort } from "../../lib/agent-b/ports/identity.ts";
import type { RuntimePersistencePort } from "../../lib/agent-b/ports/runtime-persistence.ts";
import type { DiscoveryPersistencePort } from "../../lib/agent-b/ports/discovery-persistence.ts";
import { projectRuntimeStatus } from "../../lib/agent-b/core/product-continuity.ts";
import { enterDiscovery, readContinuity } from "../../app/components/agent-b/continuity-client.ts";
import { productFailure } from "../../lib/agent-b/transport/product.ts";
import { parseProductPersistenceInput } from "../../lib/agent-b/infrastructure/product-input.server.ts";

const uuid=(n:number)=>`00000000-0000-4000-8000-${String(n).padStart(12,"0")}`;
const now="2026-09-25T12:00:00Z";
function fixture(){
  let authenticated=false,denied=false;let id=10;
  const roots=new Map<string,DiscoveryRoot>(), runtimes=new Map<string,DiscoveryRuntime>(), sessions=new Map<string,Session>();
  const creations=new Map<string,DiscoveryRoot>();
  const operations=new Map<string,{request:string;result:{runtime:DiscoveryRuntime;session:Session}}>();
  const actor=AuthenticatedIdentitySchema.parse({identityId:uuid(1),kind:"ANONYMOUS"});
  const identity={current:async()=>authenticated?actor:null,signInAnonymously:async()=>{authenticated=true;return actor;}} as IdentityPort;
  const discovery={
    listOwned:async()=>[...roots.values()],
    findAccess:async(d:string)=>!denied&&authenticated&&roots.has(d)?DiscoveryAccessSchema.parse({discoveryId:d,identityId:actor.identityId,role:"OWNER"}):null,
    readRoot:async(d:string)=>roots.get(d)??null,
    createOwnedRoot:async(_actor:unknown,op:string)=>{
      if(creations.has(op))return creations.get(op)!;
      const root=DiscoveryRootSchema.parse({discoveryId:uuid(id++),ownerId:actor.identityId,entityVersion:0,createdAt:now});
      roots.set(root.discoveryId,root);creations.set(op,root);return root;
    },
  } as unknown as DiscoveryPersistencePort & {listOwned:()=>Promise<DiscoveryRoot[]>};
  // Transaction contract model only; not a claim of real PostgreSQL execution.
  const operation=async(i:Parameters<RuntimePersistencePort["initializeAtomic"]>[0]|Parameters<RuntimePersistencePort["resumeAtomic"]>[0],resume:boolean)=>{
    if(!authenticated||denied||!roots.has(i.discoveryId))throw new FoundationError("ACCESS_DENIED");
    const prior=operations.get(i.operationId);
    if(prior){if(prior.request!==JSON.stringify(i))throw new FoundationError("CONCURRENT_MODIFICATION");return structuredClone(prior.result);}
    const old=runtimes.get(i.discoveryId);
    const r=i as Parameters<RuntimePersistencePort["resumeAtomic"]>[0];
    if(resume&&(!old||old.runtimeVersion!==r.expectedRuntimeVersion||old.current.sessionId!==r.previousSessionId))throw new FoundationError("CONCURRENT_MODIFICATION");
    if(!resume&&old)throw new FoundationError("CONCURRENT_MODIFICATION");
    const predecessor=resume?sessions.get(r.previousSessionId):undefined;
    if(resume&&(!predecessor||predecessor.discoveryId!==i.discoveryId))throw new FoundationError("ACCESS_DENIED");
    const runtime=DiscoveryRuntimeSchema.parse(old?{...old,runtimeVersion:old.runtimeVersion+1,current:{...old.current,sessionId:i.sessionId}}:
      {discoveryId:i.discoveryId,runtimeVersion:0,freshness:"CURRENT",current:{sessionId:i.sessionId,pendingIds:[]},pending:[]});
    const session=SessionSchema.parse({sessionId:i.sessionId,discoveryId:i.discoveryId,previousSessionId:predecessor?.sessionId??null,lifecycle:"OPEN",createdAt:i.now});
    if(predecessor?.lifecycle==="OPEN")sessions.set(predecessor.sessionId,{...predecessor,lifecycle:"INTERRUPTED"});
    runtimes.set(i.discoveryId,runtime);sessions.set(i.sessionId,session);
    const result={runtime,session};operations.set(i.operationId,{request:JSON.stringify(i),result});return structuredClone(result);
  };
  const persistence:RuntimePersistencePort={read:async(i:{discoveryId:string})=>runtimes.get(i.discoveryId)??null,
    mutate:async()=>{throw Error("unexpected direct mutation");},
    createSession:async()=>{throw Error("unexpected direct Session insert");},
    transitionSession:async()=>{throw Error("unexpected non-atomic transition");},
    listSessions:async(i:{discoveryId:string})=>[...sessions.values()].filter(s=>s.discoveryId===i.discoveryId),
    initializeAtomic:(i:Parameters<RuntimePersistencePort["initializeAtomic"]>[0])=>operation(i,false),
    resumeAtomic:(i:Parameters<RuntimePersistencePort["resumeAtomic"]>[0])=>operation(i,true),
  };
  const context={read:async(_actor:unknown,i:{discoveryId:string;sessionId:string})=>({runtime:runtimes.get(i.discoveryId)!,session:sessions.get(i.sessionId)!,classification:null,scope:null,information:[],catalog:null,dependencies:null})};
  const app=new ProductContinuity(identity,discovery,persistence,context);
  const product=new ProductRuntime(identity,discovery,persistence,context);
  const send=(async(_path:unknown,init?:RequestInit)=>{
    try{return Response.json({ok:true,result:await app.execute(parseProductPersistenceInput(JSON.parse(String(init?.body)),"continuity"))});}
    catch(error){const fail=productFailure(error);return Response.json(fail.body,{status:fail.status});}
  }) as typeof fetch;
  const values=new Map<string,string>();const storage={getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);},removeItem:(k:string)=>{values.delete(k);}};
  return{app,product,send,storage,values,roots,runtimes,sessions,operations,deny:()=>{denied=true;}};
}
test("B14-B entry is read-only; reload resumes same Discovery after two transient turns",async()=>{
  const f=fixture();assert.deepEqual(await readContinuity(f.send),[]);assert.equal(f.roots.size,0);
  const first=await enterDiscovery(f.storage,undefined,f.send);
  const a=await f.product.converse({...first.runtime,conversation:{message:"Quero estruturar um produto."}});
  await f.product.converse({...first.runtime,conversation:{message:"Para lojistas",previousPrompt:a.response.intent}});
  const choices=await readContinuity(f.send);assert.equal(choices.length,1);
  assert.equal(f.sessions.size,1);assert.equal(f.operations.size,1);
  const resumed=await enterDiscovery(f.storage,choices[0],f.send);
  assert.equal(resumed.runtime.discoveryId,first.runtime.discoveryId);
  assert.notEqual(resumed.runtime.sessionId,first.runtime.sessionId);
  assert.equal(resumed.runtime.runtimeVersion,1);
  assert.equal(f.sessions.get(first.runtime.sessionId)?.lifecycle,"INTERRUPTED");
  assert.equal(f.sessions.get(resumed.runtime.sessionId)?.previousSessionId,first.runtime.sessionId);
  assert.equal([...f.sessions.values()].filter(s=>s.lifecycle==="OPEN").length,1);
  assert.match(resumed.continuation,/Ainda não há informação referenciada/);
  await f.product.converse({...resumed.runtime,conversation:{message:"Vamos continuar"}});
  assert.doesNotMatch([...f.values.values()].join(""),/lojistas|Vamos continuar|Quero estruturar/);
});
test("B14-B NEW creates independent root/runtime without changing the previous Discovery",async()=>{
  const f=fixture();const first=await enterDiscovery(f.storage,undefined,f.send);
  const before=JSON.stringify({root:f.roots.get(first.runtime.discoveryId),runtime:f.runtimes.get(first.runtime.discoveryId),session:f.sessions.get(first.runtime.sessionId)});
  const next=await enterDiscovery(f.storage,undefined,f.send);
  assert.notEqual(next.runtime.discoveryId,first.runtime.discoveryId);assert.notEqual(next.runtime.sessionId,first.runtime.sessionId);
  assert.equal(next.runtime.runtimeVersion,0);assert.equal(f.roots.size,2);
  assert.equal(before,JSON.stringify({root:f.roots.get(first.runtime.discoveryId),runtime:f.runtimes.get(first.runtime.discoveryId),session:f.sessions.get(first.runtime.sessionId)}));
});
test("B14-B lost response retry replays exactly one Resume; stale/foreign access never creates fallback",async()=>{
  const f=fixture();await enterDiscovery(f.storage,undefined,f.send);const [choice]=await readContinuity(f.send);
  const lost=(async(p:unknown,i?:RequestInit)=>{await f.send(p as RequestInfo,i);throw Error("network");}) as typeof fetch;
  await assert.rejects(()=>enterDiscovery(f.storage,choice,lost));assert.equal(f.sessions.size,2);
  const request=JSON.parse(f.values.get("agent-b-continuity-operation")!);
  const [afterReload]=await readContinuity(f.send);
  await enterDiscovery(f.storage,afterReload,f.send);assert.equal(f.sessions.size,2);assert.equal(f.operations.size,2);
  await assert.rejects(()=>f.app.execute({...request,operationId:uuid(90),sessionId:uuid(91)}),/CONCURRENT_MODIFICATION/);
  f.deny();await assert.rejects(()=>f.app.execute(request),/ACCESS_DENIED/);
  assert.equal(f.roots.size,1);assert.equal(f.sessions.size,2);
});
test("B14-B status exposes reference/pending/freshness facts, not completion or invented readiness",()=>{
  const status=projectRuntimeStatus({discoveryId:"d",runtimeVersion:4,freshness:"REEVALUATION_REQUIRED",current:{sessionId:"s",pendingIds:["p"],informationRecordId:"i"},pending:[{pendingId:"p",state:"PENDING",reference:"private content"}]});
  assert.match(status.title,/reavaliação/);assert.match(status.items.join(" "),/1 pendência/);
  assert.match(status.review,/não determinada/);assert.doesNotMatch(JSON.stringify(status),/private content|runtimeVersion|%|Problema identificado/);
});
