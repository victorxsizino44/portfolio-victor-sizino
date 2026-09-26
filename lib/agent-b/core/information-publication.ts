import { z } from "zod";
import { DiscoveryInformationRecordSchema } from "./mc01.ts";
import { DiscoveryIdSchema, EntityVersionSchema, InformationRecordIdSchema, RuntimeVersionSchema, TimestampSchema } from "./primitives.ts";
import { DiscoveryRuntimeSchema } from "./mc04.ts";
import { bindingOf, validDomainBinding } from "./domain-binding.ts";
import { informationField } from "./information-cardinality.ts";

// Physical accepted-set boundary only. It neither extracts nor semantically accepts messages.
export const InformationPublicationSchema = z.strictObject({
  discoveryId: DiscoveryIdSchema, operationId: z.string().uuid(), expectedRuntimeVersion: RuntimeVersionSchema,
  capturedAt: TimestampSchema,
  candidates: z.array(z.strictObject({
    candidateId: z.string().uuid(), record: DiscoveryInformationRecordSchema,
    predecessorRecordId: InformationRecordIdSchema.nullable(), expectedEntityVersion: EntityVersionSchema.nullable(),
  })).min(1),
}).superRefine((v, ctx) => {
  const candidateIds = new Set<string>(), recordIds = new Set<string>(), predecessors = new Set<string>();
  for (const c of v.candidates) {
    if (!validDomainBinding(c.record)) {
      ctx.addIssue({ code: "custom", message: "Explicit Domain binding required" });
      continue;
    }
    const f = informationField(c.record.fieldId), b = bindingOf(c.record);
    if (!f || c.record.discoveryId !== v.discoveryId || candidateIds.has(c.candidateId) || recordIds.has(c.record.recordId) ||
      (f.domainId === null ? b.kind !== "CORE_NEUTRAL" : b.kind !== "DOMAIN" || b.domainId !== f.domainId) ||
      (c.predecessorRecordId === null ? c.expectedEntityVersion !== null || c.record.entityVersion !== 0 :
        c.expectedEntityVersion === null || c.record.entityVersion !== c.expectedEntityVersion + 1 || c.predecessorRecordId === c.record.recordId || predecessors.has(c.predecessorRecordId)) ||
      c.record.content.kind !== "STATEMENT" || c.record.confidence.level !== "UNVERIFIED" || c.record.evidence.length !== 0 ||
      c.record.validation.steps.some(s => (s.stage === "HUMAN_CONFIRMATION" || s.stage === "OPERATIONAL_APPROVAL") && s.result.status !== "PENDING")) {
      ctx.addIssue({ code: "custom", message: "Invalid physical publication" });
    }
    candidateIds.add(c.candidateId); recordIds.add(c.record.recordId);
    if (c.predecessorRecordId) predecessors.add(c.predecessorRecordId);
  }
  if ([...predecessors].some(id => recordIds.has(id))) ctx.addIssue({code:"custom",message:"In-set predecessor is not current"});
});
export const InformationPublicationResultSchema = z.strictObject({
  operationId: z.string().uuid(), runtime: DiscoveryRuntimeSchema,
  records: z.array(DiscoveryInformationRecordSchema),
});
export type InformationPublication = z.infer<typeof InformationPublicationSchema>;
export type InformationPublicationResult = z.infer<typeof InformationPublicationResultSchema>;
