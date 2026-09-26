import "../server-boundary.ts";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentBDatabase } from "./database.types.ts";
import type { HandoffPort } from "../../ports/handoff.ts";
import type { HandoffMutation } from "../../core/handoff-lifecycle.ts";
import type { DiscoveryId } from "../../core/primitives.ts";
import { HandoffSchema } from "../../core/handoff.ts";
import { FoundationError } from "../../core/identity-access.ts";

export class SupabaseHandoffAdapter implements HandoffPort {
  private readonly client: SupabaseClient<AgentBDatabase>;
  constructor(client: SupabaseClient<AgentBDatabase>) { this.client = client; }
  async current(identityId: string, discoveryId: DiscoveryId) {
    const { data, error } = await this.client.rpc("agent_b_read_handoff", { p_actor: identityId, p_discovery: discoveryId, p_history: false });
    fail(error); return parse(HandoffSchema.nullable(), data);
  }
  async list(identityId: string, discoveryId: DiscoveryId) {
    const { data, error } = await this.client.rpc("agent_b_read_handoff", { p_actor: identityId, p_discovery: discoveryId, p_history: true });
    fail(error); return parse(z.array(HandoffSchema), data);
  }
  async mutate(identityId: string, input: HandoffMutation) {
    const { data, error } = await this.client.rpc("agent_b_mutate_handoff", { p_actor: identityId, p_input: input });
    fail(error); return parse(HandoffSchema, data);
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
