import type { ProductHandle } from "../../../lib/agent-b/core/product-runtime.ts";
import { parseBoundConversationalState, type ConversationalState } from "../../../lib/agent-b/core/conversational-state.ts";

type StateStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type ConversationalStateAction = { type: "replace"; state: ConversationalState | null };

export function conversationStateReducer(_current: ConversationalState | null, action: ConversationalStateAction) {
  return action.state;
}

function storageKey(discoveryId: string) {
  return `agent-b-conversation-state:${discoveryId}`;
}

export function readStoredConversationalState(storage: StateStorage, handle: ProductHandle): ConversationalState | null {
  const key = storageKey(handle.discoveryId);
  try {
    const serialized = storage.getItem(key);
    if (serialized === null) return null;
    const state = parseBoundConversationalState(JSON.parse(serialized), handle.discoveryId, handle.sessionId);
    if (state) return state;
    storage.removeItem(key);
  } catch {
    try { storage.removeItem(key); } catch { /* Session storage may be unavailable. */ }
  }
  return null;
}

export function writeStoredConversationalState(storage: StateStorage, state: ConversationalState) {
  try { storage.setItem(storageKey(state.discoveryId), JSON.stringify(state)); } catch { /* Keep state only in React memory. */ }
}