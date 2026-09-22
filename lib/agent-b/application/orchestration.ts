import { OrchestrationContextSchema, ActionCandidateSchema, type ActionCandidate } from "../core/mc03.ts";
import { FoundationError } from "../core/identity-access.ts";
export class GovernedOrchestration {
  evaluate(input: unknown): ActionCandidate {
    const parsed = OrchestrationContextSchema.safeParse(input); if (!parsed.success) throw new FoundationError("INVALID_INPUT"); const c=parsed.data;
    if (c.conflictingState) return ActionCandidateSchema.parse({ discoveryId:c.discoveryId,runtimeVersion:c.runtimeVersion,interaction:"CLARIFY",navigation:"RETURN",progression:"BLOCK",rationale:"Conflito governado requer clarificação.",requiresHumanDecision:true });
    if (c.unresolvedCriticalPending) return ActionCandidateSchema.parse({ discoveryId:c.discoveryId,runtimeVersion:c.runtimeVersion,interaction:"REQUEST_EVIDENCE",navigation:"TRANSITION",progression:"DEFER",rationale:"Dependência crítica permanece pendente.",requiresHumanDecision:false });
    if (!c.hasCurrentInformation || c.missingFieldCount>0 && !c.informationNeed) return ActionCandidateSchema.parse({ discoveryId:c.discoveryId,runtimeVersion:c.runtimeVersion,interaction:"EXPLORE",navigation:"TRANSITION",progression:"CONTINUE",rationale:"Contexto governado ainda requer exploração.",requiresHumanDecision:false });
    if (c.informationNeed) return ActionCandidateSchema.parse({ discoveryId:c.discoveryId,runtimeVersion:c.runtimeVersion,interaction:"DEEPEN",navigation:"TRANSITION",progression:"CONTINUE",rationale:"Necessidade de informação requer aprofundamento.",requiresHumanDecision:false });
    return ActionCandidateSchema.parse({ discoveryId:c.discoveryId,runtimeVersion:c.runtimeVersion,interaction:"CONFIRM",navigation:"TRANSITION",progression:"PAUSE",rationale:"Estado pronto para confirmação explícita.",requiresHumanDecision:true });
  }
}
