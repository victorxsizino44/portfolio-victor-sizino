import { z } from "zod";
import { InitializeRuntimeSchema } from "./runtime-operations.ts";
import { DiscoveryIdSchema, RuntimeVersionSchema, SessionIdSchema } from "./primitives.ts";
import { AbstentionActionCandidateSchema, SubstantiveActionCandidateSchema } from "./mc03.ts";
export const ProductInitializeSchema = InitializeRuntimeSchema.omit({discoveryId:true}).extend({discoveryId:DiscoveryIdSchema.optional()});
export const ProductHandleSchema = z.strictObject({discoveryId:DiscoveryIdSchema,sessionId:SessionIdSchema,runtimeVersion:RuntimeVersionSchema});
export const ProductActionSchema = z.discriminatedUnion("kind",[
  SubstantiveActionCandidateSchema.omit({rationale:true}),AbstentionActionCandidateSchema,
]);
export type ProductHandle = z.infer<typeof ProductHandleSchema>;
export type ProductAction = z.infer<typeof ProductActionSchema>;
