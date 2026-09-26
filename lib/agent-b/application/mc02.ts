import { Mc02ReadSchema, Mc02WriteSchema, PersistedMc02Schema } from "../core/mc02-persistence.ts";
import { FoundationError } from "../core/identity-access.ts";
import type { DiscoveryId } from "../core/primitives.ts";
import type { IdentityPort } from "../ports/identity.ts";
import type { DiscoveryPersistencePort } from "../ports/discovery-persistence.ts";
import type { Mc02PersistencePort } from "../ports/mc02-persistence.ts";

export class GovernedMc02 {
  private readonly identity: Pick<IdentityPort, "current">;
  private readonly access: Pick<DiscoveryPersistencePort, "readRoot" | "findAccess">;
  private readonly repository: Mc02PersistencePort;
  constructor(identity: Pick<IdentityPort, "current">, access: Pick<DiscoveryPersistencePort, "readRoot" | "findAccess">, repository: Mc02PersistencePort) {
    this.identity = identity; this.access = access; this.repository = repository;
  }
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
  async write(input: unknown) {
    const parsed = Mc02WriteSchema.safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const identityId = await this.authorize(parsed.data.discoveryId);
    const result = PersistedMc02Schema.parse(await this.repository.write(identityId, parsed.data));
    if (result.discoveryId !== parsed.data.discoveryId || result.operationId !== parsed.data.operationId ||
        result.value.kind !== parsed.data.value.kind || result.entityVersion !== parsed.data.value.contract.entityVersion ||
        JSON.stringify(result.value) !== JSON.stringify(parsed.data.value))
      throw new FoundationError("PROVIDER_UNAVAILABLE");
    return result;
  }
  async read(input: unknown) {
    const parsed = Mc02ReadSchema.safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const actor = await this.authorize(parsed.data.discoveryId);
    const result = await this.repository.read(actor, parsed.data);
    if (!result) return null;
    const row = PersistedMc02Schema.parse(result);
    if (row.discoveryId !== parsed.data.discoveryId || row.value.kind !== parsed.data.kind) throw new FoundationError("ACCESS_DENIED");
    return row;
  }
  async history(input: unknown) {
    const parsed = Mc02ReadSchema.safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const actor = await this.authorize(parsed.data.discoveryId);
    return (await this.repository.history(actor, parsed.data)).map(value => {
      const row = PersistedMc02Schema.parse(value);
      if (row.discoveryId !== parsed.data.discoveryId || row.value.kind !== parsed.data.kind) throw new FoundationError("ACCESS_DENIED");
      return row;
    });
  }
}
