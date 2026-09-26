import { FoundationError } from "../core/identity-access.ts";
import { EvidenceMutationSchema,EvidenceReadSchema,PersistedEvidenceSchema } from "../core/evidence-lifecycle.ts";
import { EvidenceCandidateSchema,ExtractedRepresentationSchema } from "../core/evidence.ts";
import type { IdentityPort } from "../ports/identity.ts";
import type { DiscoveryPersistencePort } from "../ports/discovery-persistence.ts";
import type { EvidencePersistencePort } from "../ports/evidence.ts";
import type { DiscoveryId } from "../core/primitives.ts";
export class GovernedEvidenceLifecycle {
  private readonly identity:Pick<IdentityPort,"current">;
  private readonly access:Pick<DiscoveryPersistencePort,"readRoot"|"findAccess">;
  private readonly repository:EvidencePersistencePort;
  constructor(identity:Pick<IdentityPort,"current">,access:Pick<DiscoveryPersistencePort,"readRoot"|"findAccess">,repository:EvidencePersistencePort){
    this.identity=identity;this.access=access;this.repository=repository;
  }
  private async authorize(discoveryId:DiscoveryId){
    const actor=await this.identity.current();if(!actor)throw new FoundationError("AUTHENTICATION_REQUIRED");
    const root=await this.access.readRoot(discoveryId);const access=await this.access.findAccess(discoveryId,actor.identityId);
    if(!root||root.discoveryId!==discoveryId||root.ownerId!==actor.identityId||!access||access.discoveryId!==discoveryId||access.identityId!==actor.identityId||access.role!=="OWNER")throw new FoundationError("ACCESS_DENIED");
    return actor.identityId;
  }
  async mutate(input:unknown){
    const p=EvidenceMutationSchema.safeParse(input);if(!p.success)throw new FoundationError("INVALID_INPUT");
    const actor=await this.authorize(p.data.discoveryId);
    if(p.data.action==="DEFER")return {action:"DEFER" as const};
    const result=await this.repository.mutate(actor,p.data);
    if(p.data.action==="PERSIST_REPRESENTATION"){
      const row=ExtractedRepresentationSchema.parse(result);
      if(JSON.stringify(row)!==JSON.stringify(p.data.representation))throw new FoundationError("PROVIDER_UNAVAILABLE");return row;
    }
    if(p.data.action==="PERSIST_CANDIDATE"){
      const row=EvidenceCandidateSchema.parse(result);
      if(JSON.stringify(row)!==JSON.stringify(p.data.candidate))throw new FoundationError("PROVIDER_UNAVAILABLE");return row;
    }
    const row=PersistedEvidenceSchema.parse(result);
    const expected=p.data.action==="RECEIVE"?0:p.data.expectedEntityVersion+1;
    const status=p.data.action==="RECEIVE"?"RECEIVED":p.data.action==="VALIDATE"?"VALIDATED":p.data.action==="REJECT"?"REJECTED":"SUPERSEDED";
    if(row.evidence.discoveryId!==p.data.discoveryId||row.evidence.evidenceId!==p.data.evidenceId||row.operationId!==p.data.operationId||row.entityVersion!==expected||row.evidence.validation!==status)throw new FoundationError("PROVIDER_UNAVAILABLE");
    if(p.data.action==="VALIDATE"&&(row.informationTarget?.informationRecordId!==p.data.informationRecordId||row.informationTarget.informationVersion!==p.data.informationVersion))throw new FoundationError("PROVIDER_UNAVAILABLE");
    return row;
  }
  async read(input:unknown){
    const p=EvidenceReadSchema.safeParse(input);if(!p.success)throw new FoundationError("INVALID_INPUT");
    const result=await this.repository.read(await this.authorize(p.data.discoveryId),p.data);
    if(!result)return null;
    const row=PersistedEvidenceSchema.parse(result);
    if(row.evidence.discoveryId!==p.data.discoveryId||row.evidence.evidenceId!==p.data.evidenceId)throw new FoundationError("ACCESS_DENIED");
    return row;
  }
  async history(input:unknown){
    const p=EvidenceReadSchema.safeParse(input);if(!p.success)throw new FoundationError("INVALID_INPUT");
    return (await this.repository.history(await this.authorize(p.data.discoveryId),p.data)).map(v=>{
      const row=PersistedEvidenceSchema.parse(v);if(row.evidence.discoveryId!==p.data.discoveryId||row.evidence.evidenceId!==p.data.evidenceId)throw new FoundationError("ACCESS_DENIED");return row;
    });
  }
}
