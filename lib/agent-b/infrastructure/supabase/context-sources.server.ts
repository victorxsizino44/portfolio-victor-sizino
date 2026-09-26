import "../server-boundary.ts";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentBDatabase } from "./database.types.ts";
import type { ContextSourcesPort } from "../../ports/context-sources.ts";
import { CatalogPublicationSchema, CatalogReadSchema, GovernedCatalogSchema, type CatalogPublication, type CatalogRead } from "../../core/context-sources.ts";
import { FoundationError } from "../../core/identity-access.ts";
export class SupabaseContextSources implements ContextSourcesPort {
  private readonly client: SupabaseClient<AgentBDatabase>;
  constructor(client: SupabaseClient<AgentBDatabase>) { this.client=client; }
  async publish(actor: string, input: CatalogPublication) {
    const { data, error } = await this.client.rpc("agent_b_publish_context_catalog", { p_actor: actor, p_input: CatalogPublicationSchema.parse(input) });
    fail(error); return GovernedCatalogSchema.parse(data);
  }
  async read(actor: string, input: CatalogRead) {
    const request = CatalogReadSchema.parse(input);
    const { data, error } = await this.client.rpc("agent_b_read_context_catalog", { p_actor: actor, p_discovery: request.discoveryId, p_kind: request.kind, p_history: request.history });
    fail(error); return z.array(GovernedCatalogSchema).parse(data);
  }
}
function fail(error: { code?: string } | null) {
  if (error) throw new FoundationError(error.code === "42501" ? "ACCESS_DENIED" : error.code === "40001" || error.code === "23505" ? "CONCURRENT_MODIFICATION" : error.code === "22023" ? "INVALID_INPUT" : "PROVIDER_UNAVAILABLE");
}
