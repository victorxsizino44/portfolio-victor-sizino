import { NextResponse } from "next/server";
import { GovernedOrchestration } from "../../../../lib/agent-b/application/orchestration.ts";
import { trackAgentBEvent } from "../../../../lib/agent-b/infrastructure/analytics.server.ts";
export async function POST(request: Request) { try { const body=await request.json(); const action=new GovernedOrchestration().evaluate(body); void trackAgentBEvent("agent_b_orchestration_evaluated",{interaction:action.interaction,progression:action.progression}); return NextResponse.json({ok:true,action}); } catch { void trackAgentBEvent("agent_b_orchestration_failed"); return NextResponse.json({ok:false,error:{code:"INVALID_REQUEST",message:"Não foi possível avaliar a próxima ação."}},{status:400}); } }
