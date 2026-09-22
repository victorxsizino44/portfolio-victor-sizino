import "./server-boundary.ts";
import { env } from "node:process";
import { z } from "zod";
import { FoundationError } from "../core/identity-access.ts";

const supabaseConfiguration = z.strictObject({
  url: z.url().refine((value) => {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.search && !url.hash;
  }),
  publishableKey: z.string().regex(/^sb_publishable_[A-Za-z0-9_-]+$/),
});
export type SupabaseConfiguration = Readonly<z.infer<typeof supabaseConfiguration>>;
type ConfigurationEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  GEMINI_API_KEY?: string;
};

export function getAgentBRuntimeConfig(environment: ConfigurationEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  GEMINI_API_KEY: env.GEMINI_API_KEY,
}): Readonly<{ supabase?: SupabaseConfiguration; gemini?: { apiKey: string } }> {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url && !publishableKey) return Object.freeze({});
  const parsed = supabaseConfiguration.safeParse({ url, publishableKey });
  if (!parsed.success) throw new FoundationError("CONFIGURATION_REQUIRED");
  const gemini = environment.GEMINI_API_KEY ? { apiKey: environment.GEMINI_API_KEY } : undefined;
  return Object.freeze({ supabase: Object.freeze(parsed.data), ...(gemini ? { gemini: Object.freeze(gemini) } : {}) });
}

export function requireSupabaseConfiguration(): SupabaseConfiguration {
  const config = getAgentBRuntimeConfig().supabase;
  if (!config) throw new FoundationError("CONFIGURATION_REQUIRED");
  return config;
}
