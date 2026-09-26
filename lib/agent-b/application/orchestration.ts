import { OrchestrationContextSchema, ActionCandidateSchema, type ActionCandidate, type AbstentionActionCandidate, type SubstantiveActionCandidate } from "../core/mc03.ts";
import { FoundationError } from "../core/identity-access.ts";
export class GovernedOrchestration {
  evaluate(input: unknown): ActionCandidate {
    const parsed = OrchestrationContextSchema.safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const c = parsed.data;
    const base = { discoveryId: c.discoveryId, runtimeVersion: c.runtimeVersion };
    const abstain = (reason: AbstentionActionCandidate["reason"], resolution: AbstentionActionCandidate["resolution"]): ActionCandidate =>
      ActionCandidateSchema.parse({ ...base, kind: "ABSTAIN", reason, resolution });
    const act = (interaction: SubstantiveActionCandidate["interaction"], navigation: SubstantiveActionCandidate["navigation"], progression: SubstantiveActionCandidate["progression"], rationale: string, requiresHumanDecision: boolean): ActionCandidate =>
      ActionCandidateSchema.parse({ ...base, kind: "SUBSTANTIVE", interaction, navigation, progression, rationale, requiresHumanDecision });
    if (!c.sufficientGovernedContext) return abstain("INSUFFICIENT_GOVERNED_CONTEXT", "BLOCK");
    // These known facts determine the action independently of unknown catalog data.
    if (c.conflictingState || c.informationNeed === "CONFLICT_REQUIRES_RESOLUTION") return act("CLARIFY", "RETURN", "BLOCK", "Conflito governado requer clarificação.", true);
    if (c.unresolvedCriticalPending === "TRUE") return act("REQUEST_EVIDENCE", "TRANSITION", "DEFER", "Dependência crítica permanece pendente.", false);
    if (c.unresolvedCriticalPending === "UNKNOWN") return abstain("UNKNOWN_CRITICAL_PENDING", "ESCALATE");
    if (c.informationNeed === "CLARIFICATION_REQUIRED") return act("CLARIFY", "RETURN", "CONTINUE", "Contexto governado requer clarificação.", false);
    if (c.informationNeed === "EVIDENCE_REQUIRED") return act("REQUEST_EVIDENCE", "TRANSITION", "DEFER", "Necessidade governada de evidência permanece.", false);
    if (c.informationNeed === "UNRESOLVED_DEPENDENCY" || c.informationNeed === "MISSING_REQUIRED_INFORMATION") return act("DEEPEN", "TRANSITION", "CONTINUE", "Necessidade governada de informação requer aprofundamento.", false);
    if (c.informationNeed === "UNKNOWN") return abstain("UNKNOWN_INFORMATION_NEED", "CLARIFY");
    if (c.missingFieldCount === null) return abstain("UNKNOWN_MISSING_FIELD_COUNT", "REQUEST_EVIDENCE");
    if (!c.hasCurrentInformation || c.missingFieldCount > 0) return act("EXPLORE", "TRANSITION", "CONTINUE", "Contexto governado requer exploração.", false);
    return act("CONFIRM", "TRANSITION", "PAUSE", "Estado pronto para confirmação explícita.", true);
  }
}
