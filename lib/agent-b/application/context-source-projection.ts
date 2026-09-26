import { bindingOf } from "../core/domain-binding.ts";
import { PersistedContextSnapshotSchema, GovernedContextSnapshotSchema } from "../ports/governed-context.ts";
import { composeApplicability } from "../core/context-sources.ts";
import { FoundationError } from "../core/identity-access.ts";

export function projectContextSources(input: unknown, discoveryId: string) {
  const s = PersistedContextSnapshotSchema.parse(input);
  if ([s.runtime, s.session, s.scope, s.catalog, s.dependencies].some(v => v && v.discoveryId !== discoveryId)) throw new FoundationError("ACCESS_DENIED");
  const valid = !!s.runtime && s.runtime.freshness === "CURRENT" && !!s.session && s.session.lifecycle === "OPEN" &&
    s.runtime.current.sessionId === s.session.sessionId && !!s.scope && s.runtime.current.scopeVersion === s.scope.entityVersion;
  const fields = s.catalog?.kind === "FIELD_CATALOG" ? s.catalog : null;
  const dependencies = s.dependencies?.kind === "DEPENDENCY_CATALOG" ? s.dependencies : null;
  return GovernedContextSnapshotSchema.parse({ ...s,
    catalog: fields ? { complete: fields.completeness === "COMPLETE", fields: fields.definitions.map(d => ({
      fieldId: d.fieldId, domainBinding: bindingOf(d.contract), required: d.requirement === "REQUIRED", applicability: composeApplicability(d.scopeBinding, s.scope, valid),
    })) } : null,
    dependencies: dependencies ? dependencies.definitions.map(d => ({ contract: d.contract, applicability: composeApplicability(d.scopeBinding, s.scope, valid) })) : null,
  });
}
