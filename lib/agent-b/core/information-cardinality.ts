// Physical projection of the frozen R08-10 baseline. Not a semantic registry.
export const INFORMATION_FIELDS = Object.freeze({
  "field.subject_context": { cardinality: "SINGLE", domainId: null },
  "field.primary_objective": { cardinality: "SINGLE", domainId: "domain.business" },
  "field.current_state": { cardinality: "SINGLE", domainId: "domain.business" },
  "field.desired_state": { cardinality: "SINGLE", domainId: "domain.business" },
  "field.constraints": { cardinality: "MULTIPLE", domainId: "domain.business" },
  "field.success_criteria": { cardinality: "MULTIPLE", domainId: "domain.business" },
  "field.governance_context": { cardinality: "MULTIPLE", domainId: "domain.governance" },
} as const);
export function informationField(id: string) { return INFORMATION_FIELDS[id as keyof typeof INFORMATION_FIELDS]; }
