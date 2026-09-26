import { ContinuityRequestSchema, ContinuityResultSchema, type ContinuityChoice } from "../../../lib/agent-b/core/product-continuity.ts";
import { productRequest, ProductRequestError } from "./runtime-client.ts";

export async function readContinuity(send:typeof fetch=fetch){
  const body=await productRequest("/api/agent-b/continuity",{kind:"ENTRY"},send);
  const result=ContinuityResultSchema.safeParse(body?.result);
  if(body?.ok!==true||!result.success||result.data.kind!=="ENTRY")throw new ProductRequestError(503);
  return result.data.choices;
}

// Only operation identifiers are retained for retry safety, never chat/history.
export async function enterDiscovery(storage:Pick<Storage,"getItem"|"setItem"|"removeItem">,choice?:ContinuityChoice,send:typeof fetch=fetch){
  const key="agent-b-continuity-operation";
  let request;
  const saved=storage.getItem(key);
  if(saved){try{
    const prior=ContinuityRequestSchema.parse(JSON.parse(saved));
    if(!choice&&prior.kind==="NEW")request=prior;
    if(choice&&prior.kind==="RESUME"&&prior.discoveryId===choice.discoveryId)request=prior;
  }catch{throw new ProductRequestError(503);}}
  request??=choice?{kind:"RESUME",discoveryId:choice.discoveryId,previousSessionId:choice.previousSessionId,expectedRuntimeVersion:choice.expectedRuntimeVersion,
    operationId:crypto.randomUUID(),sessionId:crypto.randomUUID(),now:new Date().toISOString()}
    :{kind:"NEW",operationId:crypto.randomUUID(),sessionId:crypto.randomUUID(),now:new Date().toISOString()};
  const parsed=ContinuityRequestSchema.parse(request);
  storage.setItem(key,JSON.stringify(parsed));
  let body;
  try{body=await productRequest("/api/agent-b/continuity",parsed,send);}
  catch(error){
    // A confirmed conflict needs a fresh entry read. An ambiguous network failure
    // retains the exact request even if entry now observes the accepted Resume.
    if(error instanceof ProductRequestError&&error.state==="conflict")storage.removeItem(key);
    throw error;
  }
  const result=ContinuityResultSchema.safeParse(body?.result);
  if(body?.ok!==true||!result.success||result.data.kind!=="READY")throw new ProductRequestError(503);
  if(parsed.kind==="ENTRY"||result.data.runtime.sessionId!==parsed.sessionId ||
    (parsed.kind==="NEW"&&result.data.runtime.runtimeVersion!==0)||
    (parsed.kind==="RESUME"&&(result.data.runtime.discoveryId!==parsed.discoveryId||result.data.runtime.runtimeVersion!==parsed.expectedRuntimeVersion+1)))
    throw new ProductRequestError(503);
  storage.setItem("agent-b-runtime-request",JSON.stringify({operationId:parsed.operationId,sessionId:parsed.sessionId,now:parsed.now,discoveryId:result.data.runtime.discoveryId}));
  storage.removeItem(key);
  return result.data;
}
