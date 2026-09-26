import { z } from "zod";
import { DiscoveryIdSchema, RuntimeVersionSchema, TimestampSchema, HumanDecisionReferenceSchema } from "./primitives.ts";
import { DecisionValidationSchema } from "./governance.ts";

const common = {
  discoveryId: DiscoveryIdSchema, operationId: z.string().uuid(), handoffId: z.string().uuid(),
  sourceRuntimeVersion: RuntimeVersionSchema, decision: HumanDecisionReferenceSchema, issuedAt: TimestampSchema,
};
export const IssueHandoffSchema = z.strictObject({ ...common, action: z.literal("ISSUE_HANDOFF") });
export const SupersedeHandoffSchema = z.strictObject({ ...common, action: z.literal("SUPERSEDE_HANDOFF"),
  expectedHandoffId: z.string().uuid(), expectedVersion: z.int().positive(),
}).refine(x => x.handoffId !== x.expectedHandoffId);
export const HandoffMutationSchema = z.discriminatedUnion("action", [IssueHandoffSchema, SupersedeHandoffSchema]);
export type HandoffMutation = z.infer<typeof HandoffMutationSchema>;
export const HandoffReadSchema = z.strictObject({ discoveryId: DiscoveryIdSchema });

// Supersession authorizes one replacement, never an independent issuance.
export function handoffDecisionIntent(input: HandoffMutation) {
  return DecisionValidationSchema.parse({
    discoveryId: input.discoveryId, action: input.action, targetType: "HANDOFF",
    targetId: input.action === "ISSUE_HANDOFF" ? input.handoffId : input.expectedHandoffId,
    targetVersion: input.action === "ISSUE_HANDOFF" ? 1 : input.expectedVersion,
    outcome: input.action === "ISSUE_HANDOFF" ? "ISSUED" : "SUPERSEDED",
    operationId: input.operationId, reference: input.decision,
  });
}
