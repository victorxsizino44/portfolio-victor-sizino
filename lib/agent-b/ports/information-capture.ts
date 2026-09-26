import type { DiscoveryInformationRecord } from "../core/mc01.ts";
import type { IdentityId } from "../core/identity-access.ts";
import type { DiscoveryId } from "../core/primitives.ts";
export interface CapturedInformationReadPort {
  // Authorized immutable records, not a client assertion or a second writer.
  byOperation(actor:IdentityId,discovery:DiscoveryId,operationId:string):Promise<Array<{record:DiscoveryInformationRecord;predecessorRecordId:string|null}>>;
}
