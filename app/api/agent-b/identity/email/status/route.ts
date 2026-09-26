import { NextRequest } from "next/server";
import { progressiveIdentityRoute } from "../../../../../../lib/agent-b/infrastructure/progressive-identity-route.server";
export async function POST(request: NextRequest) { return progressiveIdentityRoute(request, "status"); }
