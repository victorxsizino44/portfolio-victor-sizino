import { InformationPublicationSchema, InformationPublicationResultSchema } from "../core/information-publication.ts";
import { FoundationError } from "../core/identity-access.ts";
import type { IdentityPort } from "../ports/identity.ts";
import type { InformationPublicationPort } from "../ports/information-publication.ts";
import { bindingOf } from "../core/domain-binding.ts";

// Single material writer shared by governed conversational capture.
export class InformationPublication {
  private readonly identity: IdentityPort;
  private readonly persistence: InformationPublicationPort;
  constructor(identity: IdentityPort, persistence: InformationPublicationPort) { this.identity=identity; this.persistence=persistence; }
  async publish(input: unknown) {
    const parsed = InformationPublicationSchema.safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const actor = await this.identity.current();
    if (!actor) throw new FoundationError("AUTHENTICATION_REQUIRED");
    const request = { ...parsed.data, candidates: parsed.data.candidates.map(c => {
      const { domainId: _legacy, ...record } = c.record;
      return { ...c, record: { ...record, domainBinding: bindingOf(c.record) } };
    }) };
    const result = InformationPublicationResultSchema.parse(await this.persistence.publish(actor.identityId, request));
    if (result.operationId !== request.operationId || result.runtime.discoveryId !== request.discoveryId ||
      result.runtime.runtimeVersion !== request.expectedRuntimeVersion + 1 ||
      result.records.length !== request.candidates.length || result.records.some((r,i) => r.recordId !== request.candidates[i].record.recordId || r.discoveryId !== request.discoveryId))
      throw new FoundationError("PROVIDER_UNAVAILABLE");
    return result;
  }
}
