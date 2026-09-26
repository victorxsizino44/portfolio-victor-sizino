import { z } from "zod";
import { DiscoveryIdSchema, RuntimeVersionSchema, SessionIdSchema, TimestampSchema } from "../core/primitives.ts";
import { DiscoveryRuntimeSchema, ResumeContextSchema, type ResumeContext } from "../core/mc04.ts";
import { FoundationError } from "../core/identity-access.ts";
import type { IdentityPort } from "../ports/identity.ts";
import type { RuntimePersistencePort } from "../ports/runtime-persistence.ts";
import { InitializeRuntimeSchema, ResumeRuntimeSchema, RuntimeOperationResultSchema } from "../core/runtime-operations.ts";
const id = z.strictObject({ discoveryId: DiscoveryIdSchema });
export class RuntimeFoundation {
  private identity: IdentityPort; private persistence: RuntimePersistencePort;
  constructor(identity: IdentityPort, persistence: RuntimePersistencePort) { this.identity = identity; this.persistence = persistence; }
  private async principal() { const p = await this.identity.current(); if (!p) throw new FoundationError("AUTHENTICATION_REQUIRED"); return p; }
  async read(input: unknown) { const p = id.safeParse(input); if (!p.success) throw new FoundationError("INVALID_INPUT"); const i = await this.principal(); return this.persistence.read({ identityId: i.identityId, ...p.data }); }
  async mutate(input: unknown) { const p = z.strictObject({ discoveryId: DiscoveryIdSchema, expectedRuntimeVersion: RuntimeVersionSchema, runtime: DiscoveryRuntimeSchema }).safeParse(input); if (!p.success || p.data.runtime.discoveryId !== p.data.discoveryId || p.data.runtime.runtimeVersion !== p.data.expectedRuntimeVersion + 1) throw new FoundationError("INVALID_INPUT"); const i = await this.principal(); return this.persistence.mutate({ identityId: i.identityId, ...p.data }); }
  async openSession(input: unknown) { const p = z.strictObject({ discoveryId: DiscoveryIdSchema, sessionId: SessionIdSchema, previousSessionId: SessionIdSchema.nullable(), now: TimestampSchema }).safeParse(input); if (!p.success) throw new FoundationError("INVALID_INPUT"); const i = await this.principal(); return this.persistence.createSession({ identityId: i.identityId, ...p.data }); }
  async transition(input: unknown) { const p = z.strictObject({ discoveryId: DiscoveryIdSchema, sessionId: SessionIdSchema, lifecycle: z.enum(["INTERRUPTED", "CLOSED"]) }).safeParse(input); if (!p.success) throw new FoundationError("INVALID_INPUT"); const i = await this.principal(); return this.persistence.transitionSession({ identityId: i.identityId, ...p.data }); }
  async initialize(input: unknown) {
    const parsed = InitializeRuntimeSchema.safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const actor = await this.principal();
    const result = RuntimeOperationResultSchema.parse(await this.persistence.initializeAtomic({ identityId: actor.identityId, ...parsed.data }));
    if (result.runtime.discoveryId !== parsed.data.discoveryId || result.session.sessionId !== parsed.data.sessionId ||
      result.runtime.runtimeVersion !== 0 || result.session.previousSessionId !== null)
      throw new FoundationError("PROVIDER_UNAVAILABLE");
    return result;
  }
  async resume(input: unknown) {
    const parsed = ResumeRuntimeSchema.safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const actor = await this.principal();
    // No pre-read CAS: accepted replay must reach the transactional ledger.
    // No semantic projection is accepted from the caller.
    const result = RuntimeOperationResultSchema.parse(await this.persistence.resumeAtomic({ identityId: actor.identityId, ...parsed.data }));
    if (result.runtime.discoveryId !== parsed.data.discoveryId || result.session.sessionId !== parsed.data.sessionId ||
      result.runtime.runtimeVersion !== parsed.data.expectedRuntimeVersion + 1 ||
      result.session.previousSessionId !== parsed.data.previousSessionId) throw new FoundationError("PROVIDER_UNAVAILABLE");
    const context: ResumeContext = ResumeContextSchema.parse({
      discoveryId: result.runtime.discoveryId, runtimeVersion: result.runtime.runtimeVersion,
      current: result.runtime.current, pending: result.runtime.pending, previousSessionId: result.session.previousSessionId,
    });
    return { ...result, context };
  }
}
