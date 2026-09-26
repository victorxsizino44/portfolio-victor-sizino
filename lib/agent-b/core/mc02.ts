import { z } from "zod";
import { DiscoveryIdSchema, EntityVersionSchema, ScopeSegmentIdSchema, SpecializationIdSchema } from "./primitives.ts";

export const UnderstandingStateSchema = z.enum(["UNDERSTOOD", "PARTIALLY_UNDERSTOOD", "AMBIGUOUS", "CONFLICTING"]);
export const DemandClassificationContractSchema = z.strictObject({
  discoveryId: DiscoveryIdSchema,
  entityVersion: EntityVersionSchema,
  understandingState: UnderstandingStateSchema,
  // No closed nature taxonomy was supplied; multiple declared natures may coexist.
  primaryNature: z.array(z.string().min(1)).min(1).optional(),
});
export type DemandClassificationContract = z.infer<typeof DemandClassificationContractSchema>;

export const ApplicabilitySchema = z.enum(["APPLICABLE", "CANDIDATE", "EXCLUDED", "UNRESOLVED"]);
export const ScopeBoundarySchema = z.enum(["INCLUDED", "EXCLUDED", "DEFERRED", "CONDITIONAL"]);
const scopeBase = {
  discoveryId: DiscoveryIdSchema,
  entityVersion: EntityVersionSchema,
};
const scopeSegment = z.strictObject({
  segmentId: ScopeSegmentIdSchema,
  applicability: ApplicabilitySchema,
  boundary: ScopeBoundarySchema,
});
export const DiscoveryScopeContractSchema = z.discriminatedUnion("kind", [
  z.strictObject({ ...scopeBase, kind: z.literal("ONE_DISCOVERY"), applicability: ApplicabilitySchema, boundary: ScopeBoundarySchema }),
  z.strictObject({ ...scopeBase, kind: z.literal("SCOPED_SEGMENTS"), segments: z.array(scopeSegment).min(1) }),
]);
export type DiscoveryScopeContract = z.infer<typeof DiscoveryScopeContractSchema>;

export const SpecializationResolutionStatusSchema = z.enum([
  "CORE_SUFFICIENT", "EXISTING_SPECIALIZATION_APPLICABLE",
  "SPECIALIZATION_CANDIDATE", "SPECIALIZATION_UNRESOLVED",
]);
export const SpecializationResolutionContractSchema = z.discriminatedUnion("status", [
  z.strictObject({ ...scopeBase, status: z.literal("CORE_SUFFICIENT") }),
  z.strictObject({ ...scopeBase, status: z.literal("EXISTING_SPECIALIZATION_APPLICABLE"), specializationId: SpecializationIdSchema }),
  z.strictObject({ ...scopeBase, status: z.literal("SPECIALIZATION_CANDIDATE"), candidate: z.string().min(1).optional() }),
  z.strictObject({ ...scopeBase, status: z.literal("SPECIALIZATION_UNRESOLVED") }),
]);
export type SpecializationResolutionContract = z.infer<typeof SpecializationResolutionContractSchema>;
