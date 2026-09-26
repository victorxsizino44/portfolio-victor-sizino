import { currentRecordIds } from "./current-information.ts";
import { z } from "zod";
import { ProductHandleSchema, ProductInitializeSchema } from "./product-runtime.ts";
import { ResumeRuntimeSchema } from "./runtime-operations.ts";
import { DiscoveryIdSchema, TimestampSchema } from "./primitives.ts";
import { DiscoveryRuntimeSchema } from "./mc04.ts";

export const ContinuityRequestSchema=z.discriminatedUnion("kind",[
  z.strictObject({kind:z.literal("ENTRY")}),
  ProductInitializeSchema.omit({discoveryId:true}).extend({kind:z.literal("NEW")}),
  ResumeRuntimeSchema.safeExtend({kind:z.literal("RESUME")}),
]);
export const HumanStatusSchema=z.strictObject({title:z.string(),items:z.array(z.string()),review:z.string()});
export const ContinuityChoiceSchema=z.strictObject({discoveryId:DiscoveryIdSchema,createdAt:TimestampSchema,
  previousSessionId:ProductHandleSchema.shape.sessionId,expectedRuntimeVersion:ProductHandleSchema.shape.runtimeVersion,status:HumanStatusSchema});
export const ContinuityResultSchema=z.discriminatedUnion("kind",[
  z.strictObject({kind:z.literal("ENTRY"),choices:z.array(ContinuityChoiceSchema)}),
  z.strictObject({kind:z.literal("READY"),runtime:ProductHandleSchema,status:HumanStatusSchema,continuation:z.string()}),
]);
export type ContinuityChoice=z.infer<typeof ContinuityChoiceSchema>;
export type HumanStatus=z.infer<typeof HumanStatusSchema>;
export type ContinuityRequest=z.infer<typeof ContinuityRequestSchema>;

// Referential status, not field completion or semantic validity. No percentages.
export function projectRuntimeStatus(input:unknown):HumanStatus {
  const runtime=DiscoveryRuntimeSchema.parse(input);
  const pending=runtime.pending.filter(p=>p.state==="PENDING");
  const current=runtime.current;
  return HumanStatusSchema.parse({
    title:runtime.freshness==="CURRENT"?"Discovery em andamento":runtime.freshness==="HISTORICAL"?"Discovery histórico":"Discovery precisa de reavaliação",
    items:[
      currentRecordIds(current).length?"Há uma referência atual a informações registradas; isso não comprova sua validade.":"Nenhuma informação está referenciada como atual.",
      current.classificationVersion!==undefined?"Há uma referência de classificação.":"Classificação ainda não referenciada.",
      current.scopeVersion!==undefined?"Há uma referência de escopo.":"Escopo ainda não referenciado.",
      pending.length?`${pending.length} pendência(s) registrada(s) aguardam tratamento.`:"Nenhuma pendência registrada neste estado; outras necessidades podem não estar avaliadas.",
    ],review:"Prontidão do Briefing para revisão não determinada nesta visualização.",
  });
}
