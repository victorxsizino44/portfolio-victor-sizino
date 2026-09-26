import { resolveInformationReferences, currentRecordIds } from "../../core/current-information.ts";
import "../server-boundary.ts";
import { RuntimeOperationResultSchema } from "../../core/runtime-operations.ts";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DiscoveryRuntimeSchema, SessionSchema } from "../../core/mc04.ts";
import type { RuntimePersistencePort } from "../../ports/runtime-persistence.ts";
import type { AgentBDatabase } from "./database.types.ts";
import { FoundationError } from "../../core/identity-access.ts";
const runtimeRow = z.strictObject({ discovery_id:z.string(), runtime_version:z.number(), freshness:z.string(), current_state:z.unknown(), pending:z.unknown() });
export class SupabaseRuntimePersistence implements RuntimePersistencePort {
 private client: any; constructor(client: SupabaseClient<AgentBDatabase>){this.client=client;}
 async read(i:any){const {data,error}=await this.client.from("agent_b_runtime_state").select("discovery_id,runtime_version,freshness,current_state,pending").eq("discovery_id",i.discoveryId).maybeSingle();if(error)throw new FoundationError(error.code==="42501"?"ACCESS_DENIED":"PROVIDER_UNAVAILABLE");if(!data)return null;const r=runtimeRow.parse(data);return this.normalize(DiscoveryRuntimeSchema.parse({discoveryId:r.discovery_id,runtimeVersion:r.runtime_version,freshness:r.freshness,current:r.current_state,pending:r.pending}));}
 async mutate(i:any){if(!i.runtime||i.runtime.runtimeVersion!==i.expectedRuntimeVersion+1)throw new FoundationError("INVALID_INPUT");const {data,error}=await this.client.from("agent_b_runtime_state").update({runtime_version:i.runtime.runtimeVersion,freshness:i.runtime.freshness,current_state:i.runtime.current,pending:i.runtime.pending}).eq("discovery_id",i.discoveryId).eq("runtime_version",i.expectedRuntimeVersion).select().single();if(error)throw new FoundationError(error.code==="PGRST116"||error.code==="40001"?"CONCURRENT_MODIFICATION":"PROVIDER_UNAVAILABLE");const r=runtimeRow.parse(data);return this.normalize(DiscoveryRuntimeSchema.parse({discoveryId:r.discovery_id,runtimeVersion:r.runtime_version,freshness:r.freshness,current:r.current_state,pending:r.pending}));}
 async createSession(i:any){const {data,error}=await this.client.from("agent_b_sessions").insert({session_id:i.sessionId,discovery_id:i.discoveryId,previous_session_id:i.previousSessionId,lifecycle:"OPEN",created_at:i.now}).select().single();if(error)throw new FoundationError(error.code==="23505"?"CONCURRENT_MODIFICATION":"PROVIDER_UNAVAILABLE");return SessionSchema.parse({sessionId:data.session_id,discoveryId:data.discovery_id,previousSessionId:data.previous_session_id,lifecycle:data.lifecycle,createdAt:data.created_at});}
 async transition(i:any){const {data,error}=await this.client.from("agent_b_sessions").update({lifecycle:i.lifecycle}).eq("session_id",i.sessionId).eq("discovery_id",i.discoveryId).eq("lifecycle","OPEN").select().single();if(error)throw new FoundationError(error.code==="PGRST116"?"CONCURRENT_MODIFICATION":"PROVIDER_UNAVAILABLE");return SessionSchema.parse({sessionId:data.session_id,discoveryId:data.discovery_id,previousSessionId:data.previous_session_id,lifecycle:data.lifecycle,createdAt:data.created_at});}
 async transitionSession(i:any){ return this.transition(i); }
 async listSessions(i:any){const {data,error}=await this.client.from("agent_b_sessions").select("session_id,discovery_id,previous_session_id,lifecycle,created_at").eq("discovery_id",i.discoveryId).order("created_at");if(error)throw new FoundationError("PROVIDER_UNAVAILABLE");return (data??[]).map((d:any)=>SessionSchema.parse({sessionId:d.session_id,discoveryId:d.discovery_id,previousSessionId:d.previous_session_id,lifecycle:d.lifecycle,createdAt:d.created_at}));}
 private async normalize(runtime: import("../../core/mc04.ts").DiscoveryRuntime) {
   const ids = [...new Set([...currentRecordIds(runtime.current), ...(runtime.current.informationRecordId ? [runtime.current.informationRecordId] : [])])];
   let records: { recordId: string; fieldId: string; discoveryId: string }[] = [];
   if (ids.length) {
     const { data, error } = await this.client.from("agent_b_information_records").select("record_id,discovery_id,payload").eq("discovery_id", runtime.discoveryId).in("record_id", ids);
     if (error) throw new FoundationError("PROVIDER_UNAVAILABLE");
     records = (data ?? []).map((r: {record_id:string;discovery_id:string;payload:{fieldId:string}}) => ({ recordId:r.record_id,discoveryId:r.discovery_id,fieldId:r.payload.fieldId }));
   }
   try {
     const informationReferences = resolveInformationReferences(runtime.current,records,runtime.discoveryId);
     const { informationRecordId: _legacy, ...current } = runtime.current;
     return { ...runtime, current: { ...current, informationReferences } };
   } catch { throw new FoundationError("PROVIDER_UNAVAILABLE"); }
 }
 async initializeAtomic(i: Parameters<RuntimePersistencePort["initializeAtomic"]>[0]) {
   return this.operation("agent_b_initialize_runtime", i);
 }
 async resumeAtomic(i: Parameters<RuntimePersistencePort["resumeAtomic"]>[0]) {
   return this.operation("agent_b_resume_atomic", i);
 }
 private async operation(name: "agent_b_initialize_runtime" | "agent_b_resume_atomic", i: Parameters<RuntimePersistencePort["initializeAtomic"]>[0] | Parameters<RuntimePersistencePort["resumeAtomic"]>[0]) {
   const { identityId, ...input } = i;
   const { data, error } = await this.client.rpc(name, { p_actor: identityId, p_input: input });
   if (error) throw new FoundationError(error.code === "42501" ? "ACCESS_DENIED" : error.code === "40001" || error.code === "23505" ? "CONCURRENT_MODIFICATION" : error.code === "22023" ? "INVALID_INPUT" : "PROVIDER_UNAVAILABLE");
   const parsed = RuntimeOperationResultSchema.safeParse(data);
   if (!parsed.success) throw new FoundationError("PROVIDER_UNAVAILABLE");
   return { ...parsed.data, runtime: await this.normalize(parsed.data.runtime) };
 }
}
