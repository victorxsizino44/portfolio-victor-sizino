import type { StoredObject, FileReference, ExtractedRepresentation, FileType } from "../core/evidence.ts";
import type { SourceReference } from "../core/primitives.ts";
import type { EvidenceMutation, EvidenceRead, PersistedEvidence } from "../core/evidence-lifecycle.ts";
export interface EvidencePort {
  upload(input:{discoveryId:string;objectId:string;path:string;bytes:Uint8Array;fileType:FileType;createdAt:string;source:SourceReference}):Promise<StoredObject>;
  extract(file:StoredObject,reference:FileReference,bytes:Uint8Array):Promise<ExtractedRepresentation>;
}
export interface EvidencePersistencePort {
  // A single transaction authorizes, validates decisions, CAS and all lineage/link writes.
  mutate(identityId:string,input:Exclude<EvidenceMutation,{action:"DEFER"}>):Promise<unknown>;
  read(identityId:string,input:EvidenceRead):Promise<PersistedEvidence|null>;
  history(identityId:string,input:EvidenceRead):Promise<readonly PersistedEvidence[]>;
}
