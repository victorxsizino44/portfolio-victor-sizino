import { z } from "zod";
import { DiscoveryIdSchema, RuntimeVersionSchema, SessionIdSchema, TimestampSchema } from "./primitives.ts";
import { DiscoveryRuntimeSchema, SessionSchema } from "./mc04.ts";
const common = { discoveryId: DiscoveryIdSchema, operationId: z.string().uuid(),
  sessionId: z.string().uuid().pipe(SessionIdSchema), now: TimestampSchema };
export const InitializeRuntimeSchema = z.strictObject(common);
export const ResumeRuntimeSchema = z.strictObject({ ...common,
  expectedRuntimeVersion: RuntimeVersionSchema, previousSessionId: SessionIdSchema,
}).refine(x => x.sessionId !== x.previousSessionId);
export const RuntimeOperationResultSchema = z.strictObject({ runtime: DiscoveryRuntimeSchema, session: SessionSchema })
  .refine(x => x.runtime.discoveryId === x.session.discoveryId && x.runtime.current.sessionId === x.session.sessionId && x.session.lifecycle === "OPEN");
export type InitializeRuntime = z.infer<typeof InitializeRuntimeSchema>;
export type ResumeRuntime = z.infer<typeof ResumeRuntimeSchema>;
export type RuntimeOperationResult = z.infer<typeof RuntimeOperationResultSchema>;
