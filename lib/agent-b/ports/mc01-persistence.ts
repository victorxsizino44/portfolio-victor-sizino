import type { DiscoveryInformationRecord } from "../core/mc01.ts";
import type { DiscoveryId, EntityVersion, InformationRecordId, Timestamp } from "../core/primitives.ts";
import type { IdentityId } from "../core/identity-access.ts";

export type PersistedInformationRecord = Readonly<{
  record: DiscoveryInformationRecord;
  lineageRootId: InformationRecordId;
  supersedesRecordId: InformationRecordId | null;
  createdAt: Timestamp;
}>;

export interface Mc01PersistencePort {
  create(input: { identityId: IdentityId; record: DiscoveryInformationRecord; now: Timestamp }): Promise<PersistedInformationRecord>;
  read(input: { identityId: IdentityId; discoveryId: DiscoveryId; recordId: InformationRecordId }): Promise<PersistedInformationRecord | null>;
  update(input: { identityId: IdentityId; discoveryId: DiscoveryId; expectedEntityVersion: EntityVersion; record: DiscoveryInformationRecord; now: Timestamp; }): Promise<PersistedInformationRecord>;
  listLineage(input: { identityId: IdentityId; discoveryId: DiscoveryId; lineageRootId: InformationRecordId }): Promise<readonly PersistedInformationRecord[]>;
}
