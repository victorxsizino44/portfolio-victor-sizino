import { z } from "zod";
import { DiscoveryInformationRecordSchema } from "../../core/mc01.ts";
import { InformationRecordIdSchema, TimestampSchema } from "../../core/primitives.ts";
import type { IdentityId } from "../../core/identity-access.ts";
import type { Mc01PersistencePort, PersistedInformationRecord } from "../../ports/mc01-persistence.ts";
import type { AgentBDatabase } from "./database.types.ts";
import { FoundationError } from "../../core/identity-access.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

const rowSchema = z.strictObject({ record_id: z.string(), discovery_id: z.string(), entity_version: z.number().int().nonnegative(), payload: z.unknown(), lineage_root_id: z.string(), supersedes_record_id: z.string().nullable(), created_at: z.string() });
function map(row: unknown): PersistedInformationRecord {
  const parsed = rowSchema.parse(row);
  return { record: DiscoveryInformationRecordSchema.parse(parsed.payload), lineageRootId: InformationRecordIdSchema.parse(parsed.lineage_root_id), supersedesRecordId: parsed.supersedes_record_id ? InformationRecordIdSchema.parse(parsed.supersedes_record_id) : null, createdAt: TimestampSchema.parse(parsed.created_at) };
}
function fail(error: { code?: string } | null): void { if (!error) return; if (error.code === "42501") throw new FoundationError("ACCESS_DENIED"); if (error.code === "40001") throw new FoundationError("CONCURRENT_MODIFICATION"); throw new FoundationError("PROVIDER_UNAVAILABLE"); }

export class SupabaseMc01Persistence implements Mc01PersistencePort {
  private readonly client: SupabaseClient<AgentBDatabase>;
  constructor(client: SupabaseClient<AgentBDatabase>) { this.client = client; }
  async create(input: { identityId: IdentityId; record: import("../../core/mc01.ts").DiscoveryInformationRecord; now: import("../../core/primitives.ts").Timestamp }) { const { data, error } = await this.client.rpc("agent_b_create_information_record", { p_expected_identity: input.identityId, p_record: input.record, p_created_at: input.now }).single(); fail(error); return map(data); }
  async read(input: { identityId: IdentityId; discoveryId: string; recordId: string }) { const { data, error } = await this.client.from("agent_b_information_records").select("record_id,discovery_id,entity_version,payload,lineage_root_id,supersedes_record_id,created_at").eq("discovery_id", input.discoveryId).eq("record_id", input.recordId).maybeSingle(); fail(error); return data ? map(data) : null; }
  async update(input: { identityId: IdentityId; discoveryId: string; expectedEntityVersion: number; record: import("../../core/mc01.ts").DiscoveryInformationRecord; now: import("../../core/primitives.ts").Timestamp }) { const { data, error } = await this.client.rpc("agent_b_update_information_record", { p_expected_identity: input.identityId, p_discovery_id: input.discoveryId, p_expected_version: input.expectedEntityVersion, p_record: input.record, p_created_at: input.now }).single(); fail(error); return map(data); }
  async listLineage(input: { identityId: IdentityId; discoveryId: string; lineageRootId: string }) { const { data, error } = await this.client.from("agent_b_information_records").select("record_id,discovery_id,entity_version,payload,lineage_root_id,supersedes_record_id,created_at").eq("discovery_id", input.discoveryId).eq("lineage_root_id", input.lineageRootId).order("entity_version", { ascending: true }); fail(error); return (data ?? []).map(map); }
}
