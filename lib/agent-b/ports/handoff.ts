import type { DiscoveryId } from "../core/primitives.ts";
import type { Handoff } from "../core/handoff.ts";
import type { HandoffMutation } from "../core/handoff-lifecycle.ts";
export interface HandoffPort {
  current(identityId: string, discoveryId: DiscoveryId): Promise<Handoff | null>;
  list(identityId: string, discoveryId: DiscoveryId): Promise<readonly Handoff[]>;
  // Access, decision validation, CAS, lineage and replay are ONE transaction.
  mutate(identityId: string, input: HandoffMutation): Promise<Handoff>;
}
