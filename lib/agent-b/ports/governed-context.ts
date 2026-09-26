import { domainBoundShape, validDomainBinding } from "../core/domain-binding.ts";
import { z } from "zod";
import { DiscoveryRuntimeSchema, SessionSchema } from "../core/mc04.ts";
import { DiscoveryInformationRecordSchema, DependencyContractSchema } from "../core/mc01.ts";
import { DemandClassificationContractSchema, DiscoveryScopeContractSchema, ApplicabilitySchema } from "../core/mc02.ts";
import { DiscoveryIdSchema, SessionIdSchema } from "../core/primitives.ts";
import { GovernedCatalogSchema } from "../core/context-sources.ts";

export const ContextRequestSchema = z.strictObject({ discoveryId: DiscoveryIdSchema, sessionId: SessionIdSchema });
// Read projections, never a write API or a catalog/decision authoring authority.
// null means the repository cannot supply a trustworthy governed source.
export const GovernedContextSnapshotSchema = z.strictObject({
  runtime: DiscoveryRuntimeSchema.nullable(),
  session: SessionSchema.nullable(),
  information: z.array(DiscoveryInformationRecordSchema),
  classification: DemandClassificationContractSchema.nullable(),
  scope: DiscoveryScopeContractSchema.nullable(),
  catalog: z.strictObject({
    complete: z.boolean(),
    fields: z.array(z.strictObject({ fieldId: z.string().min(1), ...domainBoundShape, domainId: z.string().min(1).optional(), required: z.boolean(), applicability: ApplicabilitySchema }).refine(validDomainBinding)),
  }).nullable(),
  dependencies: z.array(z.strictObject({ contract: DependencyContractSchema, applicability: ApplicabilitySchema })).nullable(),
});
export type GovernedContextSnapshot = z.infer<typeof GovernedContextSnapshotSchema>;
// Physical boundary accepts definitions, never caller-authored applicability.
export const PersistedContextSnapshotSchema = GovernedContextSnapshotSchema.omit({ catalog: true, dependencies: true }).extend({
  catalog: GovernedCatalogSchema.nullable(), dependencies: GovernedCatalogSchema.nullable(),
}).refine(v => (!v.catalog || v.catalog.kind === "FIELD_CATALOG") && (!v.dependencies || v.dependencies.kind === "DEPENDENCY_CATALOG"));
export type ContextRequest = z.infer<typeof ContextRequestSchema>;
export interface GovernedContextReadPort {
  // One consistent, authorized database snapshot. No latest-as-current fallback.
  read(identityId: string, request: ContextRequest): Promise<GovernedContextSnapshot>;
}
