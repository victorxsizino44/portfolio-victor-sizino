import { z } from "zod";
import { CaptureMetadataSchema,generateInformationCandidates,evaluateInformationCandidate,independentlyAdditive,type CaptureEvaluation } from "../core/information-capture.ts";
import { CANONICAL_INFORMATION } from "../core/canonical-information.ts";
import { InformationPublicationSchema } from "../core/information-publication.ts";
import { VALIDATION_PIPELINE } from "../core/mc01.ts";
import { ProductHandleSchema } from "../core/product-runtime.ts";
import { FoundationError } from "../core/identity-access.ts";
import { resolveInformationReferences } from "../core/current-information.ts";
import { AgendaTopicIdSchema } from "../core/conversational-state.ts";
import { GovernedContextSnapshotSchema } from "../ports/governed-context.ts";
import type { GovernedContextReadPort } from "../ports/governed-context.ts";
import type { CapturedInformationReadPort } from "../ports/information-capture.ts";
import type { IdentityPort } from "../ports/identity.ts";
import type { InformationPublication } from "./information-publication.ts";

const RequestSchema=ProductHandleSchema.extend({message:z.string().trim().min(1).max(2000),capture:CaptureMetadataSchema,agendaTopicId:AgendaTopicIdSchema.optional()});
const provenanceSchema=z.strictObject({sourceType:z.literal("USER_STATEMENT"),speaker:z.literal("USER"),operationId:z.uuid(),capturedAt:z.iso.datetime({offset:true}),requestHash:z.string(),candidateId:z.uuid(),index:z.int().nonnegative(),registry:z.literal("R08-10/v1.0")});
async function hash(s:string){const bytes=new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)));return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");}
async function candidateId(op:string,index:number){const h=await hash(op+":"+index);return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-8${h.slice(17,20)}-${h.slice(20,32)}`;}
export class ConversationalInformationCapture {
  private readonly identity:IdentityPort; private readonly context:GovernedContextReadPort; private readonly read:CapturedInformationReadPort; private readonly publication:InformationPublication;
  constructor(identity:IdentityPort,context:GovernedContextReadPort,read:CapturedInformationReadPort,publication:InformationPublication){this.identity=identity;this.context=context;this.read=read;this.publication=publication;}
  async execute(input:unknown){
    const p=RequestSchema.parse(input),actor=await this.identity.current();if(!actor)throw new FoundationError("AUTHENTICATION_REQUIRED");
    // ProductRuntime verifies ownership first; repository reads also enforce RLS.
    const snapshot=GovernedContextSnapshotSchema.parse(await this.context.read(actor.identityId,p));
    if(!snapshot.runtime||!snapshot.session||snapshot.runtime.discoveryId!==p.discoveryId||snapshot.session.discoveryId!==p.discoveryId||snapshot.session.sessionId!==p.sessionId||snapshot.session.lifecycle!=="OPEN"||snapshot.runtime.current.sessionId!==p.sessionId)throw new FoundationError("ACCESS_DENIED");
    const requestHash=await hash(JSON.stringify(p));
    const historical=await this.read.byOperation(actor.identityId,p.discoveryId,p.capture.operationId);
    if(historical.length){
      const candidates=historical.map(({record,predecessorRecordId})=>{
        const source=record.sources.find(s=>s.sourceId===p.capture.operationId);let metadata;
        try{metadata=provenanceSchema.parse(JSON.parse(source?.reference??""));}catch{throw new FoundationError("CONCURRENT_MODIFICATION");}
        if(metadata.requestHash!==requestHash||record.discoveryId!==p.discoveryId)throw new FoundationError("CONCURRENT_MODIFICATION");
        return {index:metadata.index,candidateId:metadata.candidateId,record,predecessorRecordId,expectedEntityVersion:predecessorRecordId?record.entityVersion-1:null};
      }).sort((a,b)=>a.index-b.index).map(({index:_index,...c})=>c);
      // Replay the exact accepted request through the same RPC, never bypass the ledger.
      await this.publication.publish({...p.capture,discoveryId:p.discoveryId,expectedRuntimeVersion:p.runtimeVersion,candidates});
      return {accepted:candidates.length,evaluations:[] as CaptureEvaluation[]};
    }
    if(snapshot.runtime.runtimeVersion!==p.runtimeVersion)throw new FoundationError("CONCURRENT_MODIFICATION");
    const ids=resolveInformationReferences(snapshot.runtime.current,snapshot.information,p.discoveryId).flatMap(r=>r.recordIds);
    const current=snapshot.information.filter(r=>ids.includes(r.recordId));
    const evaluations=generateInformationCandidates(p.message,p.agendaTopicId).map(c=>evaluateInformationCandidate(c,p.message,current,p.agendaTopicId));
    for(const e of evaluations)if(e.outcome==="ACCEPT_AS_DECLARED"&&CANONICAL_INFORMATION.physical[e.candidate.fieldId].cardinality==="SINGLE"&&evaluations.filter(x=>x.candidate.fieldId===e.candidate.fieldId).length>1){e.outcome="REQUIRE_CLARIFICATION";e.question="Há mais de uma declaração para o mesmo ponto. Qual delas deve representar a informação atual?";}
    for(const e of evaluations)if(e.outcome==="ACCEPT_AS_DECLARED"&&CANONICAL_INFORMATION.physical[e.candidate.fieldId].cardinality==="MULTIPLE"&&evaluations.some(other=>other!==e&&other.candidate.fieldId===e.candidate.fieldId&&!independentlyAdditive(e.candidate.fieldId,e.candidate.statement,other.candidate.statement))){e.outcome="REQUIRE_CLARIFICATION";e.question="Essas declarações representam limites independentes ou uma correção? Precisamos esclarecer a relação antes de registrar.";}
    const candidateIds=await Promise.all(evaluations.map((_,index)=>candidateId(p.capture.operationId,index)));
    const candidates=evaluations.flatMap((e,index)=>{
      if(e.outcome!=="ACCEPT_AS_DECLARED")return [];
      const definition=CANONICAL_INFORMATION.physical[e.candidate.fieldId],id=candidateIds[index];
      const source={sourceId:p.capture.operationId,recordedAt:p.capture.capturedAt,reference:JSON.stringify({sourceType:"USER_STATEMENT",speaker:"USER",operationId:p.capture.operationId,capturedAt:p.capture.capturedAt,requestHash,candidateId:id,index,registry:CANONICAL_INFORMATION.version})};
      return [{candidateId:id,predecessorRecordId:e.predecessor?.recordId??null,expectedEntityVersion:e.predecessor?.entityVersion??null,record:{recordId:id,discoveryId:p.discoveryId,fieldId:e.candidate.fieldId,domainBinding:definition.domainId?{kind:"DOMAIN",domainId:definition.domainId}:{kind:"CORE_NEUTRAL"},entityVersion:e.predecessor?e.predecessor.entityVersion+1:0,content:{kind:"STATEMENT",value:e.candidate.statement},sources:[source],evidence:[],confidence:{level:"UNVERIFIED",sources:[source]},validation:{steps:VALIDATION_PIPELINE.map(stage=>({stage,result:{status:"PENDING"}}))}}}];
    });
    if(candidates.length)await this.publication.publish(InformationPublicationSchema.parse({...p.capture,discoveryId:p.discoveryId,expectedRuntimeVersion:p.runtimeVersion,candidates}));
    return {accepted:candidates.length,evaluations};
  }
}
