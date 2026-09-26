import "../server-boundary.ts";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentBDatabase } from "./database.types.ts";
import type { Mc02PersistencePort } from "../../ports/mc02-persistence.ts";
import { PersistedMc02Schema, type Mc02Read, type Mc02Write } from "../../core/mc02-persistence.ts";
import { FoundationError } from "../../core/identity-access.ts";
export class SupabaseMc02Persistence implements Mc02PersistencePort {
  private readonly client: SupabaseClient<AgentBDatabase>;
  constructor(client: SupabaseClient<AgentBDatabase>) { this.client = client; }
  async read(identityId: string, input: Mc02Read) {
    const { data, error } = await this.client.rpc("agent_b_read_mc02", { p_actor: identityId, p_discovery: input.discoveryId, p_kind: input.kind, p_history: false });
    fail(error);
    return parse(PersistedMc02Schema.nullable(), data);
  }
  async history(identityId: string, input: Mc02Read) {
    const { data, error } = await this.client.rpc("agent_b_read_mc02", { p_actor: identityId, p_discovery: input.discoveryId, p_kind: input.kind, p_history: true });
    fail(error);
    return parse(z.array(PersistedMc02Schema), data);
  }
  async write(identityId: string, input: Mc02Write) {
    const { data, error } = await this.client.rpc("agent_b_write_mc02", { p_actor: identityId, p_input: input });
    fail(error);
    return parse(PersistedMc02Schema, data);
  }
}
function fail(error: { code?: string } | null) {
  if (!error) return;
  throw new FoundationError(error.code === "42501" ? "ACCESS_DENIED" : error.code === "40001" || error.code === "23505" ? "CONCURRENT_MODIFICATION" : error.code === "22023" ? "INVALID_INPUT" : "PROVIDER_UNAVAILABLE");
}
function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new FoundationError("PROVIDER_UNAVAILABLE");
  return result.data;
}
