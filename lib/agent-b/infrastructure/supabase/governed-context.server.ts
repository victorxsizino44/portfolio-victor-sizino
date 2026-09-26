import "../server-boundary.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentBDatabase } from "./database.types.ts";
import { PersistedContextSnapshotSchema, type ContextRequest, type GovernedContextReadPort } from "../../ports/governed-context.ts";
import { projectContextSources } from "../../application/context-source-projection.ts";
import { FoundationError } from "../../core/identity-access.ts";

export class SupabaseGovernedContext implements GovernedContextReadPort {
  private readonly client: SupabaseClient<AgentBDatabase>;
  constructor(client: SupabaseClient<AgentBDatabase>) { this.client = client; }
  async read(identityId: string, request: ContextRequest) {
    const { data, error } = await this.client.rpc("agent_b_read_governed_context", {
      p_actor: identityId, p_discovery: request.discoveryId, p_session: request.sessionId,
    });
    if (error) throw new FoundationError(error.code === "42501" ? "ACCESS_DENIED" : "PROVIDER_UNAVAILABLE");
    const parsed = PersistedContextSnapshotSchema.safeParse(data);
    if (!parsed.success) throw new FoundationError("PROVIDER_UNAVAILABLE");
    return projectContextSources(parsed.data, request.discoveryId);
  }
}
