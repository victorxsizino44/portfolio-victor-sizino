import "../server-boundary.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentBDatabase } from "./database.types.ts";
import type { CapturedInformationReadPort } from "../../ports/information-capture.ts";
import { DiscoveryInformationRecordSchema } from "../../core/mc01.ts";
import { FoundationError } from "../../core/identity-access.ts";
export class SupabaseCapturedInformation implements CapturedInformationReadPort {
  private readonly client:SupabaseClient<AgentBDatabase>;
  constructor(client:SupabaseClient<AgentBDatabase>){this.client=client;}
  async byOperation(_actor:Parameters<CapturedInformationReadPort["byOperation"]>[0],discovery:Parameters<CapturedInformationReadPort["byOperation"]>[1],operationId:string){
    const {data,error}=await this.client.from("agent_b_information_records").select("payload,supersedes_record_id").eq("discovery_id",discovery).contains("payload",{sources:[{sourceId:operationId}]});
    if(error)throw new FoundationError("PROVIDER_UNAVAILABLE");
    return (data??[]).map(row=>({record:DiscoveryInformationRecordSchema.parse(row.payload),predecessorRecordId:row.supersedes_record_id}));
  }
}
