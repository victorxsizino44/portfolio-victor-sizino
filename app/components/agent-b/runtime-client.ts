import { ProductActionSchema, ProductHandleSchema, ProductInitializeSchema, type ProductHandle } from "../../../lib/agent-b/core/product-runtime.ts";
import { ProductConversationRequestSchema, ProductConversationResultSchema } from "../../../lib/agent-b/core/product-conversation.ts";
import type { ConversationInput } from "../../../lib/agent-b/core/conversation-projection.ts";
import type { ConversationalState } from "../../../lib/agent-b/core/conversational-state.ts";
export type ProductUIState="idle"|"initializing"|"loading"|"ready"|"substantive"|"abstain"|"unauthorized"|"conflict"|"error";
export class ProductRequestError extends Error {
  readonly state:"unauthorized"|"conflict"|"error";
  constructor(status:number){super("RUNTIME_REQUEST_FAILED");this.state=status===401||status===403?"unauthorized":status===409?"conflict":"error";}
}
export async function productRequest(path:string,input:unknown,send:typeof fetch=fetch) {
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
  try {
    const response=await send(path,{method:"POST",headers:{"content-type":"application/json"},credentials:"same-origin",
      cache:"no-store",body:JSON.stringify(input),signal:controller.signal});
    if(!response.ok)throw new ProductRequestError(response.status);
    return await response.json();
  }catch(error){if(error instanceof ProductRequestError)throw error;throw new ProductRequestError(503);}
  finally{clearTimeout(timer);}
}
// Operational references only. Storage is never proof of access or governed state.
export async function initializeProduct(storage:Pick<Storage,"getItem"|"setItem">,send:typeof fetch=fetch):Promise<ProductHandle> {
  const key="agent-b-runtime-request";
  let request;
  const saved=storage.getItem(key);
  if(saved){try{request=ProductInitializeSchema.parse(JSON.parse(saved));}catch{throw new ProductRequestError(503);}}
  else{request=ProductInitializeSchema.parse({operationId:crypto.randomUUID(),sessionId:crypto.randomUUID(),now:new Date().toISOString()});storage.setItem(key,JSON.stringify(request));}
  const body=await productRequest("/api/agent-b/initialize",request,send);
  const result=ProductHandleSchema.safeParse(body?.runtime);
  if(body?.ok!==true||!result.success)throw new ProductRequestError(503);
  storage.setItem(key,JSON.stringify({...request,discoveryId:result.data.discoveryId}));
  return result.data;
}
export async function evaluateProduct(handle:ProductHandle,send:typeof fetch=fetch) {
  const input=ProductHandleSchema.parse(handle);
  const body=await productRequest("/api/agent-b/orchestrate",input,send);
  const result=ProductActionSchema.safeParse(body?.action);
  if(body?.ok!==true||!result.success||result.data.discoveryId!==input.discoveryId||result.data.runtimeVersion!==input.runtimeVersion)
    throw new ProductRequestError(503);
  return result.data;
}
export async function evaluateProductConversation(handle:ProductHandle,conversation:ConversationInput,send:typeof fetch=fetch,capture?:{operationId:string;capturedAt:string},conversationalState?:ConversationalState|null) {
  const input=ProductConversationRequestSchema.parse({...handle,conversation,...(capture?{capture}:{}),...(conversationalState?{conversationalState}:{})});
  const body=await productRequest("/api/agent-b/orchestrate",input,send);
  const result=ProductConversationResultSchema.safeParse({action:body?.action,response:body?.response,conversationalState:body?.conversationalState});
  if(body?.ok!==true||!result.success||result.data.action.discoveryId!==handle.discoveryId||(capture?result.data.action.runtimeVersion<handle.runtimeVersion:result.data.action.runtimeVersion!==handle.runtimeVersion))
    throw new ProductRequestError(503);
  if(result.data.conversationalState.discoveryId!==handle.discoveryId||result.data.conversationalState.sessionId!==handle.sessionId)
    throw new ProductRequestError(503);
  return result.data;
}
