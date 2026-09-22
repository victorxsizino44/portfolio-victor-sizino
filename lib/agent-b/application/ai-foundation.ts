import { AiInputSchema, CandidateSchema, PromptConfigSchema, type Candidate } from "../core/ai.ts";
import type { AiPort } from "../ports/ai.ts";
import { FoundationError } from "../core/identity-access.ts";
export class GovernedAiFoundation {
  private ai: AiPort; constructor(ai: AiPort) { this.ai = ai; }
  async evaluate(input: unknown): Promise<Candidate> {
    const parsed = AiInputSchema.safeParse(input); if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const bounded = { ...parsed.data, context: parsed.data.context.slice(0, parsed.data.config.maxContextChars) };
    const candidate = await this.ai.generate(bounded); const checked = CandidateSchema.safeParse(candidate); if (!checked.success || checked.data.operation !== bounded.operation || checked.data.discoveryId !== bounded.discoveryId || checked.data.entityVersion !== bounded.entityVersion) throw new FoundationError("PROVIDER_UNAVAILABLE");
    return checked.data;
  }
}
