import { z } from "zod";
import { FieldContractSchema, DependencyContractSchema } from "./mc01.ts";
import { DiscoveryIdSchema, EntityVersionSchema, HumanDecisionReferenceSchema, TimestampSchema } from "./primitives.ts";
import type { DiscoveryScopeContract } from "./mc02.ts";

const id = z.string().trim().min(1);
export const ScopeBindingSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("DISCOVERY_WIDE") }),
  z.strictObject({ kind: z.literal("SEGMENT_BOUND"), segmentIds: z.array(id).min(1).refine(v => new Set(v).size === v.length) }),
]);
export const GovernedFieldDefinitionSchema = z.strictObject({
  fieldId: id, contract: FieldContractSchema, requirement: z.enum(["REQUIRED", "OPTIONAL"]), scopeBinding: ScopeBindingSchema,
}).refine(v => v.fieldId === v.contract.fieldId, "Field identity mismatch.");
export const GovernedDependencyDefinitionSchema = z.strictObject({
  dependencyId: id, contract: DependencyContractSchema, scopeBinding: ScopeBindingSchema,
}).refine(v => v.dependencyId === v.contract.dependencyId, "Dependency identity mismatch.");
const base = { catalogId: id, discoveryId: DiscoveryIdSchema, version: EntityVersionSchema,
  status: z.literal("PUBLISHED"), predecessorVersion: EntityVersionSchema.nullable(), createdAt: TimestampSchema };
export const GovernedFieldCatalogSchema = z.strictObject({ ...base, kind: z.literal("FIELD_CATALOG"),
  completeness: z.enum(["INCOMPLETE", "COMPLETE"]), definitions: z.array(GovernedFieldDefinitionSchema),
}).refine(v => new Set(v.definitions.map(d => d.fieldId)).size === v.definitions.length, "Duplicate field.");
export const GovernedDependencyCatalogSchema = z.strictObject({ ...base, kind: z.literal("DEPENDENCY_CATALOG"),
  definitions: z.array(GovernedDependencyDefinitionSchema),
}).refine(v => new Set(v.definitions.map(d => d.dependencyId)).size === v.definitions.length, "Duplicate dependency.")
  .refine(v => v.definitions.every(d => d.contract.target.kind !== "DISCOVERY" || d.contract.target.discoveryId === v.discoveryId), "Foreign dependency target.");
export const GovernedCatalogSchema = z.discriminatedUnion("kind", [GovernedFieldCatalogSchema, GovernedDependencyCatalogSchema])
  .refine(v => v.version === 0 ? v.predecessorVersion === null : v.predecessorVersion === v.version - 1, "Invalid predecessor.");
export const CatalogPublicationSchema = z.strictObject({
  catalog: GovernedCatalogSchema, expectedVersion: EntityVersionSchema.nullable(), operationId: z.string().uuid(), decision: HumanDecisionReferenceSchema,
}).refine(v => v.expectedVersion === v.catalog.predecessorVersion && v.catalog.version === (v.expectedVersion === null ? 0 : v.expectedVersion + 1), "Invalid version.");
export const CatalogReadSchema = z.strictObject({ discoveryId: DiscoveryIdSchema, kind: z.enum(["FIELD_CATALOG", "DEPENDENCY_CATALOG"]), history: z.boolean() });
export type GovernedCatalog = z.infer<typeof GovernedCatalogSchema>;
export type CatalogPublication = z.infer<typeof CatalogPublicationSchema>;
export type CatalogRead = z.infer<typeof CatalogReadSchema>;
export function publicationIntent(input: CatalogPublication) {
  return { discoveryId: input.catalog.discoveryId, action: input.catalog.kind === "FIELD_CATALOG" ? "PUBLISH_FIELD_CATALOG" as const : "PUBLISH_DEPENDENCY_CATALOG" as const,
    targetType: input.catalog.kind, targetId: input.catalog.catalogId, targetVersion: input.catalog.version,
    outcome: "PUBLISHED", operationId: input.operationId, reference: input.decision };
}

// Addendum v0.1: this composition never changes the stored scope or binding.
export function composeApplicability(binding: z.infer<typeof ScopeBindingSchema>, scope: DiscoveryScopeContract | null, validDiscovery: boolean) {
  if (!validDiscovery || !scope) return "UNRESOLVED" as const;
  if (binding.kind === "DISCOVERY_WIDE") return "APPLICABLE" as const;
  if (scope.kind !== "SCOPED_SEGMENTS") return "UNRESOLVED" as const;
  const states = binding.segmentIds.map(id => {
    const matches = scope.segments.filter(s => s.segmentId === id);
    return matches.length === 1 ? matches[0].applicability : "UNRESOLVED";
  });
  if (states.includes("APPLICABLE")) return "APPLICABLE" as const;
  if (states.includes("UNRESOLVED")) return "UNRESOLVED" as const;
  if (states.includes("CANDIDATE")) return "CANDIDATE" as const;
  return "EXCLUDED" as const;
}
