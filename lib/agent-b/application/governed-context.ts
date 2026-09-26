import { bindingKey } from "../core/domain-binding.ts";
import { resolveInformationReferences } from "../core/current-information.ts";
import { OrchestrationContextSchema, type OrchestrationContext } from "../core/mc03.ts";
import { FoundationError } from "../core/identity-access.ts";
import { GovernedOrchestration } from "./orchestration.ts";
import { ContextRequestSchema, GovernedContextSnapshotSchema, type GovernedContextSnapshot, type ContextRequest, type GovernedContextReadPort } from "../ports/governed-context.ts";
import type { IdentityPort } from "../ports/identity.ts";
import type { DiscoveryPersistencePort } from "../ports/discovery-persistence.ts";

export function deriveGovernedContext(request: ContextRequest, snapshot: GovernedContextSnapshot): OrchestrationContext {
  const { runtime, session, classification, scope, catalog, dependencies } = snapshot;
  // Foreign data is an authorization/integrity failure, never context to repair.
  if ([runtime, session, classification, scope, ...snapshot.information].some(v => v && v.discoveryId !== request.discoveryId) ||
      (session && session.sessionId !== request.sessionId)) throw new FoundationError("ACCESS_DENIED");
  if (dependencies?.some(d => d.contract.target.kind === "DISCOVERY" && d.contract.target.discoveryId !== request.discoveryId)) throw new FoundationError("ACCESS_DENIED");
  const current = runtime?.current;
  let refs;
  try { refs = resolveInformationReferences(current ?? {}, snapshot.information, request.discoveryId); }
  catch { throw new FoundationError("PROVIDER_UNAVAILABLE"); }
  const ids = refs.flatMap(r => r.recordIds);
  const currentInformation = snapshot.information.filter(r => ids.includes(r.recordId));
  const linkedSession = !!runtime && !!session && session.lifecycle === "OPEN" && current?.sessionId === session.sessionId;
  const classificationCurrent = !!classification && classification.entityVersion === current?.classificationVersion;
  const scopeCurrent = !!scope && scope.entityVersion === current?.scopeVersion;
  const reliable = linkedSession && runtime?.freshness === "CURRENT" &&
    (currentInformation.length === ids.length) &&
    (current?.classificationVersion === undefined || classificationCurrent) &&
    (current?.scopeVersion === undefined || scopeCurrent);
  // Segment bindings are composed from governed definitions before this projection.
  const scopeDeterminate = reliable && scopeCurrent && (scope.kind === "ONE_DISCOVERY" ? scope.applicability === "APPLICABLE" :
    new Set(scope.segments.map(s => s.segmentId)).size === scope.segments.length);
  const catalogReliable = scopeDeterminate && catalog?.complete === true &&
    new Set(catalog.fields.map(f => bindingKey(f) + "/" + f.fieldId)).size === catalog.fields.length &&
    catalog.fields.every(f => !f.required || f.applicability === "APPLICABLE" || f.applicability === "EXCLUDED");
  const requiredFields = catalog?.fields.filter(f => f.required && f.applicability === "APPLICABLE") ?? [];
  const missingFields = requiredFields.filter(f => !currentInformation.some(r => r.fieldId === f.fieldId && bindingKey(r) === bindingKey(f)));
  // Evidence validity is deliberately irrelevant to presence.
  const missingFieldCount = catalogReliable ? missingFields.length : null;
  const pending = runtime?.pending.filter(p => p.state === "PENDING") ?? [];
  const pendingIds = current?.pendingIds ?? [];
  const pendingReliable = !!runtime && new Set(runtime.pending.map(p => p.pendingId)).size === runtime.pending.length &&
    pending.every(p => pendingIds.includes(p.pendingId)) &&
    pendingIds.every(id => runtime.pending.some(p => p.pendingId === id && p.state === "PENDING"));
  const dependencyUnique = dependencies !== null && new Set(dependencies.map(d => d.contract.dependencyId)).size === dependencies.length;
  let unknownPending = !pendingReliable || !dependencyUnique;
  let critical = false;
  for (const p of pending) {
    const matches = dependencyUnique && p.dependencyId ? dependencies.filter(d => d.contract.dependencyId === p.dependencyId) : [];
    const d = matches.length === 1 ? matches[0] : undefined;
    if (!d || d.applicability === "CANDIDATE" || d.applicability === "UNRESOLVED") { unknownPending = true; continue; }
    if (d.applicability === "APPLICABLE" && d.contract.critical && d.contract.status !== "SATISFIED") critical = true;
    // A satisfied dependency behind a PENDING item is inconsistent, not FALSE.
    if (d.applicability === "APPLICABLE" && d.contract.status === "SATISFIED") unknownPending = true;
  }
  const unresolvedCriticalPending = critical ? "TRUE" : unknownPending ? "UNKNOWN" : "FALSE";
  const conflictingState = classificationCurrent && classification.understandingState === "CONFLICTING";
  let informationNeed: OrchestrationContext["informationNeed"] = "UNKNOWN";
  const unresolved = dependencyUnique ? dependencies.filter(d => d.applicability === "APPLICABLE" && d.contract.status !== "SATISFIED") : [];
  if (conflictingState) informationNeed = "CONFLICT_REQUIRES_RESOLUTION";
  else if (classificationCurrent && classification.understandingState === "AMBIGUOUS") informationNeed = "CLARIFICATION_REQUIRED";
  else if (currentInformation.some(r => r.validation.steps.some(s => s.stage === "EVIDENCE_CORRELATION" && s.result.status === "FAILED"))) informationNeed = "EVIDENCE_REQUIRED";
  else if (unresolved.some(d => d.contract.target.kind === "FIELD" && missingFields.some(f => d.contract.target.kind === "FIELD" && f.fieldId === d.contract.target.fieldId)) && catalogReliable) informationNeed = "MISSING_REQUIRED_INFORMATION";
  else if (unresolved.length > 0) informationNeed = "UNRESOLVED_DEPENDENCY";
  // Positive absence requires complete inputs, not empty/default arrays.
  else if (reliable && classificationCurrent && classification.understandingState === "UNDERSTOOD" &&
    catalogReliable && missingFieldCount === 0 && dependencyUnique &&
    dependencies.every(d => d.applicability === "EXCLUDED" || (d.applicability === "APPLICABLE" && d.contract.status === "SATISFIED")) &&
    unresolvedCriticalPending === "FALSE" && currentInformation.length > 0 &&
    currentInformation.every(r => r.validation.steps.every(s => s.result.status === "PASSED"))) informationNeed = "NONE";
  return OrchestrationContextSchema.parse({
    discoveryId: request.discoveryId, sessionId: request.sessionId,
    runtimeVersion: runtime?.runtimeVersion ?? 0, hasCurrentInformation: currentInformation.length > 0,
    conflictingState, missingFieldCount, unresolvedCriticalPending, informationNeed,
    sufficientGovernedContext: reliable,
  });
}

export class GovernedContextResolver {
  private readonly identity: IdentityPort;
  private readonly access: Pick<DiscoveryPersistencePort, "readRoot" | "findAccess">;
  private readonly repository: GovernedContextReadPort;
  constructor(identity: IdentityPort, access: Pick<DiscoveryPersistencePort, "readRoot" | "findAccess">, repository: GovernedContextReadPort) {
    this.identity = identity; this.access = access; this.repository = repository;
  }
  async resolve(input: unknown) {
    const request = ContextRequestSchema.safeParse(input);
    if (!request.success) throw new FoundationError("INVALID_INPUT");
    const actor = await this.identity.current();
    if (!actor) throw new FoundationError("AUTHENTICATION_REQUIRED");
    const root = await this.access.readRoot(request.data.discoveryId);
    const access = await this.access.findAccess(request.data.discoveryId, actor.identityId);
    if (!root || root.discoveryId !== request.data.discoveryId || root.ownerId !== actor.identityId ||
      !access || access.discoveryId !== root.discoveryId || access.identityId !== actor.identityId || access.role !== "OWNER") throw new FoundationError("ACCESS_DENIED");
    const snapshot = GovernedContextSnapshotSchema.parse(await this.repository.read(actor.identityId, request.data));
    return deriveGovernedContext(request.data, snapshot);
  }
  async evaluate(input: unknown) {
    return new GovernedOrchestration().evaluate(await this.resolve(input));
  }
}
