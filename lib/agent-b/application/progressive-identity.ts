import { z } from "zod";
import { DiscoveryIdSchema, type DiscoveryId } from "../core/primitives.ts";
import { FoundationError, type IdentityId } from "../core/identity-access.ts";
import type { IdentityPort } from "../ports/identity.ts";
import type { DiscoveryPersistencePort } from "../ports/discovery-persistence.ts";

export const EmailUpgradeRequestSchema = z.strictObject({ discoveryId: DiscoveryIdSchema, email: z.email().max(254) });
export const EmailUpgradeVerifySchema = EmailUpgradeRequestSchema.extend({ token: z.string().regex(/^\d{6,10}$/) });
export const EmailUpgradeStatusSchema = z.strictObject({ discoveryId: DiscoveryIdSchema });
type AccessReader = Pick<DiscoveryPersistencePort, "readRoot" | "findAccess">;

export class ProgressiveIdentity {
  private readonly identity: IdentityPort;
  private readonly access: AccessReader;
  constructor(identity: IdentityPort, access: AccessReader) { this.identity = identity; this.access = access; }

  private async authorize(discoveryId: DiscoveryId, actor: IdentityId) {
    const root = await this.access.readRoot(discoveryId);
    const access = await this.access.findAccess(discoveryId, actor);
    if (!root || root.discoveryId !== discoveryId || root.ownerId !== actor ||
        !access || access.discoveryId !== discoveryId || access.identityId !== actor || access.role !== "OWNER")
      throw new FoundationError("ACCESS_DENIED");
  }

  // ConfirmationURL is consumed by Supabase, not by Agent B. Read trusted state
  // using the original authenticated session; never accept a callback token/claim.
  async status(input: unknown) {
    const parsed = EmailUpgradeStatusSchema.safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const before = await this.identity.current();
    if (!before) throw new FoundationError("AUTHENTICATION_REQUIRED");
    await this.authorize(parsed.data.discoveryId, before.identityId);
    const after = await this.identity.current();
    if (!after || after.identityId !== before.identityId) throw new FoundationError("IDENTITY_CONTINUITY_FAILED");
    return { discoveryId: parsed.data.discoveryId,
      status: after.kind === "EMAIL_VERIFIED" ? "VERIFIED" as const : "VERIFICATION_REQUIRED" as const };
  }

  async execute(input: unknown, operation: "request" | "verify") {
    const parsed = (operation === "request" ? EmailUpgradeRequestSchema : EmailUpgradeVerifySchema).safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const before = await this.identity.current();
    if (!before) throw new FoundationError("AUTHENTICATION_REQUIRED");
    await this.authorize(parsed.data.discoveryId, before.identityId);
    // This endpoint upgrades anonymous identities; it never changes an already verified email.
    if (before.kind !== "EMAIL_VERIFIED") {
      if (operation === "request") await this.identity.requestEmailUpgrade(before.identityId, parsed.data.email);
      else {
        const verify = EmailUpgradeVerifySchema.parse(parsed.data);
        const result = await this.identity.verifyEmailUpgrade(before.identityId, verify.email, verify.token);
        if (result.identityId !== before.identityId) throw new FoundationError("IDENTITY_CONTINUITY_FAILED");
        if (result.kind !== "EMAIL_VERIFIED") throw new FoundationError("EMAIL_VERIFICATION_REQUIRED");
      }
    }
    const after = await this.identity.current();
    if (!after || after.identityId !== before.identityId) throw new FoundationError("IDENTITY_CONTINUITY_FAILED");
    await this.authorize(parsed.data.discoveryId, after.identityId);
    if (operation === "verify" && after.kind !== "EMAIL_VERIFIED") throw new FoundationError("EMAIL_VERIFICATION_REQUIRED");
    return { discoveryId: parsed.data.discoveryId, status: after.kind === "EMAIL_VERIFIED" ? "VERIFIED" as const : "VERIFICATION_REQUESTED" as const };
  }
}
