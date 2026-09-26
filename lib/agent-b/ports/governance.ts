import type { HumanDecision, DecisionValidation } from "../core/governance.ts";

export interface GovernancePort {
  // Must verify DiscoveryAccess AND independently provisioned active authority.
  // Exact operation replay returns the original decision; altered replay fails.
  record(actorIdentityId: string, decision: HumanDecision): Promise<HumanDecision>;
  // Read-only preflight; future material RPCs MUST repeat validation in their transaction.
  validate(actorIdentityId: string, intent: DecisionValidation): Promise<void>;
}
