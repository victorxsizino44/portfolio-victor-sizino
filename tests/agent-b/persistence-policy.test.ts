import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const sql = readFileSync(new URL("../../supabase/migrations/20260922000100_agent_b_identity_persistence.sql", import.meta.url), "utf8");
const statements = sql.replace(/--[^\n]*/g, "");

// These are static policy contracts, NOT proof of PostgreSQL/RLS execution.
test("B02 migration enables RLS and explicitly revokes default grants on both tables", () => {
  for (const table of ["agent_b_discoveries", "agent_b_discovery_access"]) {
    assert.match(statements, new RegExp(`alter table public\\.${table} enable row level security;`));
    assert.match(statements, new RegExp(`revoke all on table public\\.${table} from public, anon, authenticated, service_role;`));
    assert.match(statements, new RegExp(`grant select on public\\.${table} to authenticated;`));
  }
  assert.doesNotMatch(statements, /grant\s+(?:all|insert|update|delete)\b/i);
  assert.doesNotMatch(statements, /using\s*\(\s*true\s*\)/i);
});

test("B02 owner/access relationship is constrained and reads are scoped by verified auth UID", () => {
  assert.match(statements, /foreign key \(discovery_id, identity_id\)\s+references public\.agent_b_discoveries\(discovery_id, owner_id\) on delete restrict/);
  assert.match(statements, /create policy agent_b_access_owner_read[\s\S]*?using \(identity_id = \(select auth\.uid\(\)\)\)/);
  assert.match(statements, /create policy agent_b_root_owner_read[\s\S]*?owner_id = \(select auth\.uid\(\)\)[\s\S]*?a\.discovery_id = agent_b_discoveries\.discovery_id[\s\S]*?a\.identity_id = \(select auth\.uid\(\)\)/);
  assert.equal((statements.match(/create policy /g) ?? []).length, 2);
});

test("B02 atomic creation binds owner to auth UID and creates the access in the same function", () => {
  const create = statements.split("create function agent_b_private.create_owned_discovery")[1].split("$$;")[0];
  assert.match(create, /actor uuid := auth\.uid\(\)/);
  assert.match(create, /actor is null[\s\S]*?p_expected_identity is distinct from actor/);
  assert.match(create, /insert into public\.agent_b_discoveries\(owner_id\) values \(actor\)/);
  assert.match(create, /insert into public\.agent_b_discovery_access[\s\S]*?values \(created_id, actor, 'OWNER'\)/);
  assert.doesNotMatch(create, /\bcommit\b/i);
});

test("B02 CAS repeats owner/access checks and increments only an expected entity version", () => {
  const cas = statements.split("create function agent_b_private.advance_entity_version")[1].split("$$;")[0];
  assert.match(cas, /d\.owner_id = actor[\s\S]*?a\.identity_id = actor/);
  assert.match(cas, /set entity_version = d\.entity_version \+ 1[\s\S]*?d\.entity_version = p_expected_version/);
  assert.match(cas, /if not found then[\s\S]*?errcode = '40001'/);
  assert.doesNotMatch(statements, /runtime_version|on delete cascade|disable row level security/i);
});

test("B02 exposed functions are invoker and only private narrowly scoped functions are definer", () => {
  const functions = [...statements.matchAll(/create function ([\w.]+)\([^]*?\$\$;/g)].map((match) => ({ name: match[1], text: match[0] }));
  assert.equal(functions.length, 4);
  for (const fn of functions) {
    assert.match(fn.text, /set search_path = ''/);
    if (fn.name.startsWith("public.")) assert.match(fn.text, /security invoker/);
    else assert.match(fn.text, /security definer/);
    const signature = fn.name.endsWith("create_owned_discovery") ? "uuid" : "uuid, uuid, bigint";
    assert.ok(statements.includes(`revoke all on function ${fn.name}(${signature}) from public, anon, authenticated, service_role;`));
    assert.ok(statements.includes(`grant execute on function ${fn.name}(${signature}) to authenticated;`));
  }
});

test("B02 progressive identity references stable auth user ID without copying email or adding domain runtime", () => {
  assert.match(statements, /owner_id uuid not null references auth\.users\(id\) on delete restrict/);
  assert.equal((statements.match(/create table /g) ?? []).length, 2);
  assert.doesNotMatch(statements, /email|password|storage\.|discovery_information|briefing|runtime_version/i);
  assert.match(statements.trim(), /^begin;[\s\S]*commit;$/);
});
