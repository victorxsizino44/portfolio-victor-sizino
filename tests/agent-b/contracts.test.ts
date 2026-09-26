import assert from "node:assert/strict";
import { test } from "node:test";
import type { z } from "zod";
import {
  DiscoveryIdSchema, SessionIdSchema, EntityVersionSchema, RuntimeVersionSchema,
  TimestampSchema, SourceReferenceSchema, HumanDecisionReferenceSchema,
} from "../../lib/agent-b/core/primitives.ts";
import {
  VALIDATION_PIPELINE, ValidationStageSchema, ValidationContractSchema,
  ConfidenceLevelSchema, ConfidenceContractSchema, DependencyContractSchema,
  CompletionStatusSchema, CompletionLevelSchema, CompletionContractSchema,
  DiscoveryInformationRecordSchema, FieldContractSchema, DomainContractSchema,
  EvidenceReferenceSchema, InformationContentSchema,
} from "../../lib/agent-b/core/mc01.ts";
import {
  UnderstandingStateSchema, DemandClassificationContractSchema,
  ApplicabilitySchema, ScopeBoundarySchema, DiscoveryScopeContractSchema,
  SpecializationResolutionStatusSchema, SpecializationResolutionContractSchema,
} from "../../lib/agent-b/core/mc02.ts";
import {
  SessionLifecycleSchema, RuntimeFreshnessSchema, PendingLifecycleSchema,
} from "../../lib/agent-b/core/runtime-primitives.ts";

const source = { sourceId: "source-1", reference: "reference-1" };
const timestamp = "2026-09-21T12:00:00-03:00";
const decision = { decisionId: "decision-1", source, recordedAt: timestamp };
const versionedDiscovery = { discoveryId: "discovery-1", entityVersion: 0 };
const validation = () => ({ steps: VALIDATION_PIPELINE.map((stage) => ({ stage, result: { status: "PENDING" } })) });
const confidence = { level: "UNVERIFIED", sources: [] };
const completion = (level: string) => ({ level, status: "INCOMPLETE", dependencies: [] });
const missingDependency = {
  dependencyId: "dependency-1", critical: true,
  target: { kind: "FIELD", fieldId: "field-2" }, status: "MISSING",
};
const record = () => ({
  ...versionedDiscovery, recordId: "record-1", domainId: "domain-1", fieldId: "field-1",
  content: { kind: "INFERENCE", value: { hypothesis: "unverified input" } },
  sources: [source], evidence: [], validation: validation(), confidence,
});

function accepts(schema: z.ZodType, input: unknown) {
  assert.equal(schema.safeParse(input).success, true);
}
function rejects(schema: z.ZodType, input: unknown) {
  assert.equal(schema.safeParse(input).success, false);
}

const vocabularies: [string, z.ZodType, readonly string[]][] = [
  ["validation stages", ValidationStageSchema, ["CAPTURE", "SEMANTIC_VERIFICATION", "STRUCTURAL_VALIDATION", "CONTEXTUAL_VALIDATION", "EVIDENCE_CORRELATION", "HUMAN_CONFIRMATION", "OPERATIONAL_APPROVAL"]],
  ["confidence", ConfidenceLevelSchema, ["UNVERIFIED", "PLAUSIBLE", "SUPPORTED", "VERIFIED", "CONSTITUTIONAL"]],
  ["completion", CompletionStatusSchema, ["INCOMPLETE", "PARTIAL", "READY_FOR_REVIEW", "COMPLETE"]],
  ["completion hierarchy", CompletionLevelSchema, ["FIELD", "DOMAIN", "DISCOVERY_READINESS", "HUMAN_REVIEW", "BRIEFING"]],
  ["understanding", UnderstandingStateSchema, ["UNDERSTOOD", "PARTIALLY_UNDERSTOOD", "AMBIGUOUS", "CONFLICTING"]],
  ["applicability", ApplicabilitySchema, ["APPLICABLE", "CANDIDATE", "EXCLUDED", "UNRESOLVED"]],
  ["scope boundary", ScopeBoundarySchema, ["INCLUDED", "EXCLUDED", "DEFERRED", "CONDITIONAL"]],
  ["specialization", SpecializationResolutionStatusSchema, ["CORE_SUFFICIENT", "EXISTING_SPECIALIZATION_APPLICABLE", "SPECIALIZATION_CANDIDATE", "SPECIALIZATION_UNRESOLVED"]],
  ["session", SessionLifecycleSchema, ["OPEN", "INTERRUPTED", "CLOSED"]],
  ["freshness", RuntimeFreshnessSchema, ["CURRENT", "REEVALUATION_REQUIRED", "HISTORICAL"]],
  ["pending", PendingLifecycleSchema, ["PENDING", "RESOLVED", "SUPERSEDED"]],
];
for (const [name, schema, states] of vocabularies) {
  test(`B01 ${name} vocabulary accepts approved states and rejects unknown states`, () => {
    states.forEach((state) => accepts(schema, state));
    for (const invalid of ["AUTO_APPROVED", "", "complete", null, undefined, 1, {}]) rejects(schema, invalid);
    const declared = schema as z.ZodEnum;
    assert.deepEqual(declared.options, states);
  });
}

test("B01 identifiers remain opaque and reject absent or blank values", () => {
  for (const schema of [DiscoveryIdSchema, SessionIdSchema]) {
    accepts(schema, "external:opaque/id");
    for (const invalid of ["", "   ", null, undefined, 3, {}]) rejects(schema, invalid);
  }
});

test("B01 versions accept only nonnegative safe integer representations without coercion", () => {
  for (const schema of [EntityVersionSchema, RuntimeVersionSchema]) {
    accepts(schema, 0);
    accepts(schema, 7);
    for (const invalid of [-1, 0.5, "1", null, Infinity, Number.MAX_SAFE_INTEGER + 1]) rejects(schema, invalid);
  }
});

test("B01 timestamps require a valid ISO timestamp with timezone", () => {
  accepts(TimestampSchema, timestamp);
  accepts(TimestampSchema, "2026-09-21T15:00:00Z");
  for (const invalid of ["2026-09-21", "2026-09-21T15:00:00", "2026-02-30T15:00:00Z", 0, null]) rejects(TimestampSchema, invalid);
});

test("B01 optional source timestamp is absent unless supplied and does not default", () => {
  assert.deepEqual(SourceReferenceSchema.parse(source), source);
  accepts(SourceReferenceSchema, { ...source, recordedAt: timestamp });
  rejects(SourceReferenceSchema, { ...source, recordedAt: null });
  rejects(SourceReferenceSchema, { ...source, authority: true });
});

test("B01 human decision references require explicit identifier, source and timestamp", () => {
  accepts(HumanDecisionReferenceSchema, decision);
  rejects(HumanDecisionReferenceSchema, { decisionId: "decision-1" });
  rejects(HumanDecisionReferenceSchema, { ...decision, authorized: true });
});

const canonicalContracts: [string, z.ZodType, () => unknown][] = [
  ["DiscoveryInformationRecord", DiscoveryInformationRecordSchema, record],
  ["FieldContract", FieldContractSchema, () => ({ fieldId: "field-1", domainId: "domain-1", entityVersion: 0, informationRecordIds: [], completion: completion("FIELD") })],
  ["DomainContract", DomainContractSchema, () => ({ ...versionedDiscovery, domainId: "domain-1", fieldIds: [], completion: completion("DOMAIN") })],
  ["ValidationContract", ValidationContractSchema, validation],
  ["ConfidenceContract", ConfidenceContractSchema, () => confidence],
  ["DependencyContract", DependencyContractSchema, () => missingDependency],
  ["CompletionContract", CompletionContractSchema, () => completion("DISCOVERY_READINESS")],
];
for (const [name, schema, fixture] of canonicalContracts) {
  test(`B01 ${name} accepts a structural snapshot and rejects malformed input`, () => {
    const input: unknown = fixture();
    accepts(schema, input);
    for (const invalid of [null, undefined, "invalid", [], {}]) rejects(schema, invalid);
    const withAuthority = Object.assign({}, input, { semanticAuthority: true });
    rejects(schema, withAuthority);
  });
}

test("B01 validation tuple preserves pipeline order and requires every stage", () => {
  const reversed = validation();
  reversed.steps.reverse();
  rejects(ValidationContractSchema, reversed);
  rejects(ValidationContractSchema, { steps: validation().steps.slice(0, -1) });
  rejects(ValidationContractSchema, { steps: [...validation().steps, validation().steps[0]] });
});

test("B01 recorded validation outcomes require references; human outcomes require decisions", () => {
  const base = validation().steps;
  const capture = { stage: "CAPTURE", result: { status: "PASSED", source, recordedAt: timestamp } };
  accepts(ValidationContractSchema, { steps: [capture, ...base.slice(1)] });
  rejects(ValidationContractSchema, { steps: [{ stage: "CAPTURE", result: { status: "PASSED" } }, ...base.slice(1)] });
  for (const index of [5, 6]) {
    const humanStage = base[index].stage;
    const steps: unknown[] = [...base];
    steps[index] = { stage: humanStage, result: { status: "PASSED", source, recordedAt: timestamp } };
    rejects(ValidationContractSchema, { steps });
    steps[index] = { stage: humanStage, result: { status: "PASSED", decision } };
    accepts(ValidationContractSchema, { steps });
  }
});

test("B01 structural parsing does not perform semantic verification or advance stages", () => {
  const input: unknown = record();
  const result = DiscoveryInformationRecordSchema.parse(input);
  assert.deepEqual(result, input);
  assert.equal(result.content.kind, "INFERENCE");
  assert.ok(result.validation.steps.every((step) => step.result.status === "PENDING"));
  assert.equal(result.confidence.level, "UNVERIFIED");
});

test("B01 highest confidence does not convert inference to fact or establish completion", () => {
  const input = { ...record(), confidence: { level: "CONSTITUTIONAL", sources: [source] } };
  const parsed = DiscoveryInformationRecordSchema.parse(input);
  assert.equal(parsed.content.kind, "INFERENCE");
  assert.equal("completion" in parsed, false);
  rejects(ConfidenceContractSchema, { ...input.confidence, truth: true });
  rejects(ConfidenceContractSchema, { ...input.confidence, humanDecision: decision });
});

test("B01 information kind is explicit and values preserve JSON null versus omission", () => {
  for (const kind of ["STATEMENT", "INFERENCE", "FACT"]) {
    accepts(InformationContentSchema, { kind, value: null });
    rejects(InformationContentSchema, { kind });
  }
  rejects(InformationContentSchema, { kind: "EVIDENCE", value: "statement" });
  rejects(InformationContentSchema, { kind: "FACT", value: () => "not JSON" });
});

test("B01 statements are not evidence and evidence receipt is not validation", () => {
  rejects(EvidenceReferenceSchema, { kind: "STATEMENT", value: "claim" });
  const received = { status: "RECEIVED", evidenceId: "evidence-1", source };
  assert.deepEqual(EvidenceReferenceSchema.parse(received), received);
  rejects(EvidenceReferenceSchema, { ...received, status: "VALIDATED" });
  accepts(EvidenceReferenceSchema, { ...received, status: "VALIDATED", validationSource: source });
  rejects(EvidenceReferenceSchema, { ...received, validationSource: source });
});

test("B01 missing critical dependencies remain explicit without automatic progression", () => {
  const input = { ...completion("DISCOVERY_READINESS"), dependencies: [missingDependency] };
  assert.deepEqual(CompletionContractSchema.parse(input), input);
  assert.deepEqual(DependencyContractSchema.parse(missingDependency), missingDependency);
  rejects(DependencyContractSchema, { ...missingDependency, status: "SATISFIED" });
});

test("B01 COMPLETE requires human decision at every completion level", () => {
  for (const level of CompletionLevelSchema.options) {
    const input = { ...completion(level), status: "COMPLETE" };
    rejects(CompletionContractSchema, input);
    rejects(CompletionContractSchema, { ...input, humanDecision: true });
    accepts(CompletionContractSchema, { ...input, humanDecision: decision });
  }
});

test("B01 COMPLETE cannot coexist with a declared unresolved critical dependency", () => {
  const input = { ...completion("BRIEFING"), status: "COMPLETE", humanDecision: decision };
  for (const status of ["MISSING", "UNRESOLVED"]) {
    rejects(CompletionContractSchema, { ...input, dependencies: [{ ...missingDependency, status }] });
  }
  accepts(CompletionContractSchema, { ...input, dependencies: [{ ...missingDependency, status: "SATISFIED", source }] });
});

test("B01 review readiness does not become human approval", () => {
  const input = { ...completion("HUMAN_REVIEW"), status: "READY_FOR_REVIEW" };
  assert.deepEqual(CompletionContractSchema.parse(input), input);
  rejects(CompletionContractSchema, { ...input, approved: true });
});

test("B01 field and domain completion levels cannot be interchanged", () => {
  rejects(FieldContractSchema, { fieldId: "field-1", domainId: "domain-1", entityVersion: 0, informationRecordIds: [], completion: completion("DOMAIN") });
  rejects(DomainContractSchema, { ...versionedDiscovery, domainId: "domain-1", fieldIds: [], completion: completion("FIELD") });
});

test("B01 primaryNature remains optional and permits multiple nonexclusive natures", () => {
  const input = { ...versionedDiscovery, understandingState: "AMBIGUOUS" };
  assert.deepEqual(DemandClassificationContractSchema.parse(input), input);
  accepts(DemandClassificationContractSchema, { ...input, primaryNature: ["product", "service"] });
  for (const primaryNature of [null, "product", [], [""]]) rejects(DemandClassificationContractSchema, { ...input, primaryNature });
  rejects(DemandClassificationContractSchema, { ...input, understandingState: "APPROVED" });
});

test("B01 scope represents one discovery or segments within one discovery", () => {
  accepts(DiscoveryScopeContractSchema, { ...versionedDiscovery, kind: "ONE_DISCOVERY", applicability: "UNRESOLVED", boundary: "CONDITIONAL" });
  accepts(DiscoveryScopeContractSchema, {
    ...versionedDiscovery, kind: "SCOPED_SEGMENTS", segments: [
      { segmentId: "segment-1", applicability: "APPLICABLE", boundary: "INCLUDED" },
      { segmentId: "segment-2", applicability: "CANDIDATE", boundary: "DEFERRED" },
    ],
  });
  rejects(DiscoveryScopeContractSchema, { ...versionedDiscovery, kind: "SCOPED_SEGMENTS", segments: [] });
  rejects(DiscoveryScopeContractSchema, { ...versionedDiscovery, kind: "ONE_DISCOVERY", applicability: "INCLUDED", boundary: "APPLICABLE" });
  rejects(DiscoveryScopeContractSchema, { ...versionedDiscovery, kind: "SCOPED_SEGMENTS", segments: [{ segmentId: "segment-1", discoveryId: "other", applicability: "APPLICABLE", boundary: "INCLUDED" }] });
});

test("B01 specialization alternatives remain distinct without resolving candidates", () => {
  for (const status of ["CORE_SUFFICIENT", "SPECIALIZATION_CANDIDATE", "SPECIALIZATION_UNRESOLVED"]) {
    const input = { ...versionedDiscovery, status };
    assert.deepEqual(SpecializationResolutionContractSchema.parse(input), input);
  }
  const existing = { ...versionedDiscovery, status: "EXISTING_SPECIALIZATION_APPLICABLE" };
  rejects(SpecializationResolutionContractSchema, existing);
  accepts(SpecializationResolutionContractSchema, { ...existing, specializationId: "specialization-1" });
  rejects(SpecializationResolutionContractSchema, { ...existing, status: "CORE_SUFFICIENT", specializationId: "specialization-1" });
});

test("B01 runtime vocabularies do not accept another lifecycle or resume as a state", () => {
  rejects(SessionLifecycleSchema, "CURRENT");
  rejects(RuntimeFreshnessSchema, "OPEN");
  rejects(PendingLifecycleSchema, "CLOSED");
  for (const schema of [SessionLifecycleSchema, RuntimeFreshnessSchema, PendingLifecycleSchema]) rejects(schema, "RESUME");
});
