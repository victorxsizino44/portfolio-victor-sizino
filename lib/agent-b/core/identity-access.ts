import { z } from "zod";
import { DiscoveryIdSchema, EntityVersionSchema, TimestampSchema } from "./primitives.ts";

export const IdentityIdSchema = z.string().min(1).brand<"IdentityId">();
export type IdentityId = z.infer<typeof IdentityIdSchema>;
export const AuthenticatedIdentitySchema = z.strictObject({
  identityId: IdentityIdSchema,
  kind: z.enum(["ANONYMOUS", "EMAIL_UNVERIFIED", "EMAIL_VERIFIED"]),
});
export type AuthenticatedIdentity = z.infer<typeof AuthenticatedIdentitySchema>;

// Operational root and ownership only. No MC-01 content or semantic lifecycle.
export const DiscoveryRootSchema = z.strictObject({
  discoveryId: DiscoveryIdSchema,
  ownerId: IdentityIdSchema,
  entityVersion: EntityVersionSchema,
  createdAt: TimestampSchema,
});
export type DiscoveryRoot = z.infer<typeof DiscoveryRootSchema>;
export const DiscoveryAccessSchema = z.strictObject({
  discoveryId: DiscoveryIdSchema,
  identityId: IdentityIdSchema,
  role: z.literal("OWNER"),
});
export type DiscoveryAccess = z.infer<typeof DiscoveryAccessSchema>;
export const DiscoveryCapabilitySchema = z.enum(["READ_ROOT", "ADVANCE_ENTITY_VERSION"]);
export type DiscoveryCapability = z.infer<typeof DiscoveryCapabilitySchema>;

export type FoundationErrorCode =
  | "INVALID_INPUT" | "AUTHENTICATION_REQUIRED" | "ACCESS_DENIED"
  | "CONCURRENT_MODIFICATION" | "CONFIGURATION_REQUIRED"
  | "PROVIDER_UNAVAILABLE" | "IDENTITY_CONTINUITY_FAILED" | "EMAIL_VERIFICATION_REQUIRED";

export class FoundationError extends Error {
  readonly code: FoundationErrorCode;

  constructor(code: FoundationErrorCode) {
    super(code); // Fixed codes only: no provider response, email, token or payload.
    this.name = "FoundationError";
    this.code = code;
  }
}
