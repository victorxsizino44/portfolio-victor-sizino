import "../server-boundary.ts";
import { DiscoveryFoundation } from "../../application/discovery-foundation.ts";
import { IdentityFoundation } from "../../application/identity-foundation.ts";
import { createAgentBSupabaseClient, type WritableAuthCookies } from "./client.server.ts";
import { SupabaseIdentityAdapter } from "./identity.server.ts";
import { SupabaseDiscoveryPersistence } from "./discovery-persistence.server.ts";

// Composition only. No endpoint, automatic sign-in or provider call on import.
export function createAgentBFoundation(cookies: WritableAuthCookies) {
  const client = createAgentBSupabaseClient(cookies);
  const identity = new SupabaseIdentityAdapter(client.auth);
  return {
    identity: new IdentityFoundation(identity),
    discovery: new DiscoveryFoundation(identity, new SupabaseDiscoveryPersistence(client)),
  };
}
