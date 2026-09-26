import "../server-boundary.ts";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { AuthenticatedIdentitySchema, FoundationError, type IdentityId } from "../../core/identity-access.ts";
import type { IdentityPort } from "../../ports/identity.ts";
import type { AgentBDatabase } from "./database.types.ts";

type AuthGateway = Pick<SupabaseClient<AgentBDatabase>["auth"],
  "getUser" | "signInAnonymously" | "updateUser" | "verifyOtp" | "signOut">;

function mapIdentity(user: User) {
  // Only provider-verified user fields; never user_metadata or client claims.
  const kind = user.is_anonymous === true ? "ANONYMOUS"
    : user.email && user.email_confirmed_at ? "EMAIL_VERIFIED" : "EMAIL_UNVERIFIED";
  const parsed = AuthenticatedIdentitySchema.safeParse({ identityId: user.id, kind });
  if (!parsed.success) throw new FoundationError("PROVIDER_UNAVAILABLE");
  return parsed.data;
}

export class SupabaseIdentityAdapter implements IdentityPort {
  private readonly auth: AuthGateway;
  constructor(auth: AuthGateway) { this.auth = auth; }

  async current() {
    try {
      const { data, error } = await this.auth.getUser();
      if (error) {
        if (error.name === "AuthSessionMissingError" || error.status === 401 || error.status === 403) return null;
        throw new FoundationError("PROVIDER_UNAVAILABLE");
      }
      return data.user ? mapIdentity(data.user) : null;
    } catch (error) {
      if (error instanceof FoundationError) throw error;
      throw new FoundationError("PROVIDER_UNAVAILABLE");
    }
  }

  async signInAnonymously() {
    try {
      const { data, error } = await this.auth.signInAnonymously();
      if (error || !data.user) throw new FoundationError("PROVIDER_UNAVAILABLE");
      const identity = mapIdentity(data.user);
      if (identity.kind !== "ANONYMOUS") throw new FoundationError("IDENTITY_CONTINUITY_FAILED");
      return identity;
    } catch (error) {
      if (error instanceof FoundationError) throw error;
      throw new FoundationError("PROVIDER_UNAVAILABLE");
    }
  }

  private async requireSameIdentity(identityId: IdentityId) {
    const identity = await this.current();
    if (!identity) throw new FoundationError("AUTHENTICATION_REQUIRED");
    if (identity.identityId !== identityId) throw new FoundationError("IDENTITY_CONTINUITY_FAILED");
  }

  private async rejectChangedIdentity(): Promise<never> {
    // verifyOtp can set session cookies; clear a mismatched session before failing.
    try { await this.auth.signOut({ scope: "local" }); } catch { /* no details logged */ }
    throw new FoundationError("IDENTITY_CONTINUITY_FAILED");
  }

  async requestEmailUpgrade(identityId: IdentityId, email: string): Promise<void> {
    await this.requireSameIdentity(identityId);
    try {
      const { data, error } = await this.auth.updateUser({ email });
      if (error || !data.user) throw new FoundationError("PROVIDER_UNAVAILABLE");
      if (data.user.id !== identityId) return await this.rejectChangedIdentity();
      // Email request is not verification and does not touch DiscoveryAccess.
    } catch (error) {
      if (error instanceof FoundationError) throw error;
      throw new FoundationError("PROVIDER_UNAVAILABLE");
    }
  }

  async verifyEmailUpgrade(identityId: IdentityId, email: string, token: string) {
    await this.requireSameIdentity(identityId);
    try {
      const { data, error } = await this.auth.verifyOtp({ email, token, type: "email_change" });
      if (error && (error.code === "otp_expired" || error.code === "otp_disabled" || error.code === "validation_failed"))
        throw new FoundationError("EMAIL_VERIFICATION_REQUIRED");
      if (error || !data.user) throw new FoundationError("PROVIDER_UNAVAILABLE");
      if (data.user.id !== identityId) return await this.rejectChangedIdentity();
      const trusted = await this.auth.getUser();
      if (trusted.error) throw new FoundationError("PROVIDER_UNAVAILABLE");
      if (!trusted.data.user || trusted.data.user.id !== identityId) return await this.rejectChangedIdentity();
      const verified = mapIdentity(trusted.data.user);
      if (trusted.data.user.email?.toLowerCase() !== email.toLowerCase()) throw new FoundationError("EMAIL_VERIFICATION_REQUIRED");
      if (verified.kind !== "EMAIL_VERIFIED") throw new FoundationError("EMAIL_VERIFICATION_REQUIRED");
      return verified;
    } catch (error) {
      if (error instanceof FoundationError) throw error;
      throw new FoundationError("PROVIDER_UNAVAILABLE");
    }
  }
}
