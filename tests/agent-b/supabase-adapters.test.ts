import assert from "node:assert/strict";
import { test } from "node:test";
import { AuthApiError, AuthSessionMissingError, createClient, type User } from "@supabase/supabase-js";
import { SupabaseIdentityAdapter } from "../../lib/agent-b/infrastructure/supabase/identity.server.ts";
import { SupabaseDiscoveryPersistence } from "../../lib/agent-b/infrastructure/supabase/discovery-persistence.server.ts";
import type { AgentBDatabase } from "../../lib/agent-b/infrastructure/supabase/database.types.ts";
import { FoundationError, IdentityIdSchema } from "../../lib/agent-b/core/identity-access.ts";
import { DiscoveryIdSchema, EntityVersionSchema } from "../../lib/agent-b/core/primitives.ts";

const userId = "11111111-1111-4111-8111-111111111111";
const secondId = "22222222-2222-4222-8222-222222222222";
const discoveryId = "33333333-3333-4333-8333-333333333333";
const stamp = "2026-09-22T00:00:00Z";
const actor = IdentityIdSchema.parse(userId);
const discovery = DiscoveryIdSchema.parse(discoveryId);
const version = EntityVersionSchema.parse(0);
const row = { discovery_id: discoveryId, owner_id: userId, entity_version: 0, created_at: stamp };
const errorCode = (code: string) => (error: unknown) => error instanceof FoundationError && error.code === code;

function user(id = userId, anonymous = true): User {
  return {
    id, aud: "authenticated", role: "authenticated", created_at: stamp,
    app_metadata: {}, user_metadata: { claimedOwner: secondId }, is_anonymous: anonymous,
    ...(!anonymous ? { email: "person@example.invalid", email_confirmed_at: stamp } : {}),
  };
}

function authFixture() {
  let current: User | null = user();
  const calls: string[] = [];
  const auth: ConstructorParameters<typeof SupabaseIdentityAdapter>[0] = {
    getUser: async () => {
      calls.push("getUser");
      return current ? { data: { user: current }, error: null } : { data: { user: null }, error: new AuthSessionMissingError() };
    },
    signInAnonymously: async () => { current = user(); calls.push("anonymous"); return { data: { user: current, session: null }, error: null }; },
    updateUser: async (attributes) => {
      assert.deepEqual(Object.keys(attributes), ["email"]);
      calls.push("updateUser");
      if (!current) return { data: { user: null }, error: new AuthSessionMissingError() };
      return { data: { user: current }, error: null };
    },
    verifyOtp: async (parameters) => {
      assert.equal(parameters.type, "email_change");
      calls.push("verifyOtp"); current = user(userId, false);
      return { data: { user: current, session: null }, error: null };
    },
    signOut: async (options) => {
      assert.equal(options?.scope, "local");
      calls.push("signOut"); current = null; return { error: null };
    },
  };
  return { auth, calls, adapter: new SupabaseIdentityAdapter(auth), setCurrent: (value: User | null) => { current = value; } };
}

test("B02 Supabase identity uses verified getUser fields, supports anonymous users and missing sessions", async () => {
  const f = authFixture();
  assert.deepEqual(await f.adapter.current(), { identityId: userId, kind: "ANONYMOUS" });
  f.setCurrent(null);
  assert.equal(await f.adapter.current(), null);
  assert.equal((await f.adapter.signInAnonymously()).identityId, userId);
});

test("B02 Supabase email upgrade uses updateUser and email_change verification with the same ID", async () => {
  const f = authFixture();
  await f.adapter.requestEmailUpgrade(actor, "person@example.invalid");
  const upgraded = await f.adapter.verifyEmailUpgrade(actor, "person@example.invalid", "test-otp");
  assert.deepEqual(upgraded, { identityId: userId, kind: "EMAIL_VERIFIED" });
  assert.ok(f.calls.includes("updateUser") && f.calls.includes("verifyOtp"));
  assert.equal(f.calls.filter((name) => name === "getUser").length, 3);
  assert.ok(!f.calls.includes("anonymous"));
});

test("B02 Supabase mismatched verification clears the local session and rejects identity transfer", async () => {
  const f = authFixture();
  f.auth.verifyOtp = async () => ({ data: { user: user(secondId, false), session: null }, error: null });
  await assert.rejects(f.adapter.verifyEmailUpgrade(actor, "person@example.invalid", "test-otp"), errorCode("IDENTITY_CONTINUITY_FAILED"));
  assert.ok(f.calls.includes("signOut"));
});

test("B02 Supabase refuses upgrade after loss or replacement of the authenticated principal", async () => {
  const f = authFixture(); f.setCurrent(user(secondId));
  await assert.rejects(f.adapter.requestEmailUpgrade(actor, "person@example.invalid"), errorCode("IDENTITY_CONTINUITY_FAILED"));
  assert.ok(!f.calls.includes("updateUser"));
  f.setCurrent(null);
  await assert.rejects(f.adapter.verifyEmailUpgrade(actor, "person@example.invalid", "test-otp"), errorCode("AUTHENTICATION_REQUIRED"));
});

test("B02 Supabase provider failures never expose raw provider messages", async () => {
  const f = authFixture();
  f.auth.getUser = async () => { throw new Error("private-provider-response"); };
  await assert.rejects(f.adapter.current(), (error: unknown) => {
    assert.ok(error instanceof FoundationError);
    assert.equal(error.message, "PROVIDER_UNAVAILABLE");
    assert.equal("cause" in error, false);
    return true;
  });
});

test("R08-12 expired or invalid OTP maps to safe verification failure", async () => {
  const f = authFixture();
  f.auth.verifyOtp = async () => ({ data: { user: null, session: null }, error: new AuthApiError("sensitive provider detail", 403, "otp_expired") });
  await assert.rejects(f.adapter.verifyEmailUpgrade(actor, "person@example.invalid", "123456"), errorCode("EMAIL_VERIFICATION_REQUIRED"));
  assert.equal((await f.adapter.current())?.kind, "ANONYMOUS");
});

test("R08-12 verify response cannot replace trusted getUser confirmation", async () => {
  const f = authFixture();
  f.auth.verifyOtp = async () => ({ data: { user: user(userId, false), session: null }, error: null });
  await assert.rejects(f.adapter.verifyEmailUpgrade(actor, "person@example.invalid", "123456"), errorCode("EMAIL_VERIFICATION_REQUIRED"));
});

test("R08-12 confirmed email must match requested email", async () => {
  const f = authFixture();
  await assert.rejects(f.adapter.verifyEmailUpgrade(actor, "different@example.invalid", "123456"), errorCode("EMAIL_VERIFICATION_REQUIRED"));
});

// All SDK traffic below is intercepted. No real key, service or database is used.
function repositoryFixture(response: unknown, status = 200) {
  const requests: { url: URL; init: RequestInit | undefined }[] = [];
  const client = createClient<AgentBDatabase>("https://project.example.invalid", "sb_publishable_test_fixture", {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: async (input, init) => {
      requests.push({ url: new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url), init });
      return new Response(JSON.stringify(response), { status, headers: { "Content-Type": "application/json" } });
    } },
  });
  return { repository: new SupabaseDiscoveryPersistence(client), requests };
}

test("B02 persistence adapter scopes access queries by discovery and identity", async () => {
  const f = repositoryFixture([{ discovery_id: discoveryId, identity_id: userId, role: "OWNER" }]);
  const access = await f.repository.findAccess(discovery, actor);
  assert.equal(access?.identityId, actor);
  assert.equal(f.requests[0].url.searchParams.get("discovery_id"), `eq.${discoveryId}`);
  assert.equal(f.requests[0].url.searchParams.get("identity_id"), `eq.${userId}`);
});

test("B02 persistence adapter distinguishes missing roots and validates root data", async () => {
  const missing = repositoryFixture([]);
  assert.equal(await missing.repository.readRoot(discovery), null);
  const found = repositoryFixture([row]);
  assert.equal((await found.repository.readRoot(discovery))?.discoveryId, discovery);
  const invalid = repositoryFixture([{ ...row, entity_version: "not-a-version" }]);
  await assert.rejects(invalid.repository.readRoot(discovery), errorCode("PROVIDER_UNAVAILABLE"));
});

test("B02 persistence adapter creates root and access using one expected-identity RPC", async () => {
  const f = repositoryFixture(row);
  assert.equal((await f.repository.createOwnedRoot(actor)).ownerId, actor);
  assert.equal(f.requests.length, 1);
  assert.ok(f.requests[0].url.pathname.endsWith("/rpc/agent_b_create_owned_discovery"));
  assert.deepEqual(JSON.parse(String(f.requests[0].init?.body)), { p_expected_identity: userId });
});

test("B02 persistence adapter sends entity CAS arguments without runtime version", async () => {
  const f = repositoryFixture({ ...row, entity_version: 1 });
  assert.equal((await f.repository.advanceEntityVersion(discovery, actor, version)).entityVersion, 1);
  assert.equal(f.requests.length, 1);
  assert.deepEqual(JSON.parse(String(f.requests[0].init?.body)), {
    p_discovery_id: discoveryId, p_expected_identity: userId, p_expected_version: 0,
  });
});

test("B02 persistence adapter maps database denials and conflicts without provider details", async () => {
  for (const [code, expected] of [["42501", "ACCESS_DENIED"], ["40001", "CONCURRENT_MODIFICATION"], ["22023", "INVALID_INPUT"], ["OTHER", "PROVIDER_UNAVAILABLE"]]) {
    const f = repositoryFixture({ code, message: "private-provider-response", details: "private-details", hint: "" }, 400);
    await assert.rejects(f.repository.advanceEntityVersion(discovery, actor, version), errorCode(expected));
  }
});
