import { z } from "zod";
import { ProductActionSchema } from "./product-runtime.ts";
import { FoundationError } from "./identity-access.ts";

export const ConversationPromptSchema = z.enum([
  "OPEN_CONTEXT", "CONCRETE_EXAMPLE", "DESIRED_CHANGE", "DEEPEN", "CLARIFY",
  "CONFIRM", "REQUEST_EVIDENCE", "HUMAN_REVIEW", "REVIEW_READINESS", "BLOCKER",
]);
// Untrusted, disposable presentation input. Never supplied to the governed resolver.
export const ConversationInputSchema = z.strictObject({
  message: z.string().trim().min(1).max(2000),
  previousPrompt: ConversationPromptSchema.optional(),
});
export const ConversationResponseSchema = z.strictObject({
  conversationEligible: z.boolean(),
  materialExecutionAllowed: z.literal(false),
  intent: ConversationPromptSchema,
  text: z.string().min(1).max(1200),
});
export type ConversationInput = z.infer<typeof ConversationInputSchema>;
export type ConversationResponse = z.infer<typeof ConversationResponseSchema>;

// Eligibility authorizes wording only, never progression, approval or persistence.
// There is deliberately no AI input or material-acceptance capability here.
export function evaluateConversationEligibility(input: unknown) {
  const parsed = ProductActionSchema.safeParse(input);
  if (!parsed.success) throw new FoundationError("INVALID_INPUT");
  const action = parsed.data;
  let intent: ConversationResponse["intent"];
  if (action.kind === "ABSTAIN") {
    intent = action.reason === "INSUFFICIENT_GOVERNED_CONTEXT" ? "BLOCKER"
      : action.reason === "UNKNOWN_CRITICAL_PENDING" && action.resolution === "ESCALATE" ? "HUMAN_REVIEW"
      : "OPEN_CONTEXT";
  } else {
    const intents = {
      EXPLORE: "OPEN_CONTEXT", DEEPEN: "DEEPEN", CLARIFY: "CLARIFY",
      CONFIRM: "CONFIRM", REQUEST_EVIDENCE: "REQUEST_EVIDENCE",
      ESCALATE: "HUMAN_REVIEW", CLOSE: "REVIEW_READINESS",
    } as const;
    intent = intents[action.interaction];
  }
  return Object.freeze({
    conversationEligible: intent !== "BLOCKER",
    materialExecutionAllowed: false as const,
    intent,
    blocked: action.kind === "SUBSTANTIVE" && action.progression === "BLOCK",
    humanDecisionRequired: action.kind === "SUBSTANTIVE" && action.requiresHumanDecision,
    abstaining: action.kind === "ABSTAIN",
  });
}

export function projectConversation(candidate: unknown, input?: unknown): ConversationResponse {
  // Determine eligibility BEFORE considering any untrusted conversation input.
  const eligibility = evaluateConversationEligibility(candidate);
  const conversation = input === undefined ? undefined : ConversationInputSchema.parse(input);
  let intent: ConversationResponse["intent"] = eligibility.intent;
  // A UI hint varies the question only; it cannot grant eligibility or alter action.
  if (intent === "OPEN_CONTEXT" && conversation) {
    if (conversation.previousPrompt === "OPEN_CONTEXT") intent = "CONCRETE_EXAMPLE";
    else if (conversation.previousPrompt === "CONCRETE_EXAMPLE") intent = "DESIRED_CHANGE";
  }
  const wording: Record<ConversationResponse["intent"], string> = {
    OPEN_CONTEXT: "Que problema você quer resolver e para quem? Se ainda não souber, descreva a situação que motivou sua iniciativa.",
    CONCRETE_EXAMPLE: "Pode dar um exemplo concreto da situação que você descreveu e de como ela é enfrentada hoje?",
    DESIRED_CHANGE: "O que precisaria mudar nessa situação para você considerar a iniciativa útil?",
    DEEPEN: "Sobre o contexto que você trouxe, pode detalhar um exemplo, suas limitações e o resultado que espera alcançar?",
    CLARIFY: eligibility.blocked
      ? "Há interpretações em conflito na definição da iniciativa. Quais são as alternativas e o que precisa ser esclarecido entre elas?"
      : "Qual ponto da informação em discussão admite mais de uma interpretação? Pode explicar o significado pretendido e o que ainda está incerto?",
    CONFIRM: "O entendimento em discussão corresponde ao que você pretende? Indique explicitamente o que confirma e o que precisa corrigir; sua resposta aqui não formaliza uma decisão.",
    REQUEST_EVIDENCE: "Qual afirmação ou dependência precisa de comprovação? Se você tiver uma fonte que a sustente, descreva qual é e o que ela permite verificar. Não vou presumir que essa evidência existe ou está validada.",
    HUMAN_REVIEW: "Este ponto precisa de uma decisão humana antes de avançar. O que precisa ser decidido e quais alternativas devem ser consideradas?",
    REVIEW_READINESS: "Podemos discutir a revisão do que está disponível. O que você deseja revisar antes de solicitar um encerramento formal? Isso não declara o Discovery completo.",
    BLOCKER: "Ainda não consigo confirmar o contexto necessário para orientar o próximo passo. Precisamos revisar o acesso e o estado deste Discovery antes de continuar.",
  };
  const notices = [
    eligibility.abstaining && eligibility.conversationEligible
      ? "Ainda não há base suficiente para concluir ou avançar formalmente. Podemos reunir contexto sem tomar uma decisão. " : "",
    eligibility.blocked ? "O avanço permanece bloqueado enquanto este ponto não for resolvido. " : "",
    eligibility.humanDecisionRequired ? "É necessária uma decisão humana pelo processo de governança; esta conversa não a registra. " : "",
  ].join("");
  return ConversationResponseSchema.parse({
    conversationEligible: eligibility.conversationEligible,
    materialExecutionAllowed: false, intent, text: notices + wording[intent],
  });
}
