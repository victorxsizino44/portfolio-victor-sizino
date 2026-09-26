import { FoundationError } from "../core/identity-access.ts";
import { HandoffSchema, deriveWorkingBriefing } from "../core/handoff.ts";
import { IssueHandoffSchema, SupersedeHandoffSchema, HandoffReadSchema, type HandoffMutation } from "../core/handoff-lifecycle.ts";
import type { DiscoveryRuntime } from "../core/mc04.ts";
import type { DiscoveryId } from "../core/primitives.ts";
import type { IdentityPort } from "../ports/identity.ts";
import type { DiscoveryPersistencePort } from "../ports/discovery-persistence.ts";
import type { HandoffPort } from "../ports/handoff.ts";

export class GovernedHandoff {
  private readonly identity: Pick<IdentityPort, "current">;
  private readonly access: Pick<DiscoveryPersistencePort, "readRoot" | "findAccess">;
  private readonly repository: HandoffPort;
  constructor(identity: Pick<IdentityPort, "current">, access: Pick<DiscoveryPersistencePort, "readRoot" | "findAccess">, repository: HandoffPort) {
    this.identity = identity; this.access = access; this.repository = repository;
  }
  briefing(runtime: DiscoveryRuntime) { return deriveWorkingBriefing(runtime); }
  private async authorize(discoveryId: DiscoveryId) {
    const actor = await this.identity.current();
    if (!actor) throw new FoundationError("AUTHENTICATION_REQUIRED");
    const root = await this.access.readRoot(discoveryId);
    const access = await this.access.findAccess(discoveryId, actor.identityId);
    if (!root || root.discoveryId !== discoveryId || root.ownerId !== actor.identityId ||
      !access || access.discoveryId !== discoveryId || access.identityId !== actor.identityId || access.role !== "OWNER")
      throw new FoundationError("ACCESS_DENIED");
    return actor.identityId;
  }
  async issue(input: unknown) {
    const parsed = IssueHandoffSchema.safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    return this.mutate(parsed.data);
  }
  async supersede(input: unknown) {
    const parsed = SupersedeHandoffSchema.safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    return this.mutate(parsed.data);
  }
  private async mutate(input: HandoffMutation) {
    const actor = await this.authorize(input.discoveryId);
    // A reference/owner check is not governance proof. The port MUST resolve the
    // persisted decision and active authority inside the material transaction.
    const result = HandoffSchema.parse(await this.repository.mutate(actor, input));
    const previous = input.action === "ISSUE_HANDOFF" ? null : input.expectedHandoffId;
    const version = input.action === "ISSUE_HANDOFF" ? 1 : input.expectedVersion + 1;
    if (result.discoveryId !== input.discoveryId || result.handoffId !== input.handoffId ||
      result.version !== version || result.previousHandoffId !== previous || result.status !== "ISSUED" ||
      result.sourceRuntimeVersion !== input.sourceRuntimeVersion || result.issuedAt !== input.issuedAt ||
      JSON.stringify(result.decision) !== JSON.stringify(input.decision))
      throw new FoundationError("PROVIDER_UNAVAILABLE");
    return result;
  }
  async current(input: unknown) {
    const parsed = HandoffReadSchema.safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const actor = await this.authorize(parsed.data.discoveryId);
    const value = await this.repository.current(actor, parsed.data.discoveryId);
    if (!value) return null;
    const result = HandoffSchema.parse(value);
    if (result.discoveryId !== parsed.data.discoveryId || result.status !== "ISSUED") throw new FoundationError("PROVIDER_UNAVAILABLE");
    return result;
  }
  async history(input: unknown) {
    const parsed = HandoffReadSchema.safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const actor = await this.authorize(parsed.data.discoveryId);
    return (await this.repository.list(actor, parsed.data.discoveryId)).map(value => {
      const result = HandoffSchema.parse(value);
      if (result.discoveryId !== parsed.data.discoveryId) throw new FoundationError("ACCESS_DENIED");
      return result;
    });
  }
}
