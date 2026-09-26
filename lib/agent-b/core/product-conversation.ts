import { CaptureMetadataSchema } from "./information-capture.ts";
import { ProductHandleSchema, ProductActionSchema } from "./product-runtime.ts";
import { ConversationInputSchema, ConversationResponseSchema } from "./conversation-projection.ts";
import { z } from "zod";

export const ProductConversationRequestSchema = ProductHandleSchema.extend({
  conversation: ConversationInputSchema.optional(),
  capture: CaptureMetadataSchema.optional(),
});
export const ProductConversationResultSchema = z.strictObject({
  action: ProductActionSchema,
  response: ConversationResponseSchema,
});
