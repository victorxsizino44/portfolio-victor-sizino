import { FoundationError } from "../core/identity-access.ts";
export function productFailure(error:unknown) {
  const code=error instanceof FoundationError?error.code:"PROVIDER_UNAVAILABLE";
  const status=code==="INVALID_INPUT"?400:code==="AUTHENTICATION_REQUIRED"?401:code==="ACCESS_DENIED"?403:code==="CONCURRENT_MODIFICATION"?409:503;
  return {status,body:{ok:false as const,error:{code:status===503?"RUNTIME_UNAVAILABLE":code,retryable:status===503}}};
}
export async function readProductInput(request:Request,maxBytes=2048) {
  if(request.headers.get("origin") && request.headers.get("origin")!==new URL(request.url).origin)
    throw new FoundationError("ACCESS_DENIED");
  if(request.headers.get("sec-fetch-site")==="cross-site")throw new FoundationError("ACCESS_DENIED");
  if(request.headers.get("content-type")?.split(";")[0].trim()!=="application/json")throw new FoundationError("INVALID_INPUT");
  // Bounded JSON. Orchestration additionally permits one disposable user message.
  const reader=request.body?.getReader();if(!reader)throw new FoundationError("INVALID_INPUT");
  let total=0;const chunks:Uint8Array[]=[];
  try {
    while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;
      if(total>maxBytes){await reader.cancel();throw new FoundationError("INVALID_INPUT");}chunks.push(value);}
    const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
    return JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes));
  }catch{throw new FoundationError("INVALID_INPUT");}
}
