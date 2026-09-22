import { z } from "zod";

// Opaque external identifiers: no UUID format, generation or persistence policy.
const opaqueId = z.string().min(1).refine((value) => value.trim().length > 0);
export const DiscoveryIdSchema = opaqueId.brand<"DiscoveryId">();
export const SessionIdSchema = opaqueId.brand<"SessionId">();
export const InformationRecordIdSchema = opaqueId.brand<"InformationRecordId">();
export const FieldIdSchema = opaqueId.brand<"FieldId">();
export const DomainIdSchema = opaqueId.brand<"DomainId">();
export const DependencyIdSchema = opaqueId.brand<"DependencyId">();
export const SourceIdSchema = opaqueId.brand<"SourceId">();
export const EvidenceIdSchema = opaqueId.brand<"EvidenceId">();
export const HumanDecisionIdSchema = opaqueId.brand<"HumanDecisionId">();
export const ScopeSegmentIdSchema = opaqueId.brand<"ScopeSegmentId">();
export const SpecializationIdSchema = opaqueId.brand<"SpecializationId">();

export type DiscoveryId = z.infer<typeof DiscoveryIdSchema>;
export type SessionId = z.infer<typeof SessionIdSchema>;
export type InformationRecordId = z.infer<typeof InformationRecordIdSchema>;
export type FieldId = z.infer<typeof FieldIdSchema>;
export type DomainId = z.infer<typeof DomainIdSchema>;
export type DependencyId = z.infer<typeof DependencyIdSchema>;
export type SourceId = z.infer<typeof SourceIdSchema>;
export type EvidenceId = z.infer<typeof EvidenceIdSchema>;
export type HumanDecisionId = z.infer<typeof HumanDecisionIdSchema>;
export type ScopeSegmentId = z.infer<typeof ScopeSegmentIdSchema>;
export type SpecializationId = z.infer<typeof SpecializationIdSchema>;

// Separate counters, not ordering, migration or concurrency implementations.
export const EntityVersionSchema = z.int().nonnegative().brand<"EntityVersion">();
export const RuntimeVersionSchema = z.int().nonnegative().brand<"RuntimeVersion">();
export type EntityVersion = z.infer<typeof EntityVersionSchema>;
export type RuntimeVersion = z.infer<typeof RuntimeVersionSchema>;
export const TimestampSchema = z.iso.datetime({ offset: true }).brand<"Timestamp">();
export type Timestamp = z.infer<typeof TimestampSchema>;

export const SourceReferenceSchema = z.strictObject({
  sourceId: SourceIdSchema,
  reference: z.string().min(1),
  recordedAt: TimestampSchema.optional(),
});
export type SourceReference = z.infer<typeof SourceReferenceSchema>;

// A reference to a decision, never proof of identity, authority or authorization.
export const HumanDecisionReferenceSchema = z.strictObject({
  decisionId: HumanDecisionIdSchema,
  source: SourceReferenceSchema,
  recordedAt: TimestampSchema,
});
export type HumanDecisionReference = z.infer<typeof HumanDecisionReferenceSchema>;
