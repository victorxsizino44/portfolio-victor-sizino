import "../server-boundary.ts";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DiscoveryAccessSchema, DiscoveryRootSchema, FoundationError, type IdentityId } from "../../core/identity-access.ts";
import type { DiscoveryId, EntityVersion } from "../../core/primitives.ts";
import type { DiscoveryPersistencePort } from "../../ports/discovery-persistence.ts";
import type { AgentBDatabase } from "./database.types.ts";

const rootRow = z.strictObject({ discovery_id: z.uuid(), owner_id: z.uuid(), entity_version: z.int().nonnegative(), created_at: z.string() });
const accessRow = z.strictObject({ discovery_id: z.uuid(), identity_id: z.uuid(), role: z.literal("OWNER") });
function rootFromUnknown(input: unknown) {
  const row = rootRow.parse(input);
  return DiscoveryRootSchema.parse({ discoveryId: row.discovery_id, ownerId: row.owner_id, entityVersion: row.entity_version, createdAt: row.created_at });
}
function fail(error: { code?: string } | null): void {
  if (!error) return;
  if (error.code === "42501") throw new FoundationError("ACCESS_DENIED");
  if (error.code === "40001") throw new FoundationError("CONCURRENT_MODIFICATION");
  if (error.code === "22023") throw new FoundationError("INVALID_INPUT");
  throw new FoundationError("PROVIDER_UNAVAILABLE");
}
async function safe<T>(operation: () => Promise<T>): Promise<T> {
  try { return await operation(); } catch (error) {
    if (error instanceof FoundationError) throw error;
    throw new FoundationError("PROVIDER_UNAVAILABLE");
  }
}

export class SupabaseDiscoveryPersistence implements DiscoveryPersistencePort {
  private readonly client: SupabaseClient<AgentBDatabase>;
  constructor(client: SupabaseClient<AgentBDatabase>) { this.client = client; }

  findAccess(discoveryId: DiscoveryId, identityId: IdentityId) {
    return safe(async () => {
      const { data, error } = await this.client.from("agent_b_discovery_access")
        .select("discovery_id,identity_id,role").eq("discovery_id", discoveryId).eq("identity_id", identityId).maybeSingle();
      fail(error);
      if (!data) return null;
      const row = accessRow.parse(data);
      return DiscoveryAccessSchema.parse({ discoveryId: row.discovery_id, identityId: row.identity_id, role: row.role });
    });
  }

  readRoot(discoveryId: DiscoveryId) {
    return safe(async () => {
      const { data, error } = await this.client.from("agent_b_discoveries")
        .select("discovery_id,owner_id,entity_version,created_at").eq("discovery_id", discoveryId).maybeSingle();
      fail(error);
      return data ? rootFromUnknown(data) : null;
    });
  }

  createOwnedRoot(identityId: IdentityId) {
    return safe(async () => {
      const { data, error } = await this.client.rpc("agent_b_create_owned_discovery", { p_expected_identity: identityId }).single();
      fail(error);
      return rootFromUnknown(data);
    });
  }

  advanceEntityVersion(discoveryId: DiscoveryId, identityId: IdentityId, expected: EntityVersion) {
    return safe(async () => {
      const { data, error } = await this.client.rpc("agent_b_advance_entity_version", {
        p_discovery_id: discoveryId, p_expected_identity: identityId, p_expected_version: expected,
      }).single();
      fail(error);
      return rootFromUnknown(data);
    });
  }
}
