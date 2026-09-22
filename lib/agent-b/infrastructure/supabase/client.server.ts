import "../server-boundary.ts";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { requireSupabaseConfiguration } from "../config.server.ts";
import type { AgentBDatabase } from "./database.types.ts";

// Caller must write cookies AND the SDK's cache headers to its response.
// No readonly Server Component fallback and no shared client across requests.
export type WritableAuthCookies = Required<Pick<CookieMethodsServer, "getAll" | "setAll">>;
export function createAgentBSupabaseClient(cookies: WritableAuthCookies) {
  const config = requireSupabaseConfiguration();
  return createServerClient<AgentBDatabase>(config.url, config.publishableKey, {
    cookies,
    cookieOptions: { httpOnly: true, secure: true, sameSite: "lax", path: "/" },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}
