import type { IdentityId } from "../core/identity-access.ts";
import type { InformationPublication, InformationPublicationResult } from "../core/information-publication.ts";
export interface InformationPublicationPort {
  publish(identityId: IdentityId, input: InformationPublication): Promise<InformationPublicationResult>;
}
