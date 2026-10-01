import { z } from "zod";
import type { CaptureEvaluation } from "./information-capture.ts";
import type { CanonicalInformationField } from "./canonical-information.ts";
import { DiscoveryIdSchema, SessionIdSchema } from "./primitives.ts";

export const CONVERSATION_STATE_SCHEMA_VERSION = 1;
export const DISCOVERY_AGENDA_VERSION = 1;
export const DISCOVERY_AGENDA_STATUS = "PROVISIONAL_FOR_HUMAN_GOVERNANCE_REVIEW" as const;
export const UNKNOWN_PENDING_CLARIFICATION = "UNKNOWN_CRITICAL_PENDING" as const;

export const AgendaTopicIdSchema = z.enum([
  "topic.primary_objective",
  "topic.desired_state",
  "topic.success_criteria",
  "topic.subject_context",
  "topic.constraints",
  "topic.current_state",
]);
export type AgendaTopicId = z.infer<typeof AgendaTopicIdSchema>;

export const ClarificationPhaseSchema = z.enum([
  "NONE", "INITIAL", "FOLLOW_UP", "USER_STATED_UNKNOWN", "DEFERRED",
]);

export const ConversationalStateSchema = z.strictObject({
  schemaVersion: z.literal(CONVERSATION_STATE_SCHEMA_VERSION),
  agendaVersion: z.literal(DISCOVERY_AGENDA_VERSION),
  discoveryId: DiscoveryIdSchema,
  sessionId: SessionIdSchema,
  activeClarificationId: z.literal(UNKNOWN_PENDING_CLARIFICATION).nullable(),
  clarificationPhase: ClarificationPhaseSchema,
  deferredClarificationIds: z.array(z.literal(UNKNOWN_PENDING_CLARIFICATION)).max(1),
  askedTopicIds: z.array(AgendaTopicIdSchema).max(6),
  nextAgendaTopicId: AgendaTopicIdSchema.nullable(),
  clarificationAttempt: z.number().int().min(0).max(5),
  unknownDeclarationCount: z.number().int().min(0).max(5),
}).superRefine((state, context) => {
  if (new Set(state.deferredClarificationIds).size !== state.deferredClarificationIds.length) {
    context.addIssue({ code: "custom", path: ["deferredClarificationIds"], message: "Duplicate deferred clarification" });
  }
  if (new Set(state.askedTopicIds).size !== state.askedTopicIds.length) {
    context.addIssue({ code: "custom", path: ["askedTopicIds"], message: "Duplicate agenda topic" });
  }
  if (state.nextAgendaTopicId && !state.askedTopicIds.includes(state.nextAgendaTopicId)) {
    context.addIssue({ code: "custom", path: ["nextAgendaTopicId"], message: "Next topic must be in the asked-topic ledger" });
  }
  const activePhase = ["INITIAL", "FOLLOW_UP", "USER_STATED_UNKNOWN"].includes(state.clarificationPhase);
  if (activePhase !== (state.activeClarificationId === UNKNOWN_PENDING_CLARIFICATION)) {
    context.addIssue({ code: "custom", path: ["activeClarificationId"], message: "Clarification phase and active axis disagree" });
  }
  if (state.clarificationPhase === "DEFERRED" &&
      (state.activeClarificationId !== null || !state.deferredClarificationIds.includes(UNKNOWN_PENDING_CLARIFICATION))) {
    context.addIssue({ code: "custom", path: ["clarificationPhase"], message: "Deferred phase requires a deferred, inactive axis" });
  }
});
export type ConversationalState = z.infer<typeof ConversationalStateSchema>;

export const PHASE_1_DISCOVERY_AGENDA: readonly { id: AgendaTopicId; relatedConcept: CanonicalInformationField; prompt: string }[] = Object.freeze([
  { id: "topic.primary_objective", relatedConcept: "field.primary_objective", prompt: "Qual é o principal resultado que vocês gostariam de alcançar com essa operação?" },
  { id: "topic.desired_state", relatedConcept: "field.desired_state", prompt: "Como vocês gostariam que o controle de estoque funcionasse na operação futura?" },
  { id: "topic.success_criteria", relatedConcept: "field.success_criteria", prompt: "O que indicaria que o controle de estoque está funcionando melhor?" },
  { id: "topic.subject_context", relatedConcept: "field.subject_context", prompt: "Que parte da iniciativa ou da operação vocês querem estruturar primeiro?" },
  { id: "topic.constraints", relatedConcept: "field.constraints", prompt: "Quais limites conhecidos devem ser considerados? Se nenhum for conhecido, isso pode permanecer em aberto." },
  { id: "topic.current_state", relatedConcept: "field.current_state", prompt: "Como essa operação acontece hoje?" },
]);

export type ExplicitUnknownSignals = Readonly<{ unknown: boolean; defer: boolean }>;

const unknownPatterns = [
  /^(?:(?:neste momento|atualmente|por enquanto)\s+)?(?:ainda\s+)?não sabemos\b/u,
  /^(?:(?:neste momento|atualmente|por enquanto)\s+)?(?:ainda\s+)?não temos\s+(?:essa|esta)\s+(?:informação|definição|condição|dependência)\b/u,
  /^(?:(?:neste momento|atualmente|por enquanto)\s+)?(?:isso|essa definição|essas definições|essas condições|essas dependências)\s+(?:ainda\s+)?(?:não foi definido|não foi definida|não foram definidas|não existe|não existem|não é conhecida|não são conhecidas)\b/u,
  /^(?:(?:neste momento|atualmente|por enquanto)\s+)?(?:essas definições|essas condições|essas dependências)\s+ainda não são conhecidas\b/u,
];
const deferPatterns = [
  /^(?:vamos\s+)?(?:manter|deixar)\s+(?:(?:esse|este|o)\s+)?(?:ponto\s+)?em\s+aberto\b/u,
  /^(?:vamos\s+)?(?:seguir|continuar)\s+(?:(?:a|com a)\s+)?discovery\b/u,
  /^(?:vamos\s+)?(?:seguir|continuar)\s+(?:(?:com|levantando)\s+)?(?:as\s+)?(?:demais|outras)\s+informações\b/u,
  /^(?:vamos\s+)?voltar\s+(?:(?:a|para)\s+(?:isso|esse ponto)|nisso)\s+(?:depois|mais tarde)\b/u,
];

export function classifyExplicitUnknown(message: string): ExplicitUnknownSignals {
  if (/["'“”‘’]/u.test(message)) return Object.freeze({ unknown: false, defer: false });
  const clauses = message.toLocaleLowerCase("pt-BR").split(/[.!?;\n]+/u).map(clause => clause.trim()).filter(Boolean);
  return Object.freeze({
    unknown: clauses.some(clause => unknownPatterns.some(pattern => pattern.test(clause))),
    defer: clauses.some(clause => deferPatterns.some(pattern => pattern.test(clause))),
  });
}

export function parseBoundConversationalState(input: unknown, discoveryId: string, sessionId: string): ConversationalState | null {
  const parsed = ConversationalStateSchema.safeParse(input);
  return parsed.success && parsed.data.discoveryId === discoveryId && parsed.data.sessionId === sessionId
    ? parsed.data : null;
}

export function createConversationalState(discoveryId: string, sessionId: string, active = true): ConversationalState {
  return ConversationalStateSchema.parse({
    schemaVersion: CONVERSATION_STATE_SCHEMA_VERSION,
    agendaVersion: DISCOVERY_AGENDA_VERSION,
    discoveryId,
    sessionId,
    activeClarificationId: active ? UNKNOWN_PENDING_CLARIFICATION : null,
    clarificationPhase: active ? "INITIAL" : "NONE",
    deferredClarificationIds: [],
    askedTopicIds: [],
    nextAgendaTopicId: null,
    clarificationAttempt: 0,
    unknownDeclarationCount: 0,
  });
}

export type ConversationProgression =
  | "NO_TURN"
  | "INITIAL"
  | "ACCEPTED_CAPTURE"
  | "NONPERSISTED_FOLLOW_UP"
  | "FOLLOW_UP"
  | "USER_STATED_UNKNOWN"
  | "DEFERRED"
  | "AGENDA_CONTINUATION"
  | "CAPTURE_CLARIFICATION"
  | "GOVERNED_ACTION";

export function transitionConversationalState(input: {
  prior: unknown;
  discoveryId: string;
  sessionId: string;
  action: { kind: "ABSTAIN"; reason: string } | { kind: "SUBSTANTIVE" };
  message: string;
  acceptedCapture: number;
  evaluations: readonly CaptureEvaluation[];
}): { state: ConversationalState; progression: ConversationProgression } {
  const prior = parseBoundConversationalState(input.prior, input.discoveryId, input.sessionId);
  let state = prior ?? createConversationalState(input.discoveryId, input.sessionId,
    input.action.kind === "ABSTAIN" && input.action.reason === "UNKNOWN_CRITICAL_PENDING");

  if (input.action.kind !== "ABSTAIN" || input.action.reason !== "UNKNOWN_CRITICAL_PENDING") {
    state = ConversationalStateSchema.parse({ ...state, activeClarificationId: null, clarificationPhase: "NONE", nextAgendaTopicId: null });
    return { state, progression: "GOVERNED_ACTION" };
  }

  const signals = classifyExplicitUnknown(input.message);
  if (signals.defer && (signals.unknown || state.activeClarificationId === UNKNOWN_PENDING_CLARIFICATION)) {
    const deferred = ConversationalStateSchema.parse({
      ...state,
      activeClarificationId: null,
      clarificationPhase: "DEFERRED",
      deferredClarificationIds: [UNKNOWN_PENDING_CLARIFICATION],
      clarificationAttempt: 0,
      unknownDeclarationCount: Math.min(5, state.unknownDeclarationCount + 1),
    });
    return selectAgendaTopic(deferred, "DEFERRED");
  }

  if (input.evaluations.some(e => e.outcome === "REQUIRE_HUMAN_DECISION" || e.outcome === "REQUIRE_CLARIFICATION")) {
    return { state, progression: "CAPTURE_CLARIFICATION" };
  }

  if ((state.clarificationPhase === "DEFERRED" || state.clarificationPhase === "NONE") &&
      state.deferredClarificationIds.includes(UNKNOWN_PENDING_CLARIFICATION)) {
    return selectAgendaTopic(state, "AGENDA_CONTINUATION");
  }

  const active = state.activeClarificationId === UNKNOWN_PENDING_CLARIFICATION
    ? state
    : ConversationalStateSchema.parse({ ...state, activeClarificationId: UNKNOWN_PENDING_CLARIFICATION, clarificationPhase: "INITIAL" });
  if (signals.unknown) {
    return {
      state: ConversationalStateSchema.parse({ ...active, clarificationPhase: "USER_STATED_UNKNOWN", unknownDeclarationCount: Math.min(5, active.unknownDeclarationCount + 1) }),
      progression: "USER_STATED_UNKNOWN",
    };
  }
  if (input.acceptedCapture > 0) {
    return {
      state: ConversationalStateSchema.parse({ ...active, clarificationPhase: "FOLLOW_UP", clarificationAttempt: Math.min(5, active.clarificationAttempt + 1) }),
      progression: "ACCEPTED_CAPTURE",
    };
  }
  if (!prior) return { state: active, progression: "INITIAL" };
  if (active.clarificationPhase === "INITIAL") {
    return { state: ConversationalStateSchema.parse({ ...active, clarificationPhase: "FOLLOW_UP", clarificationAttempt: 1 }), progression: "NONPERSISTED_FOLLOW_UP" };
  }
  if (active.clarificationPhase === "USER_STATED_UNKNOWN") {
    return {
      state: ConversationalStateSchema.parse({ ...active, unknownDeclarationCount: Math.min(5, active.unknownDeclarationCount + 1) }),
      progression: "USER_STATED_UNKNOWN",
    };
  }
  return {
    state: ConversationalStateSchema.parse({ ...active, clarificationPhase: "FOLLOW_UP", clarificationAttempt: Math.min(5, active.clarificationAttempt + 1) }),
    progression: "FOLLOW_UP",
  };
}

function selectAgendaTopic(state: ConversationalState, progression: "DEFERRED" | "AGENDA_CONTINUATION") {
  if (state.deferredClarificationIds.includes(UNKNOWN_PENDING_CLARIFICATION) && state.clarificationPhase !== "DEFERRED") {
    state = ConversationalStateSchema.parse({ ...state, activeClarificationId: null, clarificationPhase: "DEFERRED" });
  }
  const next = PHASE_1_DISCOVERY_AGENDA.find(topic => !state.askedTopicIds.includes(topic.id));
  const updated = ConversationalStateSchema.parse({
    ...state,
    askedTopicIds: next ? [...state.askedTopicIds, next.id] : state.askedTopicIds,
    nextAgendaTopicId: next?.id ?? null,
  });
  return { state: updated, progression };
}

export function agendaTopic(id: AgendaTopicId | null) {
  return id ? PHASE_1_DISCOVERY_AGENDA.find(topic => topic.id === id) ?? null : null;
}