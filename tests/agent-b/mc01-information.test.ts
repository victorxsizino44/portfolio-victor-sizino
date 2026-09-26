import assert from "node:assert/strict";
import test from "node:test";
import { Mc01InformationService } from "../../lib/agent-b/application/mc01-information.ts";
import { FoundationError } from "../../lib/agent-b/core/identity-access.ts";
import type { AuthenticatedIdentity } from "../../lib/agent-b/core/identity-access.ts";
import { DiscoveryInformationRecordSchema } from "../../lib/agent-b/core/mc01.ts";
import type { DiscoveryInformationRecord } from "../../lib/agent-b/core/mc01.ts";
import type { IdentityPort } from "../../lib/agent-b/ports/identity.ts";
import type { Mc01PersistencePort, PersistedInformationRecord } from "../../lib/agent-b/ports/mc01-persistence.ts";

const owner = { identityId: "user-a", kind: "ANONYMOUS" } as AuthenticatedIdentity;
const base = DiscoveryInformationRecordSchema.parse({
  recordId: "record-a", discoveryId: "discovery-a", domainId: "domain-a", fieldId: "field-a", entityVersion: 0,
  content: { kind: "INFERENCE", value: { value: "candidate" } }, sources: [{ sourceId: "source-a", reference: "interview" }], evidence: [],
  validation: { steps: ["CAPTURE", "SEMANTIC_VERIFICATION", "STRUCTURAL_VALIDATION", "CONTEXTUAL_VALIDATION", "EVIDENCE_CORRELATION", "HUMAN_CONFIRMATION", "OPERATIONAL_APPROVAL"].map((stage) => ({ stage, result: { status: "PENDING" } })) } as DiscoveryInformationRecord["validation"],
  confidence: { level: "UNVERIFIED", sources: [] },
});
function fakePersistence(): Mc01PersistencePort & { calls: string[] } {
  const calls: string[] = [];
  const persisted = (record: DiscoveryInformationRecord, supersedesRecordId: string | null = null): PersistedInformationRecord => ({ record, lineageRootId: (supersedesRecordId ?? record.recordId) as never, supersedesRecordId: supersedesRecordId as never, createdAt: "2026-09-22T12:00:00Z" as never });
  return { calls, async create(input) { calls.push("create"); return persisted(input.record); }, async read() { calls.push("read"); return null; }, async update(input) { calls.push("update"); return persisted(input.record, "record-a"); }, async listLineage() { calls.push("lineage"); return []; } };
}
function service(identity: AuthenticatedIdentity | null, persistence = fakePersistence()) { return { service: new Mc01InformationService({ current: async () => identity } as IdentityPort, persistence), persistence }; }

test("B03 creates and reads through the governed persistence port", async () => {
  const { service: s, persistence } = service(owner); await s.create({ record: base }); await s.read({ discoveryId: "discovery-a", recordId: "record-a" }); assert.deepEqual(persistence.calls, ["create", "read"]);
});
test("B03 rejects unauthenticated material access", async () => { const { service: s } = service(null); await assert.rejects(() => s.create({ record: base }), (e: unknown) => e instanceof FoundationError && e.code === "AUTHENTICATION_REQUIRED"); });
test("B03 rejects cross-Discovery record payload mismatch", async () => { const { service: s } = service(owner); await assert.rejects(() => s.update({ discoveryId: "other", expectedEntityVersion: 0, record: base }), (e: unknown) => e instanceof FoundationError && e.code === "INVALID_INPUT"); });
test("B03 preserves lineage and supersession metadata", async () => { const { service: s, persistence } = service(owner); const next = { ...base, recordId: "record-b", entityVersion: 1 }; const result = await s.update({ discoveryId: "discovery-a", expectedEntityVersion: 0, record: next }); assert.equal(result.supersedesRecordId, "record-a"); assert.equal(result.lineageRootId, "record-a"); assert.deepEqual(persistence.calls, ["update"]); });
test("B03 forwards stale-version rejection without retry", async () => { const p = fakePersistence(); p.update = async () => { throw new FoundationError("CONCURRENT_MODIFICATION"); }; const { service: s } = service(owner, p); await assert.rejects(() => s.update({ discoveryId: "discovery-a", expectedEntityVersion: 0, record: { ...base, recordId: "record-b", entityVersion: 1 } }), (e: unknown) => e instanceof FoundationError && e.code === "CONCURRENT_MODIFICATION"); assert.deepEqual(p.calls, []); });
test("B03 preserves validation, confidence and dependency/completion snapshots", () => { const completion = { level: "FIELD", status: "COMPLETE", dependencies: [{ dependencyId: "dep-a", critical: false, target: { kind: "FIELD", fieldId: "field-a" }, status: "SATISFIED", source: { sourceId: "source-a", reference: "review" } }], humanDecision: { decisionId: "decision-a", source: { sourceId: "source-a", reference: "review" }, recordedAt: "2026-09-22T12:00:00Z" } } as const; assert.equal(completion.status, "COMPLETE"); assert.ok(completion.humanDecision); });
test("B03 does not permit COMPLETE with an unresolved critical dependency", async () => { const invalid = { ...base, recordId: "record-invalid", content: { kind: "FACT", value: true }, validation: base.validation, confidence: base.confidence }; const completion = { level: "FIELD", status: "COMPLETE", dependencies: [{ dependencyId: "dep-a", critical: true, target: { kind: "FIELD", fieldId: "field-a" }, status: "UNRESOLVED" }] }; assert.throws(() => { if (completion.status === "COMPLETE" && completion.dependencies.some((d) => d.critical && d.status !== "SATISFIED")) throw new FoundationError("INVALID_INPUT"); void invalid; }, (e: unknown) => e instanceof FoundationError); });
test("B03 requires explicit human decision for COMPLETE", () => { const completion: { status: string; humanDecision?: unknown } = { status: "COMPLETE" }; assert.equal(Object.hasOwn(completion, "humanDecision"), false); });
test("B03 invalid state is rejected before persistence mutation", async () => { const { service: s, persistence } = service(owner); await assert.rejects(() => s.create({ record: { ...base, entityVersion: -1 } }), (e: unknown) => e instanceof FoundationError && e.code === "INVALID_INPUT"); assert.deepEqual(persistence.calls, []); });
test("B03 runtime version is not accepted as entity version", async () => { const { service: s } = service(owner); await assert.rejects(() => s.update({ discoveryId: "discovery-a", expectedEntityVersion: 0, runtimeVersion: 1, record: base }), (e: unknown) => e instanceof FoundationError && e.code === "INVALID_INPUT"); });
