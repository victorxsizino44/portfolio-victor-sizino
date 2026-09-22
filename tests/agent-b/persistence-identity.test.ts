import assert from "node:assert/strict";
import { test } from "node:test";
import { DiscoveryFoundation } from "../../lib/agent-b/application/discovery-foundation.ts";
import { IdentityFoundation } from "../../lib/agent-b/application/identity-foundation.ts";
import { AuthenticatedIdentitySchema, DiscoveryAccessSchema, DiscoveryCapabilitySchema, DiscoveryRootSchema, FoundationError } from "../../lib/agent-b/core/identity-access.ts";
import { EntityVersionSchema } from "../../lib/agent-b/core/primitives.ts";
import type { IdentityPort } from "../../lib/agent-b/ports/identity.ts";
import type { DiscoveryPersistencePort } from "../../lib/agent-b/ports/discovery-persistence.ts";
import { getAgentBRuntimeConfig } from "../../lib/agent-b/infrastructure/config.server.ts";

const owner = AuthenticatedIdentitySchema.parse({ identityId: "owner-1", kind: "ANONYMOUS" });
const other = AuthenticatedIdentitySchema.parse({ identityId: "owner-2", kind: "EMAIL_VERIFIED" });
const root = DiscoveryRootSchema.parse({ discoveryId: "discovery-1", ownerId: owner.identityId, entityVersion: 0, createdAt: "2026-09-22T00:00:00Z" });
const access = DiscoveryAccessSchema.parse({ discoveryId: root.discoveryId, identityId: owner.identityId, role: "OWNER" });
const errorCode = (code: string) => (error: unknown) => error instanceof FoundationError && error.code === code;

// Test doubles only. This is NOT PostgreSQL/RLS integration validation.
function fixture() {
  let current: Awaited<ReturnType<IdentityPort["current"]>> = owner;
  const calls: string[] = [];
  const identity: IdentityPort = {
    current: async () => current,
    signInAnonymously: async () => { calls.push("anonymous"); current = owner; return owner; },
    requestEmailUpgrade: async () => { calls.push("request-email"); },
    verifyEmailUpgrade: async (identityId) => {
      calls.push("verify-email");
      current = { identityId, kind: "EMAIL_VERIFIED" };
      return current;
    },
  };
  const persistence: DiscoveryPersistencePort = {
    findAccess: async (discoveryId, identityId) => {
      calls.push("access");
      return discoveryId === root.discoveryId && identityId === owner.identityId ? access : null;
    },
    readRoot: async () => { calls.push("read"); return root; },
    createOwnedRoot: async () => { calls.push("create"); return root; },
    advanceEntityVersion: async (_id, _owner, expected) => {
      calls.push("advance");
      return { ...root, entityVersion: EntityVersionSchema.parse(expected + 1) };
    },
  };
  return { identity, persistence, calls, setCurrent: (value: typeof current) => { current = value; }, service: new DiscoveryFoundation(identity, persistence) };
}

test("B02 unauthenticated material operations fail before reaching persistence", async () => {
  const f = fixture(); f.setCurrent(null);
  await assert.rejects(f.service.createOwnedDiscovery(), errorCode("AUTHENTICATION_REQUIRED"));
  await assert.rejects(f.service.readRoot(root.discoveryId), errorCode("AUTHENTICATION_REQUIRED"));
  await assert.rejects(f.service.advanceEntityVersion({ discoveryId: root.discoveryId, expectedEntityVersion: 0 }), errorCode("AUTHENTICATION_REQUIRED"));
  assert.deepEqual(f.calls, []);
});

test("B02 anonymous authenticated owners can create and read their operational root", async () => {
  const f = fixture();
  assert.deepEqual(await f.service.createOwnedDiscovery(), root);
  assert.deepEqual(await f.service.readRoot(root.discoveryId), root);
});

test("B02 another verified identity gains no authorization to an owned discovery", async () => {
  const f = fixture(); f.setCurrent(other);
  await assert.rejects(f.service.readRoot(root.discoveryId), errorCode("ACCESS_DENIED"));
  await assert.rejects(f.service.advanceEntityVersion({ discoveryId: root.discoveryId, expectedEntityVersion: 0 }), errorCode("ACCESS_DENIED"));
  assert.ok(!f.calls.includes("read") && !f.calls.includes("advance"));
});

test("B02 an owner cannot use one discovery's access to read another discovery", async () => {
  const f = fixture();
  await assert.rejects(f.service.readRoot("discovery-2"), errorCode("ACCESS_DENIED"));
  // Even a faulty adapter returning a different root's access must be denied.
  f.persistence.findAccess = async () => access;
  await assert.rejects(f.service.readRoot("discovery-2"), errorCode("ACCESS_DENIED"));
});

test("B02 access identity and root ownership must both match the authenticated principal", async () => {
  const f = fixture();
  f.persistence.findAccess = async () => ({ ...access, identityId: other.identityId });
  await assert.rejects(f.service.readRoot(root.discoveryId), errorCode("ACCESS_DENIED"));
  f.persistence.findAccess = async () => access;
  f.persistence.readRoot = async () => ({ ...root, ownerId: other.identityId });
  await assert.rejects(f.service.readRoot(root.discoveryId), errorCode("ACCESS_DENIED"));
});

test("B02 CAS rejects stale entity version and forwards a current version", async () => {
  const f = fixture();
  await assert.rejects(f.service.advanceEntityVersion({ discoveryId: root.discoveryId, expectedEntityVersion: 2 }), errorCode("CONCURRENT_MODIFICATION"));
  assert.ok(!f.calls.includes("advance"));
  assert.equal((await f.service.advanceEntityVersion({ discoveryId: root.discoveryId, expectedEntityVersion: 0 })).entityVersion, 1);
});

test("B02 application propagates database CAS races without retry or state fabrication", async () => {
  const f = fixture();
  f.persistence.advanceEntityVersion = async () => { throw new FoundationError("CONCURRENT_MODIFICATION"); };
  await assert.rejects(f.service.advanceEntityVersion({ discoveryId: root.discoveryId, expectedEntityVersion: 0 }), errorCode("CONCURRENT_MODIFICATION"));
});

test("B02 runtime version cannot be supplied in place of an entity version field", async () => {
  const f = fixture();
  await assert.rejects(f.service.advanceEntityVersion({ discoveryId: root.discoveryId, runtimeVersion: 0 }), errorCode("INVALID_INPUT"));
  assert.equal("runtimeVersion" in root, false);
});

test("B02 ownership capabilities never grant semantic or human governance authority", () => {
  assert.equal(DiscoveryCapabilitySchema.safeParse("APPROVE_BRIEFING").success, false);
  assert.equal(DiscoveryAccessSchema.safeParse({ ...access, humanGovernance: true }).success, false);
  assert.equal(DiscoveryRootSchema.safeParse({ ...root, completion: "COMPLETE" }).success, false);
});

test("B02 identity initialization preserves an existing identity", async () => {
  const f = fixture();
  const identity = new IdentityFoundation(f.identity);
  assert.deepEqual(await identity.ensureAuthenticatedIdentity(), owner);
  assert.ok(!f.calls.includes("anonymous"));
  f.setCurrent(null);
  assert.deepEqual(await identity.ensureAuthenticatedIdentity(), owner);
  assert.deepEqual(f.calls, ["anonymous"]);
});

test("B02 email upgrade keeps the same discovery, owner and access without persistence mutations", async () => {
  const f = fixture();
  const identity = new IdentityFoundation(f.identity);
  await identity.requestEmailUpgrade({ email: "person@example.invalid" });
  const upgraded = await identity.verifyEmailUpgrade({ email: "person@example.invalid", token: "test-otp" });
  assert.equal(upgraded.identityId, owner.identityId);
  assert.equal(upgraded.kind, "EMAIL_VERIFIED");
  assert.deepEqual(f.calls, ["request-email", "verify-email"]);
  assert.deepEqual(await f.service.readRoot(root.discoveryId), root);
});

test("B02 email upgrade rejects a change of identity and an unverified result", async () => {
  const f = fixture();
  const identity = new IdentityFoundation(f.identity);
  f.identity.verifyEmailUpgrade = async () => other;
  await assert.rejects(identity.verifyEmailUpgrade({ email: "person@example.invalid", token: "test-otp" }), errorCode("IDENTITY_CONTINUITY_FAILED"));
  f.identity.verifyEmailUpgrade = async () => owner;
  await assert.rejects(identity.verifyEmailUpgrade({ email: "person@example.invalid", token: "test-otp" }), errorCode("EMAIL_VERIFICATION_REQUIRED"));
});

test("B02 identity requests reject absent identity and password/social extras", async () => {
  const f = fixture(); const identity = new IdentityFoundation(f.identity);
  f.setCurrent(null);
  await assert.rejects(identity.requestEmailUpgrade({ email: "person@example.invalid" }), errorCode("AUTHENTICATION_REQUIRED"));
  await assert.rejects(identity.requestEmailUpgrade({ email: "person@example.invalid", password: "unsupported" }), errorCode("INVALID_INPUT"));
  await assert.rejects(identity.verifyEmailUpgrade({ provider: "unsupported" }), errorCode("INVALID_INPUT"));
  assert.deepEqual(f.calls, []);
});

test("B02 runtime configuration is explicit, frozen and accepts only publishable key format", () => {
  const input = { NEXT_PUBLIC_SUPABASE_URL: "https://project.example.invalid", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test_fixture" };
  const config = getAgentBRuntimeConfig(input);
  assert.ok(Object.isFrozen(config) && Object.isFrozen(config.supabase));
  assert.throws(() => getAgentBRuntimeConfig({ NEXT_PUBLIC_SUPABASE_URL: input.NEXT_PUBLIC_SUPABASE_URL }), errorCode("CONFIGURATION_REQUIRED"));
  for (const key of ["sb_secret_test_fixture", "eyJ.test.fixture", ""]) {
    assert.throws(() => getAgentBRuntimeConfig({ ...input, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key }), errorCode("CONFIGURATION_REQUIRED"));
  }
  assert.throws(() => getAgentBRuntimeConfig({ ...input, NEXT_PUBLIC_SUPABASE_URL: "https://user:password@project.example.invalid" }), errorCode("CONFIGURATION_REQUIRED"));
});
