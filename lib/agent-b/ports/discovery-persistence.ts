import type { DiscoveryId, EntityVersion } from "../core/primitives.ts";
import type { DiscoveryAccess, DiscoveryRoot, IdentityId } from "../core/identity-access.ts";

export interface DiscoveryListingPort {
  listOwned(identityId: IdentityId): Promise<readonly DiscoveryRoot[]>;
}

export interface DiscoveryPersistencePort {
  findAccess(discoveryId: DiscoveryId, identityId: IdentityId): Promise<DiscoveryAccess | null>;
  readRoot(discoveryId: DiscoveryId): Promise<DiscoveryRoot | null>;
  // One database transaction creates BOTH the root and its owner access.
  createOwnedRoot(identityId: IdentityId, operationId?: string): Promise<DiscoveryRoot>;
  // Atomic compare-and-increment; no runtime/semantic version or domain mutation.
  advanceEntityVersion(discoveryId: DiscoveryId, identityId: IdentityId, expected: EntityVersion): Promise<DiscoveryRoot>;
}
