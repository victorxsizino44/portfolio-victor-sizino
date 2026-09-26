import { z } from "zod";
import { FieldIdSchema, InformationRecordIdSchema } from "./primitives.ts";
import { informationField } from "./information-cardinality.ts";

export const InformationReferencesSchema = z.array(z.strictObject({ fieldId: FieldIdSchema, recordIds: z.array(InformationRecordIdSchema) }))
  .refine(refs => new Set(refs.map(r => r.fieldId)).size === refs.length &&
    new Set(refs.flatMap(r => r.recordIds)).size === refs.flatMap(r => r.recordIds).length &&
    refs.every(r => informationField(r.fieldId)?.cardinality !== "SINGLE" || r.recordIds.length <= 1), "Invalid current references")
  .transform(refs => refs.map(r => ({ ...r, recordIds: [...r.recordIds].sort() })).sort((a,b) => a.fieldId < b.fieldId ? -1 : a.fieldId > b.fieldId ? 1 : 0));
export type InformationReferences = z.infer<typeof InformationReferencesSchema>;
type Current = { informationRecordId?: string; informationReferences?: InformationReferences };
export function currentRecordIds(current: Current): string[] {
  if (current.informationReferences && current.informationRecordId) {
    const ids = current.informationReferences.flatMap(r => r.recordIds);
    if (ids.length !== 1 || ids[0] !== current.informationRecordId) throw new Error("CONFLICTING_CURRENT_REPRESENTATIONS");
  }
  return current.informationReferences?.flatMap(r => r.recordIds) ?? (current.informationRecordId ? [current.informationRecordId] : []);
}
// Must receive authorized persisted records. Never infer current from history.
export function resolveInformationReferences(current: Current, records: readonly { recordId: string; fieldId: string; discoveryId: string }[], discoveryId: string): InformationReferences {
  let refs = current.informationReferences;
  if (current.informationRecordId) {
    const matches = records.filter(r => r.recordId === current.informationRecordId && r.discoveryId === discoveryId);
    if (matches.length !== 1) throw new Error("INVALID_CURRENT_REFERENCE");
    const legacy = InformationReferencesSchema.parse([{fieldId:matches[0].fieldId,recordIds:[matches[0].recordId]}]);
    if (refs && JSON.stringify(InformationReferencesSchema.parse(refs)) !== JSON.stringify(legacy)) throw new Error("CONFLICTING_CURRENT_REPRESENTATIONS");
    refs = legacy;
  }
  const result = InformationReferencesSchema.parse(refs ?? []);
  for (const ref of result) for (const id of ref.recordIds) {
    if (records.filter(r => r.recordId === id && r.fieldId === ref.fieldId && r.discoveryId === discoveryId).length !== 1) throw new Error("INVALID_CURRENT_REFERENCE");
  }
  return result;
}
