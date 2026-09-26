// Explicit isolated validation only: no .env loading, network URI or production client.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { ProductRuntime } from "../../lib/agent-b/application/product-runtime.ts";
import { ConversationalInformationCapture } from "../../lib/agent-b/application/information-capture.ts";
import { InformationPublication } from "../../lib/agent-b/application/information-publication.ts";
import { SupabaseInformationPublication } from "../../lib/agent-b/infrastructure/supabase/information-publication.server.ts";
import { SupabaseCapturedInformation } from "../../lib/agent-b/infrastructure/supabase/information-capture.server.ts";
import { SupabaseGovernedContext } from "../../lib/agent-b/infrastructure/supabase/governed-context.server.ts";
import { SupabaseRuntimePersistence } from "../../lib/agent-b/infrastructure/supabase/runtime-persistence.server.ts";
import { AuthenticatedIdentitySchema,DiscoveryRootSchema,DiscoveryAccessSchema } from "../../lib/agent-b/core/identity-access.ts";
import { DiscoveryRuntimeSchema,SessionSchema,ResumeContextSchema } from "../../lib/agent-b/core/mc04.ts";
import type { IdentityPort } from "../../lib/agent-b/ports/identity.ts";
import type { DiscoveryPersistencePort } from "../../lib/agent-b/ports/discovery-persistence.ts";
import type { RuntimePersistencePort } from "../../lib/agent-b/ports/runtime-persistence.ts";
const actor=randomUUID(),discovery=randomUUID(),session=randomUUID(),now=new Date().toISOString();
const lit=(x:string)=>"'"+x.replaceAll("'","''")+"'",json=(x:unknown)=>lit(JSON.stringify(x))+"::jsonb";
function sql(q:string,authorized=true):unknown{
 const prefix=authorized?`set role authenticated; set request.jwt.claim.sub=${lit(actor)}; set request.jwt.claim.role='authenticated';`:"";
 const r=spawnSync('C:/Users/victo/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe',['exec','-i','supabase_db_agent-b-b145b-local','psql','-U','postgres','-d','postgres','-X','-qAt','-v','ON_ERROR_STOP=1','-v','VERBOSITY=sqlstate'],{input:prefix+q,encoding:'utf8',timeout:20000});
 if(r.status!==0)throw Error('LOCAL_SQL_FAILED_'+(r.stderr.match(/ERROR:\s+([A-Z0-9]{5})/)?.[1]??'TOOLING'));
 return r.stdout.trim()?JSON.parse(r.stdout.trim()):null;
}
const allowed=new Set(['agent_b_publish_information','agent_b_read_governed_context','agent_b_initialize_runtime','agent_b_resume_atomic']);
const client={rpc:async(name:string,args:Record<string,unknown>)=>{
 assert.ok(allowed.has(name));const params=Object.values(args).map(v=>typeof v==='object'?json(v):lit(String(v))).join(',');return {data:sql(`select public.${name}(${params});`),error:null};
},from:(table:string)=>{
 assert.equal(table,'agent_b_information_records');const filters:string[]=[];
 const builder={select:(_columns:string)=>builder,eq:(column:string,value:string)=>{assert.equal(column,'discovery_id');filters.push(`discovery_id=${lit(value)}`);return builder;},contains:(column:string,value:unknown)=>{assert.equal(column,'payload');filters.push(`payload @> ${json(value)}`);return builder;},in:(column:string,values:string[])=>{assert.equal(column,'record_id');filters.push(`record_id in (${values.map(lit).join(',')})`);return builder;},then:(resolve:(value:unknown)=>unknown)=>Promise.resolve(resolve({data:sql(`select coalesce(jsonb_agg(to_jsonb(r)),'[]') from public.agent_b_information_records r where ${filters.join(' and ')};`),error:null}))};return builder;
}};
const typed=client as never;
sql(`insert into auth.users(id) values(${lit(actor)});insert into public.agent_b_discoveries(discovery_id,owner_id) values(${lit(discovery)},${lit(actor)});insert into public.agent_b_discovery_access values(${lit(discovery)},${lit(actor)},'OWNER');`,false);
await client.rpc('agent_b_initialize_runtime',{p_actor:actor,p_input:{discoveryId:discovery,operationId:randomUUID(),sessionId:session,now}});
const identity={current:async()=>AuthenticatedIdentitySchema.parse({identityId:actor,kind:'ANONYMOUS'})} as IdentityPort;
const access={readRoot:async()=>DiscoveryRootSchema.parse({discoveryId:discovery,ownerId:actor,entityVersion:0,createdAt:now}),findAccess:async()=>DiscoveryAccessSchema.parse({discoveryId:discovery,identityId:actor,role:'OWNER'})} as unknown as DiscoveryPersistencePort;
const runtime={read:async()=>DiscoveryRuntimeSchema.parse(sql(`select jsonb_build_object('discoveryId',discovery_id,'runtimeVersion',runtime_version,'freshness',freshness,'current',current_state,'pending',pending) from public.agent_b_runtime_state where discovery_id=${lit(discovery)};`)),listSessions:async()=>{
 const result=sql(`select coalesce(jsonb_agg(jsonb_build_object('discoveryId',discovery_id,'sessionId',session_id,'previousSessionId',previous_session_id,'lifecycle',lifecycle,'createdAt',created_at)),'[]') from public.agent_b_sessions where discovery_id=${lit(discovery)};`);return (result as unknown[]).map(s=>SessionSchema.parse(s));
}} as unknown as RuntimePersistencePort;
const context=new SupabaseGovernedContext(typed);
const capture=new ConversationalInformationCapture(identity,context,new SupabaseCapturedInformation(typed),new InformationPublication(identity,new SupabaseInformationPublication(typed)));
const app=new ProductRuntime(identity,access,runtime,context,capture);
const request={discoveryId:discovery,sessionId:session,runtimeVersion:0,conversation:{message:'Estou criando uma loja online. Hoje vendo pelo WhatsApp e controlo o estoque numa planilha. Quero automatizar esse processo, mas não posso ter um custo mensal alto.'},capture:{operationId:randomUUID(),capturedAt:now}};
const first=await app.converse(request);assert.equal(first.action.runtimeVersion,1);assert.match(first.response.text,/não verificadas/);
const firstState=await context.read(actor,{discoveryId:discovery,sessionId:session} as never);assert.equal(firstState.information.length,4);assert.ok(firstState.information.every(r=>r.confidence.level==='UNVERIFIED'));assert.equal(firstState.runtime?.current.informationReferences?.length,4);
await app.converse(request);assert.equal((await context.read(actor,{discoveryId:discovery,sessionId:session} as never)).information.length,4);
const adapter=new SupabaseRuntimePersistence(typed),nextSession=randomUUID();
const resumed=await adapter.resumeAtomic({identityId:actor,discoveryId:discovery,operationId:randomUUID(),sessionId:nextSession,previousSessionId:session,expectedRuntimeVersion:1,now:new Date().toISOString()} as never);
const resume=ResumeContextSchema.parse({discoveryId:discovery,runtimeVersion:resumed.runtime.runtimeVersion,current:resumed.runtime.current,pending:resumed.runtime.pending,previousSessionId:session});assert.equal(resume.current.informationReferences?.length,4);assert.equal(resume.current.sessionId,nextSession);
const next=await app.converse({discoveryId:discovery,sessionId:nextSession,runtimeVersion:2,conversation:{message:'O limite é dez dias.'},capture:{operationId:randomUUID(),capturedAt:new Date().toISOString()}});assert.equal(next.action.runtimeVersion,3);
const final=await context.read(actor,{discoveryId:discovery,sessionId:nextSession} as never);assert.equal(final.information.length,5);assert.equal(final.runtime?.current.informationReferences?.find(r=>r.fieldId==='field.constraints')?.recordIds.length,2);
console.log('PASS LOCAL GOLDEN: capture four Fields, UNVERIFIED, replay, refreshed MC03, new Session Resume, additive continuation; no transcript or remote connection.');
