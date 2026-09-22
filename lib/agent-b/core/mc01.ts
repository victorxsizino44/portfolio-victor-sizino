import { z } from "zod";
import {
  DependencyIdSchema, DiscoveryIdSchema, DomainIdSchema, EntityVersionSchema,
  EvidenceIdSchema, FieldIdSchema, HumanDecisionReferenceSchema,
  InformationRecordIdSchema, SourceReferenceSchema, TimestampSchema,
} from "./primitives.ts";

// Ordered vocabulary only. Parsing never executes or advances this pipeline.
export const VALIDATION_PIPELINE = [
  "CAPTURE", "SEMANTIC_VERIFICATION", "STRUCTURAL_VALIDATION",
  "CONTEXTUAL_VALIDATION", "EVIDENCE_CORRELATION", "HUMAN_CONFIRMATION",
  "OPERATIONAL_APPROVAL",
] as const;
export const ValidationStageSchema = z.enum(VALIDATION_PIPELINE);
export type ValidationStage = z.infer<typeof ValidationStageSchema>;

const assessment = {
  source: SourceReferenceSchema,
  recordedAt: TimestampSchema,
};
const validationResult = z.discriminatedUnion("status", [
  z.strictObject({ status: z.literal("PENDING") }),
  z.strictObject({ status: z.literal("PASSED"), ...assessment }),
  z.strictObject({ status: z.literal("FAILED"), ...assessment }),
]);
const humanValidationResult = z.discriminatedUnion("status", [
  z.strictObject({ status: z.literal("PENDING") }),
  z.strictObject({ status: z.literal("PASSED"), decision: HumanDecisionReferenceSchema }),
  z.strictObject({ status: z.literal("FAILED"), decision: HumanDecisionReferenceSchema }),
]);
function stage<const T extends ValidationStage>(name: T) {
  return z.strictObject({ stage: z.literal(name), result: validationResult });
}
export const ValidationContractSchema = z.strictObject({
  steps: z.tuple([
    stage("CAPTURE"), stage("SEMANTIC_VERIFICATION"), stage("STRUCTURAL_VALIDATION"),
    stage("CONTEXTUAL_VALIDATION"), stage("EVIDENCE_CORRELATION"),
    z.strictObject({ stage: z.literal("HUMAN_CONFIRMATION"), result: humanValidationResult }),
    z.strictObject({ stage: z.literal("OPERATIONAL_APPROVAL"), result: humanValidationResult }),
  ]),
});
export type ValidationContract = z.infer<typeof ValidationContractSchema>;

export const CONFIDENCE_LIFECYCLE = [
  "UNVERIFIED", "PLAUSIBLE", "SUPPORTED", "VERIFIED", "CONSTITUTIONAL",
] as const;
export const ConfidenceLevelSchema = z.enum(CONFIDENCE_LIFECYCLE);
export const ConfidenceContractSchema = z.strictObject({
  level: ConfidenceLevelSchema,
  sources: z.array(SourceReferenceSchema),
  rationale: z.string().min(1).optional(),
});
export type ConfidenceContract = z.infer<typeof ConfidenceContractSchema>;

const dependencyTarget = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("FIELD"), fieldId: FieldIdSchema }),
  z.strictObject({ kind: z.literal("DOMAIN"), domainId: DomainIdSchema }),
  z.strictObject({ kind: z.literal("DISCOVERY"), discoveryId: DiscoveryIdSchema }),
]);
const dependencyBase = {
  dependencyId: DependencyIdSchema,
  critical: z.boolean(),
  target: dependencyTarget,
};
export const DependencyContractSchema = z.discriminatedUnion("status", [
  z.strictObject({ ...dependencyBase, status: z.literal("MISSING") }),
  z.strictObject({ ...dependencyBase, status: z.literal("UNRESOLVED") }),
  z.strictObject({ ...dependencyBase, status: z.literal("SATISFIED"), source: SourceReferenceSchema }),
]);
export type DependencyContract = z.infer<typeof DependencyContractSchema>;

export const COMPLETION_LIFECYCLE = ["INCOMPLETE", "PARTIAL", "READY_FOR_REVIEW", "COMPLETE"] as const;
export const CompletionStatusSchema = z.enum(COMPLETION_LIFECYCLE);
export const COMPLETION_HIERARCHY = ["FIELD", "DOMAIN", "DISCOVERY_READINESS", "HUMAN_REVIEW", "BRIEFING"] as const;
export const CompletionLevelSchema = z.enum(COMPLETION_HIERARCHY);
const completionBase = {
  level: CompletionLevelSchema,
  dependencies: z.array(DependencyContractSchema),
};
export const CompletionContractSchema = z.discriminatedUnion("status", [
  z.strictObject({ ...completionBase, status: z.literal("INCOMPLETE") }),
  z.strictObject({ ...completionBase, status: z.literal("PARTIAL") }),
  z.strictObject({ ...completionBase, status: z.literal("READY_FOR_REVIEW") }),
  z.strictObject({
    ...completionBase, status: z.literal("COMPLETE"),
    humanDecision: HumanDecisionReferenceSchema,
  }),
]).superRefine((completion, context) => {
  // Snapshot consistency only; no readiness computation or governance decision.
  if (completion.status === "COMPLETE") {
    completion.dependencies.forEach((dependency, index) => {
      if (dependency.critical && dependency.status !== "SATISFIED") {
        context.addIssue({ code: "custom", path: ["dependencies", index], message: "A critical dependency remains unresolved." });
      }
    });
  }
});
export type CompletionContract = z.infer<typeof CompletionContractSchema>;

// Received and validated evidence references are distinct declarations, not an
// evidence pipeline. A schema cannot verify the referenced validation itself.
export const EvidenceReferenceSchema = z.discriminatedUnion("status", [
  z.strictObject({ status: z.literal("RECEIVED"), evidenceId: EvidenceIdSchema, source: SourceReferenceSchema }),
  z.strictObject({
    status: z.literal("VALIDATED"), evidenceId: EvidenceIdSchema,
    source: SourceReferenceSchema, validationSource: SourceReferenceSchema,
  }),
]);
export type EvidenceReference = z.infer<typeof EvidenceReferenceSchema>;
export const InformationContentSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("STATEMENT"), value: z.json() }),
  z.strictObject({ kind: z.literal("INFERENCE"), value: z.json() }),
  z.strictObject({ kind: z.literal("FACT"), value: z.json() }),
]);
export const DiscoveryInformationRecordSchema = z.strictObject({
  recordId: InformationRecordIdSchema,
  discoveryId: DiscoveryIdSchema,
  domainId: DomainIdSchema,
  fieldId: FieldIdSchema,
  entityVersion: EntityVersionSchema,
  content: InformationContentSchema,
  sources: z.array(SourceReferenceSchema),
  evidence: z.array(EvidenceReferenceSchema),
  validation: ValidationContractSchema,
  confidence: ConfidenceContractSchema,
});
export type DiscoveryInformationRecord = z.infer<typeof DiscoveryInformationRecordSchema>;

export const FieldContractSchema = z.strictObject({
  fieldId: FieldIdSchema,
  domainId: DomainIdSchema,
  entityVersion: EntityVersionSchema,
  informationRecordIds: z.array(InformationRecordIdSchema),
  completion: CompletionContractSchema.refine((value) => value.level === "FIELD", "Expected field completion."),
});
export type FieldContract = z.infer<typeof FieldContractSchema>;
export const DomainContractSchema = z.strictObject({
  domainId: DomainIdSchema,
  discoveryId: DiscoveryIdSchema,
  entityVersion: EntityVersionSchema,
  fieldIds: z.array(FieldIdSchema),
  completion: CompletionContractSchema.refine((value) => value.level === "DOMAIN", "Expected domain completion."),
});
export type DomainContract = z.infer<typeof DomainContractSchema>;
