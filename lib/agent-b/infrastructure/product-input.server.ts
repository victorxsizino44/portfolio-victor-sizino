import "./server-boundary.ts";
import { z } from "zod";
import { DiscoveryIdSchema } from "../core/primitives.ts";
import { ProductInitializeSchema } from "../core/product-runtime.ts";
import { ProductConversationRequestSchema } from "../core/product-conversation.ts";
import { FoundationError } from "../core/identity-access.ts";
import { ContinuityRequestSchema } from "../core/product-continuity.ts";

// Physical compatibility with the current PostgreSQL adapter, not a domain invariant.
export const persistedDiscoveryId = z.uuid().pipe(DiscoveryIdSchema);
const initialize = ProductInitializeSchema.extend({ discoveryId: persistedDiscoveryId.optional() });
const evaluate = ProductConversationRequestSchema.extend({ discoveryId: persistedDiscoveryId });

export function parseProductPersistenceInput(input: unknown, operation: "initialize" | "evaluate" | "continuity") {
  if(operation==="continuity"){
    const parsed=ContinuityRequestSchema.safeParse(input);
    if(!parsed.success || (parsed.data.kind==="RESUME" && !persistedDiscoveryId.safeParse(parsed.data.discoveryId).success))
      throw new FoundationError("INVALID_INPUT");
    return parsed.data;
  }
  const parsed = (operation === "initialize" ? initialize : evaluate).safeParse(input);
  if (!parsed.success) throw new FoundationError("INVALID_INPUT");
  return parsed.data;
}
