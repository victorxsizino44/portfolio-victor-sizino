import { CatalogPublicationSchema, CatalogReadSchema, GovernedCatalogSchema, publicationIntent } from "../core/context-sources.ts";
import { FoundationError } from "../core/identity-access.ts";
import type { ContextSourcesPort } from "../ports/context-sources.ts";
import type { GovernancePort } from "../ports/governance.ts";
import type { IdentityPort } from "../ports/identity.ts";
export class GovernedContextSources {
  private readonly identity: IdentityPort;
  private readonly governance: GovernancePort;
  private readonly persistence: ContextSourcesPort;
  constructor(identity: IdentityPort, governance: GovernancePort, persistence: ContextSourcesPort) { this.identity=identity; this.governance=governance; this.persistence=persistence; }
  async publish(input: unknown) {
    const parsed = CatalogPublicationSchema.safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const actor = await this.identity.current();
    if (!actor) throw new FoundationError("AUTHENTICATION_REQUIRED");
    await this.governance.validate(actor.identityId, publicationIntent(parsed.data));
    return GovernedCatalogSchema.parse(await this.persistence.publish(actor.identityId, parsed.data));
  }
  async read(input: unknown) {
    const parsed = CatalogReadSchema.safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const actor = await this.identity.current();
    if (!actor) throw new FoundationError("AUTHENTICATION_REQUIRED");
    return (await this.persistence.read(actor.identityId, parsed.data)).map(r => GovernedCatalogSchema.parse(r));
  }
}
