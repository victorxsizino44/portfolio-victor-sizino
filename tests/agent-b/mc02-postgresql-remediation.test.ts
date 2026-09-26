import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { Mc02WriteSchema, PersistedMc02Schema } from "../../lib/agent-b/core/mc02-persistence.ts";
import { SupabaseMc02Persistence } from "../../lib/agent-b/infrastructure/supabase/mc02-persistence.server.ts";

const discoveryId = "00000000-0000-4000-8000-000000000001";
const operationId = "00000000-0000-4000-8000-000000000002";
const input = {
  discoveryId, operationId, expectedEntityVersion: null,
  value: { kind: "CLASSIFICATION", contract: { discoveryId, entityVersion: 0, understandingState: "AMBIGUOUS" } },
};

test("R08-05 exact failing payload is valid and adapter sends a JSON object, not encoded JSON text", async () => {
  const parsed = Mc02WriteSchema.parse(input);
  const recordId = "00000000-0000-4000-8000-000000000003";
  const row = PersistedMc02Schema.parse({ recordId, operationId, discoveryId, entityVersion: 0,
    lineageRootId: recordId, supersedesId: null, createdAt: "2026-09-23T00:00:00Z", value: parsed.value });
  const client = { rpc: async (name: string, args: unknown) => {
    assert.equal(name, "agent_b_write_mc02");
    assert.deepEqual(JSON.parse(JSON.stringify(args)), { p_actor: "actor", p_input: input });
    return { data: row, error: null };
  } };
  const adapter = new SupabaseMc02Persistence(client as unknown as ConstructorParameters<typeof SupabaseMc02Persistence>[0]);
  assert.deepEqual(await adapter.write("actor", parsed), row);
});

test("R08-05 malformed and extra-key envelopes remain structurally invalid", () => {
  for (const bad of [null, [], "not json", { ...input, extra: true },
    { ...input, value: { ...input.value, extra: true } },
    { ...input, value: { kind: "CLASSIFICATION", contract: {} } },
    { ...input, value: { ...input.value, contract: { ...input.value.contract, understandingState: "AUTO_VALID" } } }]) {
    assert.equal(Mc02WriteSchema.safeParse(bad).success, false);
  }
});

test("R08-05 corrective migration changes only JSON extraction grouping, preserving all guards and grants", () => {
  const original = readFileSync(new URL("../../supabase/migrations/20260922000700_agent_b_reconciliation.sql", import.meta.url), "utf8");
  const correction = readFileSync(new URL("../../supabase/migrations/20260922000800_agent_b_mc02_json_precedence.sql", import.meta.url), "utf8");
  const start = original.indexOf("create function agent_b_private.write_mc02(");
  const end = original.indexOf("create function public.agent_b_write_mc02(", start);
  const expected = original.slice(start, end).replace("create function", "create or replace function")
    .replace("p_input->'value'-array['kind','contract']", "(p_input->'value')-array['kind','contract']");
  assert.equal(correction.slice(correction.indexOf("create or replace function")).trim(), expected.trim());
  assert.equal((correction.match(/create or replace function/g) ?? []).length, 1);
  assert.doesNotMatch(correction, /\b(?:grant|revoke|drop|alter)\s/i);
});
