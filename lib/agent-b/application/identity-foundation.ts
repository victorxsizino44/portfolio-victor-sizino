import { z } from "zod";
import { FoundationError } from "../core/identity-access.ts";
import type { IdentityPort } from "../ports/identity.ts";

export class IdentityFoundation {
  private readonly identity: IdentityPort;

  constructor(identity: IdentityPort) { this.identity = identity; }

  async ensureAuthenticatedIdentity() {
    // Never replace an existing principal with a new anonymous user.
    return await this.identity.current() ?? await this.identity.signInAnonymously();
  }

  async requestEmailUpgrade(input: unknown): Promise<void> {
    const parsed = z.strictObject({ email: z.email() }).safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const current = await this.identity.current();
    if (!current) throw new FoundationError("AUTHENTICATION_REQUIRED");
    await this.identity.requestEmailUpgrade(current.identityId, parsed.data.email);
  }

  async verifyEmailUpgrade(input: unknown) {
    const parsed = z.strictObject({ email: z.email(), token: z.string().min(1).max(256) }).safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const current = await this.identity.current();
    if (!current) throw new FoundationError("AUTHENTICATION_REQUIRED");
    const upgraded = await this.identity.verifyEmailUpgrade(current.identityId, parsed.data.email, parsed.data.token);
    if (upgraded.identityId !== current.identityId) throw new FoundationError("IDENTITY_CONTINUITY_FAILED");
    if (upgraded.kind !== "EMAIL_VERIFIED") throw new FoundationError("EMAIL_VERIFICATION_REQUIRED");
    return upgraded;
  }
}
