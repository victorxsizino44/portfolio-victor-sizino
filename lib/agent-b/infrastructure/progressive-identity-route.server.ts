import "./server-boundary.ts";
import { NextRequest, NextResponse } from "next/server";
import { ProgressiveIdentity, EmailUpgradeRequestSchema, EmailUpgradeVerifySchema, EmailUpgradeStatusSchema } from "../application/progressive-identity.ts";
import { FoundationError } from "../core/identity-access.ts";
import { persistedDiscoveryId } from "./product-input.server.ts";
import { readProductInput, productFailure } from "../transport/product.ts";
import { createAgentBSupabaseClient, type WritableAuthCookies } from "./supabase/client.server.ts";
import { SupabaseIdentityAdapter } from "./supabase/identity.server.ts";
import { SupabaseDiscoveryPersistence } from "./supabase/discovery-persistence.server.ts";

export async function progressiveIdentityRoute(request: NextRequest, operation: "request" | "verify" | "status") {
  const cookies: Parameters<WritableAuthCookies["setAll"]>[0] = [];
  const headers = new Headers({ "Cache-Control": "private, no-store" });
  const respond = (body: unknown, status: number) => {
    const response = NextResponse.json(body, { status, headers });
    for (const cookie of cookies) response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  };
  try {
    const schema = (operation === "status" ? EmailUpgradeStatusSchema : operation === "request" ? EmailUpgradeRequestSchema : EmailUpgradeVerifySchema)
      .extend({ discoveryId: persistedDiscoveryId });
    const parsed = schema.safeParse(await readProductInput(request));
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const client = createAgentBSupabaseClient({ getAll: () => request.cookies.getAll(), setAll: (values, extra) => {
      cookies.push(...values);
      for (const [key, value] of Object.entries(extra ?? {})) headers.set(key, value);
    } });
    const service = new ProgressiveIdentity(new SupabaseIdentityAdapter(client.auth), new SupabaseDiscoveryPersistence(client));
    const identity = operation === "status" ? await service.status(parsed.data) : await service.execute(parsed.data, operation);
    return respond({ ok: true, identity }, 200);
  } catch (error) {
    if (error instanceof FoundationError && (error.code === "EMAIL_VERIFICATION_REQUIRED" || error.code === "IDENTITY_CONTINUITY_FAILED"))
      return respond({ ok: false, error: { code: error.code, retryable: false } }, error.code === "EMAIL_VERIFICATION_REQUIRED" ? 400 : 409);
    const failure = productFailure(error);
    return respond(failure.body, failure.status);
  }
}
