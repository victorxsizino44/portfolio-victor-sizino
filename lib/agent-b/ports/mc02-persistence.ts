import type { Mc02Read, Mc02Write, PersistedMc02 } from "../core/mc02-persistence.ts";
export interface Mc02PersistencePort {
  read(identityId: string, input: Mc02Read): Promise<PersistedMc02 | null>;
  history(identityId: string, input: Mc02Read): Promise<readonly PersistedMc02[]>;
  // Transaction repeats ownership + CAS. Exact operation replay returns its
  // original historical result without republishing it as current.
  write(identityId: string, input: Mc02Write): Promise<PersistedMc02>;
}
