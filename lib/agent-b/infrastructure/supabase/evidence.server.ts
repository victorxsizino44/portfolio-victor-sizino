import "../server-boundary.ts";
import { createHash } from "node:crypto";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { EvidencePort,EvidencePersistencePort } from "../../ports/evidence.ts";
import type { AgentBDatabase } from "./database.types.ts";
import { FoundationError } from "../../core/identity-access.ts";
import { FileReferenceSchema,ExtractedRepresentationSchema,StoredObjectSchema,type StoredObject,type FileReference } from "../../core/evidence.ts";
import { PersistedEvidenceSchema,type EvidenceMutation,type EvidenceRead } from "../../core/evidence-lifecycle.ts";
const mimes={PDF:"application/pdf",DOCX:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",TXT:"text/plain",MD:"text/markdown",CSV:"text/csv",XLSX:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",PNG:"image/png",JPEG:"image/jpeg",WEBP:"image/webp"} as const;
function fail(error:{code?:string}|null){if(error)throw new FoundationError(error.code==="42501"?"ACCESS_DENIED":error.code==="40001"||error.code==="23505"?"CONCURRENT_MODIFICATION":error.code==="22023"?"INVALID_INPUT":"PROVIDER_UNAVAILABLE");}
export class SupabaseEvidenceAdapter implements EvidencePort,EvidencePersistencePort {
  private readonly c:SupabaseClient<AgentBDatabase>;
  constructor(c:SupabaseClient<AgentBDatabase>){this.c=c;}
  async upload(i:Parameters<EvidencePort["upload"]>[0]){
    if(i.path!==i.discoveryId+"/"+i.objectId||i.objectId.includes("/")||!mimes[i.fileType])throw new FoundationError("INVALID_INPUT");
    const stored=StoredObjectSchema.parse({objectId:i.objectId,discoveryId:i.discoveryId,path:i.path,fileType:i.fileType,byteSize:i.bytes.byteLength,sha256:createHash("sha256").update(i.bytes).digest("hex"),createdAt:i.createdAt});
    const reference=FileReferenceSchema.parse({fileReferenceId:"ref-"+i.objectId,objectId:i.objectId,discoveryId:i.discoveryId,source:i.source});
    const {data:auth,error:authError}=await this.c.auth.getUser();
    if(authError||!auth.user)throw new FoundationError("AUTHENTICATION_REQUIRED");
    const {error:uploadError}=await this.c.storage.from("agent-b-private").upload(stored.path,i.bytes,{contentType:mimes[i.fileType],upsert:false});
    // A same-path retry must never overwrite stored bytes.
    if(uploadError)throw new FoundationError("PROVIDER_UNAVAILABLE");
    const {error}=await this.c.rpc("agent_b_register_evidence_file",{p_actor:auth.user.id,p_stored:stored,p_reference:reference});
    if(error){
      // Storage is not a PostgreSQL transaction. Compensation is restricted by
      // policy to unregistered objects, so an uncertain successful commit is safe.
      try{await this.c.storage.from("agent-b-private").remove([stored.path]);}catch{/* fixed error only */}
      fail(error);
    }
    return stored;
  }
  async extract(file:StoredObject,reference:FileReference,bytes:Uint8Array){
    const stored=StoredObjectSchema.parse(file);const ref=FileReferenceSchema.parse(reference);
    if(ref.objectId!==stored.objectId||ref.discoveryId!==stored.discoveryId||bytes.byteLength!==stored.byteSize||createHash("sha256").update(bytes).digest("hex")!==stored.sha256)throw new FoundationError("INVALID_INPUT");
    const base={representationId:"repr-"+ref.fileReferenceId,fileReferenceId:ref.fileReferenceId,createdAt:stored.createdAt};
    if(!["TXT","MD","CSV"].includes(stored.fileType))return ExtractedRepresentationSchema.parse({...base,status:"UNSUPPORTED",reason:"deterministic extraction unavailable"});
    try{
      const text=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
      if(!text)return ExtractedRepresentationSchema.parse({...base,status:"FAILED",reason:"empty extracted representation"});
      return ExtractedRepresentationSchema.parse({...base,status:"EXTRACTED",text});
    }catch{return ExtractedRepresentationSchema.parse({...base,status:"FAILED",reason:"invalid UTF-8 encoding"});}
  }
  async mutate(identityId:string,input:Exclude<EvidenceMutation,{action:"DEFER"}>){
    const {data,error}=await this.c.rpc("agent_b_mutate_evidence",{p_actor:identityId,p_input:input});fail(error);return data;
  }
  async read(identityId:string,input:EvidenceRead){
    const {data,error}=await this.c.rpc("agent_b_read_evidence",{p_actor:identityId,p_discovery:input.discoveryId,p_evidence:input.evidenceId,p_history:false});fail(error);
    const parsed=PersistedEvidenceSchema.nullable().safeParse(data);if(!parsed.success)throw new FoundationError("PROVIDER_UNAVAILABLE");return parsed.data;
  }
  async history(identityId:string,input:EvidenceRead){
    const {data,error}=await this.c.rpc("agent_b_read_evidence",{p_actor:identityId,p_discovery:input.discoveryId,p_evidence:input.evidenceId,p_history:true});fail(error);
    const parsed=z.array(PersistedEvidenceSchema).safeParse(data);if(!parsed.success)throw new FoundationError("PROVIDER_UNAVAILABLE");return parsed.data;
  }
}
