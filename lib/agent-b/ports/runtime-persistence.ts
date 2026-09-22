import type { DiscoveryId, EntityVersion, RuntimeVersion, SessionId, Timestamp } from "../core/primitives.ts";
import type { IdentityId } from "../core/identity-access.ts";
import type { DiscoveryRuntime, Session } from "../core/mc04.ts";
export interface RuntimePersistencePort {
  read(input: { identityId: IdentityId; discoveryId: DiscoveryId }): Promise<DiscoveryRuntime | null>;
  mutate(input: { identityId: IdentityId; discoveryId: DiscoveryId; expectedRuntimeVersion: RuntimeVersion; runtime: DiscoveryRuntime }): Promise<DiscoveryRuntime>;
  createSession(input: { identityId: IdentityId; discoveryId: DiscoveryId; previousSessionId: SessionId | null; sessionId: SessionId; now: Timestamp }): Promise<Session>;
  transitionSession(input: { identityId: IdentityId; discoveryId: DiscoveryId; sessionId: SessionId; lifecycle: "INTERRUPTED" | "CLOSED" }): Promise<Session>;
  listSessions(input: { identityId: IdentityId; discoveryId: DiscoveryId }): Promise<readonly Session[]>;
}
