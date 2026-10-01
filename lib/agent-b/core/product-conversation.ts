import { CaptureMetadataSchema } from "./information-capture.ts";
import { ProductHandleSchema, ProductActionSchema } from "./product-runtime.ts";
import { ConversationInputSchema, ConversationResponseSchema } from "./conversation-projection.ts";
import { ConversationalStateSchema } from "./conversational-state.ts";
import { z } from "zod";

export const ProductConversationRequestSchema = ProductHandleSchema.extend({
  conversation: ConversationInputSchema.optional(),
  capture: CaptureMetadataSchema.optional(),
  conversationalState: z.unknown().optional(),
});
export const ProductConversationResultSchema = z.strictObject({
  action: ProductActionSchema,
  response: ConversationResponseSchema,
  conversationalState: ConversationalStateSchema,
});
