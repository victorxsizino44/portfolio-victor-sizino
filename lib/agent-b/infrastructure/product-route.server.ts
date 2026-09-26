import { ConversationalInformationCapture } from "../application/information-capture.ts";
import { InformationPublication } from "../application/information-publication.ts";
import { SupabaseInformationPublication } from "./supabase/information-publication.server.ts";
import { SupabaseCapturedInformation } from "./supabase/information-capture.server.ts";
import "./server-boundary.ts";
import { NextRequest, NextResponse } from "next/server";
import { ProductRuntime } from "../application/product-runtime.ts";
import { ProductContinuity } from "../application/product-continuity.ts";
import { parseProductPersistenceInput } from "./product-input.server.ts";
import { productFailure, readProductInput } from "../transport/product.ts";
import { createAgentBSupabaseClient, type WritableAuthCookies } from "./supabase/client.server.ts";
import { SupabaseIdentityAdapter } from "./supabase/identity.server.ts";
import { SupabaseDiscoveryPersistence } from "./supabase/discovery-persistence.server.ts";
import { SupabaseRuntimePersistence } from "./supabase/runtime-persistence.server.ts";
import { SupabaseGovernedContext } from "./supabase/governed-context.server.ts";
import { trackAgentBEvent } from "./analytics.server.ts";
export async function productRoute(request:NextRequest,operation:"initialize"|"evaluate"|"continuity") {
  const pendingCookies:Parameters<WritableAuthCookies["setAll"]>[0]=[];const headers=new Headers();
  const respond=(body:unknown,status:number)=>{
    const response=NextResponse.json(body,{status,headers});
    response.headers.set("Cache-Control","private, no-store");
    for(const cookie of pendingCookies)response.cookies.set(cookie.name,cookie.value,cookie.options);
    return response;
  };
  try {
    const input=await readProductInput(request,operation==="evaluate"?16384:2048);
    const parsed=parseProductPersistenceInput(input,operation);
    const client=createAgentBSupabaseClient({getAll:()=>request.cookies.getAll(),setAll:(cookies,extra)=>{
      pendingCookies.push(...cookies);for(const [name,value] of Object.entries(extra??{}))headers.set(name,value);
    }});
    const app=new ProductRuntime(new SupabaseIdentityAdapter(client.auth),new SupabaseDiscoveryPersistence(client),
      new SupabaseRuntimePersistence(client),new SupabaseGovernedContext(client),
      new ConversationalInformationCapture(new SupabaseIdentityAdapter(client.auth),new SupabaseGovernedContext(client),new SupabaseCapturedInformation(client),
        new InformationPublication(new SupabaseIdentityAdapter(client.auth),new SupabaseInformationPublication(client))));
    if(operation==="continuity"){
      const continuity=new ProductContinuity(new SupabaseIdentityAdapter(client.auth),new SupabaseDiscoveryPersistence(client),
        new SupabaseRuntimePersistence(client),new SupabaseGovernedContext(client));
      return respond({ok:true,result:await continuity.execute(parsed)},200);
    }
    const result=operation==="initialize"?{runtime:await app.initialize(parsed)}:await app.converse(parsed);
    // Event name only: no identifiers, action fields, content or governed state.
    void trackAgentBEvent(operation==="initialize"?"agent_b_runtime_initialized":"agent_b_orchestration_evaluated");
    return respond({ok:true,...result},200);
  }catch(error){
    const failure=productFailure(error);
    void trackAgentBEvent("agent_b_runtime_failed");
    return respond(failure.body,failure.status);
  }
}
