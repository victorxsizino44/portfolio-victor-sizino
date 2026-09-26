import "./server-boundary.ts";
import { env } from "node:process";
import { CandidateSchema, type AiInput, type Candidate } from "../core/ai.ts";
import type { AiPort } from "../ports/ai.ts";
import { FoundationError } from "../core/identity-access.ts";
export class GeminiAiAdapter implements AiPort {
  private readonly key: string; private readonly fetcher: typeof fetch;
  constructor(apiKey = env.GEMINI_API_KEY, fetcher: typeof fetch = fetch) { if (!apiKey) throw new FoundationError("CONFIGURATION_REQUIRED"); this.key = apiKey; this.fetcher = fetcher; }
  async generate(input: AiInput): Promise<Candidate> {
    const body = { contents: [{ parts: [{ text: `Return JSON only matching this schema: {operation,discoveryId,entityVersion,candidates:[{label,rationale,confidence}]}\nOperation: ${input.operation}\nDiscovery: ${input.discoveryId}\nEntity version: ${input.entityVersion}\nContext:\n${input.context}` }] }], generationConfig: { responseMimeType: "application/json" } };
    let last: Response | undefined;
    for (let attempt = 0; attempt < 2; attempt += 1) { try { const response = await this.fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${input.config.model}:generateContent?key=${encodeURIComponent(this.key)}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), cache: "no-store" }); last = response; if (response.ok) { const raw = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }; const text = raw.candidates?.[0]?.content?.parts?.[0]?.text; if (!text) throw new FoundationError("PROVIDER_UNAVAILABLE"); const parsed = CandidateSchema.safeParse(JSON.parse(text)); if (!parsed.success) throw new FoundationError("PROVIDER_UNAVAILABLE"); return parsed.data; } if (![429, 500, 502, 503, 504].includes(response.status)) break; } catch (error) { if (error instanceof FoundationError) throw error; } }
    void last; throw new FoundationError("PROVIDER_UNAVAILABLE");
  }
}
