import { HumanDecisionSchema, DecisionValidationSchema } from "../core/governance.ts";
import { FoundationError } from "../core/identity-access.ts";
import type { IdentityPort } from "../ports/identity.ts";
import type { GovernancePort } from "../ports/governance.ts";

export class HumanGovernance {
  private readonly identity: IdentityPort;
  private readonly persistence: GovernancePort;
  constructor(identity: IdentityPort, persistence: GovernancePort) {
    this.identity = identity;
    this.persistence = persistence;
  }
  async record(input: unknown) {
    const parsed = HumanDecisionSchema.safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const actor = await this.identity.current();
    if (!actor) throw new FoundationError("AUTHENTICATION_REQUIRED");
    if (actor.identityId !== parsed.data.actorIdentityId) throw new FoundationError("ACCESS_DENIED");
    const result = HumanDecisionSchema.parse(await this.persistence.record(actor.identityId, parsed.data));
    for (const key of Object.keys(parsed.data) as (keyof typeof parsed.data)[]) {
      if (result[key] !== parsed.data[key]) throw new FoundationError("PROVIDER_UNAVAILABLE");
    }
    return result;
  }
  async validate(input: unknown): Promise<void> {
    const parsed = DecisionValidationSchema.safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const actor = await this.identity.current();
    if (!actor) throw new FoundationError("AUTHENTICATION_REQUIRED");
    await this.persistence.validate(actor.identityId, parsed.data);
  }
}
