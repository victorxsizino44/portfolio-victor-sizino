import { z } from "zod";
import { DiscoveryIdSchema, EntityVersionSchema } from "./primitives.ts";
export const AiOperationSchema = z.enum(["CLASSIFY_DEMAND", "SCOPE_DISCOVERY", "RESOLVE_SPECIALIZATION"]);
export type AiOperation = z.infer<typeof AiOperationSchema>;
export const PromptConfigSchema = z.strictObject({ promptVersion: z.string().min(1), model: z.literal("gemini-3.7-flash"), maxContextChars: z.number().int().positive().max(12000) });
export const AiInputSchema = z.strictObject({ operation: AiOperationSchema, discoveryId: DiscoveryIdSchema, entityVersion: EntityVersionSchema, context: z.string().min(1).max(12000), config: PromptConfigSchema });
export type AiInput = z.infer<typeof AiInputSchema>;
export const CandidateSchema = z.strictObject({ operation: AiOperationSchema, discoveryId: DiscoveryIdSchema, entityVersion: EntityVersionSchema, candidates: z.array(z.strictObject({ label: z.string().min(1).max(240), rationale: z.string().min(1).max(1000), confidence: z.enum(["LOW", "MEDIUM", "HIGH"]) })).min(1).max(20) });
export type Candidate = z.infer<typeof CandidateSchema>;
