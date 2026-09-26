import "../server-boundary.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentBDatabase } from "./database.types.ts";
import type { InformationPublicationPort } from "../../ports/information-publication.ts";
import { InformationPublicationResultSchema } from "../../core/information-publication.ts";
import { FoundationError } from "../../core/identity-access.ts";
export class SupabaseInformationPublication implements InformationPublicationPort {
  private readonly client: SupabaseClient<AgentBDatabase>;
  constructor(client: SupabaseClient<AgentBDatabase>) { this.client=client; }
  async publish(actor: Parameters<InformationPublicationPort["publish"]>[0], input: Parameters<InformationPublicationPort["publish"]>[1]) {
    const { data, error } = await this.client.rpc("agent_b_publish_information", { p_actor: actor, p_input: input });
    if (error) throw new FoundationError(error.code === "42501" ? "ACCESS_DENIED" : ["40001","23505"].includes(error.code) ? "CONCURRENT_MODIFICATION" : error.code === "22023" ? "INVALID_INPUT" : "PROVIDER_UNAVAILABLE");
    return InformationPublicationResultSchema.parse(data);
  }
}
