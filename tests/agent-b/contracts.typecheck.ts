import type {
  DiscoveryId, SessionId, InformationRecordId, FieldId, DomainId, SourceId,
  EvidenceId, HumanDecisionId, ScopeSegmentId, SpecializationId,
  EntityVersion, RuntimeVersion,
} from "../../lib/agent-b/core/primitives.ts";
import type { CompletionContract } from "../../lib/agent-b/core/mc01.ts";
import type { DemandClassificationContract } from "../../lib/agent-b/core/mc02.ts";

// Compiled by the standard typecheck gate, with no runtime ID generation.
type AssertFalse<T extends false> = T;
type AssertTrue<T extends true> = T;
type Assignable<A, B> = [A] extends [B] ? true : false;

export type NominalContractChecks = [
  AssertFalse<Assignable<string, DiscoveryId>>,
  AssertFalse<Assignable<SessionId, DiscoveryId>>,
  AssertFalse<Assignable<DiscoveryId, SessionId>>,
  AssertFalse<Assignable<FieldId, DomainId>>,
  AssertFalse<Assignable<DomainId, FieldId>>,
  AssertFalse<Assignable<InformationRecordId, FieldId>>,
  AssertFalse<Assignable<SourceId, EvidenceId>>,
  AssertFalse<Assignable<EvidenceId, SourceId>>,
  AssertFalse<Assignable<SourceId, HumanDecisionId>>,
  AssertFalse<Assignable<ScopeSegmentId, DiscoveryId>>,
  AssertFalse<Assignable<SpecializationId, ScopeSegmentId>>,
  AssertFalse<Assignable<EntityVersion, RuntimeVersion>>,
  AssertFalse<Assignable<RuntimeVersion, EntityVersion>>,
  AssertFalse<Assignable<number, EntityVersion>>,
  AssertFalse<Assignable<number, RuntimeVersion>>,
  AssertTrue<Assignable<undefined, DemandClassificationContract["primaryNature"]>>,
  AssertTrue<Assignable<string[], NonNullable<DemandClassificationContract["primaryNature"]>>>,
  AssertFalse<Assignable<undefined, Extract<CompletionContract, { status: "COMPLETE" }>["humanDecision"]>>,
];
