import { INFORMATION_FIELDS } from "./information-cardinality.ts";

// Versioned projection of the approved R08-10 mapping matrix, not a new authority.
export const CANONICAL_INFORMATION = Object.freeze({
  version: "R08-10/v1.0",
  authority: "HUMAN_GOVERNED_BASELINE",
  domains: Object.freeze(["domain.identity", "domain.business", "domain.market", "domain.portfolio", "domain.brand", "domain.governance"]),
  fields: Object.freeze({
    "field.subject_context": "Objeto, iniciativa ou assunto central. Não objetivo, resultado, limite ou decisão.",
    "field.primary_objective": "Resultado principal explicitamente pretendido. Não estado atual, condição futura detalhada ou métrica.",
    "field.current_state": "Condições, processos, práticas ou ferramentas presentes declaradas. Não causa, problema inferido ou solução.",
    "field.desired_state": "Condição futura desejada explicitamente. Não solução aprovada, requisito aprovado ou objetivo genérico.",
    "field.constraints": "Limites explícitos que restringem alternativas. Preferência não é restrição.",
    "field.success_criteria": "Condições explícitas para reconhecer sucesso. Não inventar métricas a partir de objetivos.",
    "field.governance_context": "Atores, papéis, responsabilidades e dependências de aprovação descritivos. Não autoridade, decisão, aprovação ou conclusão.",
  }),
  physical: INFORMATION_FIELDS,
  initialConfidence: "UNVERIFIED",
} as const);
export type CanonicalInformationField = keyof typeof CANONICAL_INFORMATION.fields;
