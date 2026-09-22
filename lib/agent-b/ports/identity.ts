import type { AuthenticatedIdentity, IdentityId } from "../core/identity-access.ts";

export interface IdentityPort {
  // Must validate the session with the identity provider, not trust a cookie user.
  current(): Promise<AuthenticatedIdentity | null>;
  signInAnonymously(): Promise<AuthenticatedIdentity>;
  requestEmailUpgrade(identityId: IdentityId, email: string): Promise<void>;
  verifyEmailUpgrade(identityId: IdentityId, email: string, token: string): Promise<AuthenticatedIdentity>;
}
