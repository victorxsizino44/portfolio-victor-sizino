import { z } from "zod";
import { DiscoveryIdSchema, RuntimeVersionSchema, SessionIdSchema } from "./primitives.ts";
export const InteractionActionSchema = z.enum(["EXPLORE","DEEPEN","CLARIFY","CONFIRM","REQUEST_EVIDENCE","ESCALATE","CLOSE"]);
export const NavigationActionSchema = z.enum(["TRANSITION","RETURN"]);
export const ProgressionEffectSchema = z.enum(["CONTINUE","DEFER","PAUSE","RESUME","BLOCK"]);
export const OrchestrationContextSchema = z.strictObject({ discoveryId: DiscoveryIdSchema, runtimeVersion: RuntimeVersionSchema, sessionId: SessionIdSchema, hasCurrentInformation: z.boolean(), unresolvedCriticalPending: z.boolean(), conflictingState: z.boolean(), missingFieldCount: z.number().int().nonnegative(), informationNeed: z.boolean() });
export type OrchestrationContext = z.infer<typeof OrchestrationContextSchema>;
export const ActionCandidateSchema = z.strictObject({ discoveryId: DiscoveryIdSchema, runtimeVersion: RuntimeVersionSchema, interaction: InteractionActionSchema, navigation: NavigationActionSchema, progression: ProgressionEffectSchema, rationale: z.string().min(1).max(500), requiresHumanDecision: z.boolean() });
export type ActionCandidate = z.infer<typeof ActionCandidateSchema>;
