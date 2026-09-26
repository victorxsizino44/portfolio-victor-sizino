import { z } from "zod";

// Independent vocabularies only. No runtime aggregate, transitions or resume.
export const SessionLifecycleSchema = z.enum(["OPEN", "INTERRUPTED", "CLOSED"]);
export type SessionLifecycle = z.infer<typeof SessionLifecycleSchema>;
export const RuntimeFreshnessSchema = z.enum(["CURRENT", "REEVALUATION_REQUIRED", "HISTORICAL"]);
export type RuntimeFreshness = z.infer<typeof RuntimeFreshnessSchema>;
export const PendingLifecycleSchema = z.enum(["PENDING", "RESOLVED", "SUPERSEDED"]);
export type PendingLifecycle = z.infer<typeof PendingLifecycleSchema>;
