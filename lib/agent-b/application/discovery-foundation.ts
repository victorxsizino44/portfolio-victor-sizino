import { z } from "zod";
import { DiscoveryIdSchema, EntityVersionSchema } from "../core/primitives.ts";
import { DiscoveryCapabilitySchema, FoundationError } from "../core/identity-access.ts";
import type { IdentityPort } from "../ports/identity.ts";
import type { DiscoveryPersistencePort } from "../ports/discovery-persistence.ts";

export class DiscoveryFoundation {
  private readonly identity: IdentityPort;
  private readonly persistence: DiscoveryPersistencePort;

  constructor(identity: IdentityPort, persistence: DiscoveryPersistencePort) {
    this.identity = identity;
    this.persistence = persistence;
  }

  async createOwnedDiscovery(operationId?: string) {
    if (operationId !== undefined && !z.string().uuid().safeParse(operationId).success) throw new FoundationError("INVALID_INPUT");
    const current = await this.identity.current();
    if (!current) throw new FoundationError("AUTHENTICATION_REQUIRED");
    const root = await this.persistence.createOwnedRoot(current.identityId, operationId);
    if (root.ownerId !== current.identityId) throw new FoundationError("ACCESS_DENIED");
    return root;
  }

  private async authorize(discoveryInput: unknown, capabilityInput: unknown) {
    const discovery = DiscoveryIdSchema.safeParse(discoveryInput);
    const capability = DiscoveryCapabilitySchema.safeParse(capabilityInput);
    if (!discovery.success || !capability.success) throw new FoundationError("INVALID_INPUT");
    const current = await this.identity.current();
    if (!current) throw new FoundationError("AUTHENTICATION_REQUIRED");
    const access = await this.persistence.findAccess(discovery.data, current.identityId);
    if (!access || access.discoveryId !== discovery.data || access.identityId !== current.identityId || access.role !== "OWNER") {
      throw new FoundationError("ACCESS_DENIED");
    }
    const root = await this.persistence.readRoot(discovery.data);
    if (!root || root.discoveryId !== discovery.data || root.ownerId !== current.identityId) {
      throw new FoundationError("ACCESS_DENIED");
    }
    // Owner capability is scoped to this root only; never Human Governance.
    return { current, root };
  }

  async readRoot(discoveryInput: unknown) {
    return (await this.authorize(discoveryInput, "READ_ROOT")).root;
  }

  async advanceEntityVersion(input: unknown) {
    const parsed = z.strictObject({ discoveryId: DiscoveryIdSchema, expectedEntityVersion: EntityVersionSchema }).safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const { current, root } = await this.authorize(parsed.data.discoveryId, "ADVANCE_ENTITY_VERSION");
    if (root.entityVersion !== parsed.data.expectedEntityVersion) throw new FoundationError("CONCURRENT_MODIFICATION");
    // Database CAS repeats the authorization and expected-version check atomically.
    const updated = await this.persistence.advanceEntityVersion(root.discoveryId, current.identityId, parsed.data.expectedEntityVersion);
    if (updated.discoveryId !== root.discoveryId || updated.ownerId !== current.identityId) throw new FoundationError("ACCESS_DENIED");
    return updated;
  }
}
