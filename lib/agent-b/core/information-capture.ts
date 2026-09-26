import { z } from "zod";
import { CANONICAL_INFORMATION, type CanonicalInformationField } from "./canonical-information.ts";
import type { DiscoveryInformationRecord } from "./mc01.ts";

export const CaptureMetadataSchema = z.strictObject({operationId:z.uuid(),capturedAt:z.iso.datetime({offset:true})});
export const InformationCandidateSchema = z.strictObject({
  fieldId:z.enum(Object.keys(CANONICAL_INFORMATION.fields) as [CanonicalInformationField,...CanonicalInformationField[]]),
  statement:z.string().min(1).max(2000), normalization:z.enum(["VERBATIM","SEMANTIC_NORMALIZATION"]),
  sourceText:z.string().min(1).max(2000), replacement:z.boolean(),
});
export type InformationCandidate = z.infer<typeof InformationCandidateSchema>;
export type CaptureEvaluation = {candidate:InformationCandidate;outcome:"ACCEPT_AS_DECLARED"|"REQUIRE_CLARIFICATION"|"REQUIRE_HUMAN_DECISION";question?:string;predecessor?:DiscoveryInformationRecord};
const rules:readonly [CanonicalInformationField,RegExp][] = [
  ["field.subject_context",/^(?:estou (?:criando|estruturando|desenvolvendo)|minha iniciativa é|o assunto é|o projeto é)\s+\S/i],
  ["field.primary_objective",/^(?:(?:meu|nosso|o) (?:novo )?objetivo(?: principal)? é)\s+\S/i],
  ["field.current_state",/^(?:hoje|atualmente|no momento)\s+\S/i],
  ["field.desired_state",/^(?:quero (?:automatizar|passar a|deixar de)|o estado desejado é|no futuro quero)\s+\S/i],
  ["field.constraints",/^(?:não (?:posso|podemos)|o limite é|é obrigatório|precisa obrigatoriamente|tem que obrigatoriamente)\s+\S/i],
  ["field.success_criteria",/^(?:considerarei sucesso quando|será um sucesso se|o critério de sucesso é)\s+\S/i],
  ["field.governance_context",/^(?:a aprovação depende de|o responsável é|a responsável é|quem aprova é)\s+\S/i],
];
const reserved=/(?:^|\s)(?:aprovo|autorizo|declaro (?:concluído|completo)|valide (?:a|esta) evidência|emita (?:o|um) handoff|conceda autoridade)(?:\s|$)/i;
const preference=/(?:seria (?:bom|legal|interessante)|would be nice|prefiro|talvez|se possível)/i;
// Bounded deterministic grammar. Unsupported language is not silently mapped.
export function generateInformationCandidates(message:string):InformationCandidate[] {
  const result:InformationCandidate[]=[];
  for(const piece of message.split(/(?:[.!;]\s+|,?\s+mas\s+)/u)) {
    const text=piece.trim().replace(/[.!;]$/u,"");if(!text)continue;
    let field=rules.find(([,pattern])=>pattern.test(text))?.[0];
    if(reserved.test(text))field="field.governance_context";
    else if(preference.test(text))field="field.constraints";
    if(!field)continue;
    result.push(InformationCandidateSchema.parse({fieldId:field,statement:text,sourceText:text,normalization:"VERBATIM",replacement:/^(?:meu|nosso|o) novo objetivo é\s/i.test(text)}));
  }
  return result;
}
// Conservative independence check, never a new domain/category persisted as authority.
export function independentlyAdditive(field:CanonicalInformationField,a:string,b:string):boolean {
  if(field!=="field.constraints")return false;
  const money=/(?:custo|orçamento|reais|gastar|mensal)/i, time=/(?:dias|semanas|prazo)/i;
  return (money.test(a)&&!time.test(a)&&time.test(b)&&!money.test(b)) || (money.test(b)&&!time.test(b)&&time.test(a)&&!money.test(a));
}
export function evaluateInformationCandidate(input:unknown,message:string,current:readonly DiscoveryInformationRecord[]):CaptureEvaluation {
  const candidate=InformationCandidateSchema.parse(input);
  const declared=candidate.normalization==="VERBATIM"?candidate.sourceText:candidate.sourceText.replace(/\s+/gu," ").trim();
  if(reserved.test(candidate.sourceText))return {candidate,outcome:"REQUIRE_HUMAN_DECISION",question:"Esse pedido exige uma decisão humana pelo processo de governança. Qual decisão você deseja encaminhar? Esta conversa não a autoriza."};
  // Generation is a proposal: recheck original text, field and normalization independently.
  const mapped=generateInformationCandidates(message).some(c=>c.fieldId===candidate.fieldId&&c.sourceText===candidate.sourceText&&c.replacement===candidate.replacement);
  if(!mapped||declared!==candidate.statement||preference.test(candidate.sourceText)||/\?|\.\.\.|\b(?:se|talvez|antigamente|antes)\b/i.test(candidate.sourceText))
    return {candidate,outcome:"REQUIRE_CLARIFICATION",question:candidate.fieldId==="field.constraints"?"Isso é uma preferência ou um limite obrigatório? Qual condição precisa ser respeitada?":"Pode esclarecer a declaração, distinguindo a situação atual, a intenção e o que ainda é hipotético?"};
  const existing=current.filter(r=>r.fieldId===candidate.fieldId);
  if(CANONICAL_INFORMATION.physical[candidate.fieldId].cardinality==="MULTIPLE"&&existing.some(r=>!independentlyAdditive(candidate.fieldId,String(r.content.value),candidate.statement)))
    return {candidate,outcome:"REQUIRE_CLARIFICATION",question:"Como essa declaração se relaciona com a informação atual: é um limite independente ou uma correção? Precisamos esclarecer possíveis conflitos antes de registrar."};
  if(CANONICAL_INFORMATION.physical[candidate.fieldId].cardinality==="SINGLE"&&existing.length&&!candidate.replacement)
    return {candidate,outcome:"REQUIRE_CLARIFICATION",question:"Já existe uma declaração atual para esse ponto. Você quer substituí-la? Declare explicitamente o novo objetivo quando for essa a intenção."};
  return {candidate,outcome:"ACCEPT_AS_DECLARED",predecessor:candidate.replacement?existing[0]:undefined};
}
