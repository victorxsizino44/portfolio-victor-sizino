import type { NextRequest } from "next/server";
import { productRoute } from "../../../../lib/agent-b/infrastructure/product-route.server.ts";
export async function POST(request: NextRequest) { return productRoute(request, "evaluate"); }
