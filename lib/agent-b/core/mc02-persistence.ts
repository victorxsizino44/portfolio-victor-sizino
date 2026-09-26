import { z } from "zod";
import { DemandClassificationContractSchema, DiscoveryScopeContractSchema, SpecializationResolutionContractSchema } from "./mc02.ts";
import { DiscoveryIdSchema, EntityVersionSchema, TimestampSchema } from "./primitives.ts";

export const Mc02KindSchema = z.enum(["CLASSIFICATION", "SCOPE", "SPECIALIZATION"]);
const value = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("CLASSIFICATION"), contract: DemandClassificationContractSchema }),
  z.strictObject({ kind: z.literal("SCOPE"), contract: DiscoveryScopeContractSchema }),
  z.strictObject({ kind: z.literal("SPECIALIZATION"), contract: SpecializationResolutionContractSchema }),
]);
export const Mc02WriteSchema = z.strictObject({
  discoveryId: DiscoveryIdSchema,
  operationId: z.string().uuid(),
  // null explicitly creates version zero; zero is an expected existing version.
  expectedEntityVersion: EntityVersionSchema.nullable(),
  value,
}).superRefine((input, context) => {
  if (input.value.contract.discoveryId !== input.discoveryId)
    context.addIssue({ code: "custom", message: "Discovery mismatch." });
  const next = input.expectedEntityVersion === null ? 0 : input.expectedEntityVersion + 1;
  if (!Number.isSafeInteger(next) || input.value.contract.entityVersion !== next)
    context.addIssue({ code: "custom", message: "Expected next entity version." });
});
export const Mc02ReadSchema = z.strictObject({ discoveryId: DiscoveryIdSchema, kind: Mc02KindSchema });
export const PersistedMc02Schema = z.strictObject({
  recordId: z.string().uuid(), operationId: z.string().uuid(),
  discoveryId: DiscoveryIdSchema, entityVersion: EntityVersionSchema,
  lineageRootId: z.string().uuid(), supersedesId: z.string().uuid().nullable(),
  createdAt: TimestampSchema, value,
}).superRefine((row, context) => {
  if (row.discoveryId !== row.value.contract.discoveryId || row.entityVersion !== row.value.contract.entityVersion)
    context.addIssue({ code: "custom", message: "Persisted envelope mismatch." });
  if (row.entityVersion === 0 ? row.lineageRootId !== row.recordId || row.supersedesId !== null : row.supersedesId === null || row.lineageRootId === row.recordId)
    context.addIssue({ code: "custom", message: "Invalid lineage." });
});
export type Mc02Write = z.infer<typeof Mc02WriteSchema>;
export type Mc02Read = z.infer<typeof Mc02ReadSchema>;
export type PersistedMc02 = z.infer<typeof PersistedMc02Schema>;
