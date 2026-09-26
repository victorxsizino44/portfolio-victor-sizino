import { z } from "zod";
import { DiscoveryIdSchema, EntityVersionSchema, HumanDecisionReferenceSchema, InformationRecordIdSchema } from "./primitives.ts";
import { EvidenceCandidateSchema, ExtractedRepresentationSchema, GovernedEvidenceSchema } from "./evidence.ts";
const id=z.string().trim().min(1);
const operation={discoveryId:DiscoveryIdSchema,operationId:z.string().uuid()};
const material={...operation,evidenceId:id,expectedEntityVersion:EntityVersionSchema,decision:HumanDecisionReferenceSchema};
export const EvidenceMutationSchema=z.discriminatedUnion("action",[
  z.strictObject({...operation,action:z.literal("PERSIST_REPRESENTATION"),representation:ExtractedRepresentationSchema}),
  z.strictObject({...operation,action:z.literal("PERSIST_CANDIDATE"),candidate:EvidenceCandidateSchema}),
  z.strictObject({...operation,action:z.literal("RECEIVE"),candidateId:id,evidenceId:id}),
  z.strictObject({...material,action:z.literal("VALIDATE"),informationRecordId:InformationRecordIdSchema,informationVersion:EntityVersionSchema}),
  z.strictObject({...material,action:z.literal("REJECT")}),
  z.strictObject({...material,action:z.literal("SUPERSEDE")}),
  z.strictObject({discoveryId:DiscoveryIdSchema,action:z.literal("DEFER"),evidenceId:id}),
]).superRefine((v,c)=>{
  if(v.action==="PERSIST_CANDIDATE"&&v.candidate.discoveryId!==v.discoveryId)c.addIssue({code:"custom",message:"Discovery mismatch."});
  if("expectedEntityVersion" in v&&!Number.isSafeInteger(v.expectedEntityVersion+1))c.addIssue({code:"custom",message:"Version overflow."});
});
export const PersistedEvidenceSchema=z.strictObject({
  evidence:GovernedEvidenceSchema,entityVersion:EntityVersionSchema,
  previousVersion:EntityVersionSchema.nullable(),operationId:z.string().uuid(),
  decision:HumanDecisionReferenceSchema.nullable(),
  informationTarget:z.strictObject({informationRecordId:InformationRecordIdSchema,informationVersion:EntityVersionSchema}).nullable(),
}).superRefine((v,c)=>{
  if(v.entityVersion===0?v.previousVersion!==null||v.evidence.validation!=="RECEIVED"||v.decision!==null:v.previousVersion!==v.entityVersion-1||v.decision===null)c.addIssue({code:"custom",message:"Invalid lineage/decision."});
  if((v.evidence.validation==="VALIDATED")!==(v.informationTarget!==null))c.addIssue({code:"custom",message:"Validation requires an Information target."});
});
export const EvidenceReadSchema=z.strictObject({discoveryId:DiscoveryIdSchema,evidenceId:id});
export type EvidenceMutation=z.infer<typeof EvidenceMutationSchema>;
export type PersistedEvidence=z.infer<typeof PersistedEvidenceSchema>;
export type EvidenceRead=z.infer<typeof EvidenceReadSchema>;
// Proposals are data, never accepted by the material-mutation schema.
export const EvidenceAssessmentCandidateSchema=z.strictObject({kind:z.literal("EVIDENCE_ASSESSMENT_CANDIDATE"),evidenceId:id,assessment:z.string().min(1)});
