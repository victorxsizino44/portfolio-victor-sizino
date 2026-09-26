import "../server-boundary.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentBDatabase } from "./database.types.ts";
import { HumanDecisionSchema, type HumanDecision, type DecisionValidation } from "../../core/governance.ts";
import { FoundationError } from "../../core/identity-access.ts";
import type { GovernancePort } from "../../ports/governance.ts";

function fail(code: string): never {
  throw new FoundationError(code === "42501" ? "ACCESS_DENIED" : code === "40001" || code === "23505" ? "CONCURRENT_MODIFICATION" : code === "22023" ? "INVALID_INPUT" : "PROVIDER_UNAVAILABLE");
}
export class SupabaseGovernance implements GovernancePort {
  private readonly client: SupabaseClient<AgentBDatabase>;
  constructor(client: SupabaseClient<AgentBDatabase>) { this.client = client; }
  async record(actorIdentityId: string, decision: HumanDecision) {
    const { data, error } = await this.client.rpc("agent_b_record_human_decision", { p_actor: actorIdentityId, p_decision: decision });
    if (error) fail(error.code);
    return HumanDecisionSchema.parse(data);
  }
  async validate(actorIdentityId: string, intent: DecisionValidation) {
    const { error } = await this.client.rpc("agent_b_validate_human_decision", { p_actor: actorIdentityId, p_intent: intent });
    if (error) fail(error.code);
  }
}
