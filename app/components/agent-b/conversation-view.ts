import type { ConversationResponse } from "../../../lib/agent-b/core/conversation-projection.ts";

export type ConversationTurn = {
  id: string;
  message: string;
  capturedAt?: string;
  answer?: string;
  error?: string;
};

// Presentation-only copy reduction. Never change a blocker, evidence request or
// human-decision condition. Unknown/new wording is displayed unchanged.
export function conversationText(response: ConversationResponse): string {
  const ordinary = ["OPEN_CONTEXT", "CONCRETE_EXAMPLE", "DESIRED_CHANGE"].includes(response.intent);
  const prefix = "Ainda não há base suficiente para concluir ou avançar formalmente. Podemos reunir contexto sem tomar uma decisão. ";
  return ordinary && response.conversationEligible && !response.materialExecutionAllowed && response.text.startsWith(prefix)
    ? response.text.slice(prefix.length) : response.text;
}

export function finishTurn(turns: readonly ConversationTurn[], id: string, result: {answer: string} | {error: string}): ConversationTurn[] {
  return turns.map(turn => turn.id === id ? {...turn,error:undefined,answer:undefined,...result} : turn);
}
