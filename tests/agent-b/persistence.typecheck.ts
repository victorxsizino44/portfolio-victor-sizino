import type { IdentityId } from "../../lib/agent-b/core/identity-access.ts";
import type { DiscoveryId, SessionId, RuntimeVersion } from "../../lib/agent-b/core/primitives.ts";
import type { DiscoveryPersistencePort } from "../../lib/agent-b/ports/discovery-persistence.ts";

type AssertFalse<T extends false> = T;
type Assignable<A, B> = [A] extends [B] ? true : false;
export type B02NominalChecks = [
  AssertFalse<Assignable<IdentityId, DiscoveryId>>,
  AssertFalse<Assignable<DiscoveryId, IdentityId>>,
  AssertFalse<Assignable<IdentityId, SessionId>>,
  AssertFalse<Assignable<RuntimeVersion, Parameters<DiscoveryPersistencePort["advanceEntityVersion"]>[2]>>,
];
