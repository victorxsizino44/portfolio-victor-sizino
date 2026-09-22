import type { AiInput, Candidate } from "../core/ai.ts";
export type AiFailure = "UNAVAILABLE" | "INVALID_OUTPUT" | "RATE_LIMITED";
export interface AiPort { generate(input: AiInput): Promise<Candidate>; }
