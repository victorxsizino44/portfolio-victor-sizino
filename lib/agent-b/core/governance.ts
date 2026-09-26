import { z } from "zod";
import { DiscoveryIdSchema, EntityVersionSchema, HumanDecisionReferenceSchema, TimestampSchema } from "./primitives.ts";
import { FoundationError, IdentityIdSchema } from "./identity-access.ts";

const id = z.string().trim().min(1);
export const GovernanceActionSchema = z.enum(["VALIDATE_EVIDENCE", "REJECT_EVIDENCE", "SUPERSEDE_EVIDENCE", "ISSUE_HANDOFF", "SUPERSEDE_HANDOFF", "PUBLISH_FIELD_CATALOG", "PUBLISH_DEPENDENCY_CATALOG"]);
export const GovernanceAuthoritySchema = z.strictObject({
  authorityId: id, discoveryId: DiscoveryIdSchema, actorIdentityId: IdentityIdSchema,
  role: z.literal("HUMAN_GOVERNANCE_AUTHORITY"), status: z.enum(["ACTIVE", "REVOKED"]),
  version: EntityVersionSchema,
});
export const DecisionIntentSchema = z.strictObject({
  discoveryId: DiscoveryIdSchema, action: GovernanceActionSchema,
  targetType: id, targetId: id, targetVersion: EntityVersionSchema.optional(), outcome: id,
});
export const HumanDecisionSchema = DecisionIntentSchema.extend({
  decisionId: id, authorityId: id, actorIdentityId: IdentityIdSchema,
  operationId: z.string().uuid(), recordedAt: TimestampSchema, version: EntityVersionSchema,
});
export const DecisionValidationSchema = DecisionIntentSchema.extend({
  reference: HumanDecisionReferenceSchema, operationId: z.string().uuid(),
});
export type GovernanceAuthority = z.infer<typeof GovernanceAuthoritySchema>;
export type HumanDecision = z.infer<typeof HumanDecisionSchema>;
export type DecisionValidation = z.infer<typeof DecisionValidationSchema>;

// Pure matching only. Access and transactional revalidation belong at persistence.
// No boolean/token returned here is a durable authorization capability.
export function assertDecisionMatches(authority: GovernanceAuthority, decision: HumanDecision, intent: DecisionValidation, actorIdentityId: string): void {
  if (authority.status !== "ACTIVE" || authority.role !== "HUMAN_GOVERNANCE_AUTHORITY" ||
      authority.discoveryId !== intent.discoveryId || decision.discoveryId !== intent.discoveryId ||
      authority.authorityId !== decision.authorityId || authority.actorIdentityId !== actorIdentityId ||
      decision.actorIdentityId !== actorIdentityId || decision.decisionId !== intent.reference.decisionId ||
      decision.recordedAt !== intent.reference.recordedAt || decision.action !== intent.action ||
      decision.targetType !== intent.targetType || decision.targetId !== intent.targetId ||
      decision.targetVersion !== intent.targetVersion || decision.outcome !== intent.outcome ||
      decision.operationId !== intent.operationId) throw new FoundationError("ACCESS_DENIED");
}
