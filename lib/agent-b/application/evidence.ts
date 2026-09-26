import { FileTypeSchema,StoredObjectSchema,FileReferenceSchema,EvidenceCandidateSchema } from "../core/evidence.ts";
import { SourceReferenceSchema } from "../core/primitives.ts";
import { FoundationError } from "../core/identity-access.ts";
import type { EvidencePort } from "../ports/evidence.ts";
const mime:Record<string,string>={"application/pdf":"PDF","application/vnd.openxmlformats-officedocument.wordprocessingml.document":"DOCX","text/plain":"TXT","text/markdown":"MD","text/csv":"CSV","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":"XLSX","image/png":"PNG","image/jpeg":"JPEG","image/webp":"WEBP"};
export class EvidenceFoundation {
  private readonly port:EvidencePort;
  constructor(port:EvidencePort){this.port=port;}
  async upload(input:{discoveryId:string;objectId:string;path:string;bytes:Uint8Array;contentType:string;createdAt:string;source:unknown}){
    const type=FileTypeSchema.safeParse(mime[input.contentType]);const source=SourceReferenceSchema.safeParse(input.source);
    if(!type.success||!source.success||input.bytes.byteLength===0||input.bytes.byteLength>10*1024*1024)throw new FoundationError("INVALID_INPUT");
    const stored=StoredObjectSchema.parse(await this.port.upload({...input,source:source.data,fileType:type.data}));
    const reference=FileReferenceSchema.parse({fileReferenceId:"ref-"+stored.objectId,objectId:stored.objectId,discoveryId:stored.discoveryId,source:source.data});
    return {stored,reference};
  }
  // Structural candidate assessment is never a lifecycle transition.
  evaluate(candidate:unknown){
    const parsed=EvidenceCandidateSchema.safeParse(candidate);
    if(!parsed.success)throw new FoundationError("INVALID_INPUT");
    return parsed.data;
  }
}
