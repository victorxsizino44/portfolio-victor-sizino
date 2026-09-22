# Governed Core

B01 contains structural TypeScript + Zod contracts in `primitives.ts`, `mc01.ts`,
`mc02.ts` and `runtime-primitives.ts`. Keep this layer independent of Next.js,
environment access, application/transport concerns and provider SDKs.

Pass external input as `unknown` to a schema's `parse`/`safeParse`. All contract
objects reject unknown keys; no defaults infer state, evidence or approval.
Parsing checks shape and local snapshot consistency, not semantic truth,
reference existence, identity, authorization or the authority of a decision.
Even a parsed FACT, VALIDATED evidence reference or COMPLETE declaration still
requires authoritative verification by future governed application behavior.

Representation choices (not new semantic authorities): opaque IDs are nonblank
strings branded by purpose; entity/runtime versions are separately branded
nonnegative safe integers without increment logic; timestamps use ISO 8601 with
an explicit timezone. Provenance and human decisions are references only.
Information values use JSON, including explicit null; omission is not null.

Validation steps form a fixed ordered tuple, with PENDING/PASSED/FAILED recorded
results. Human confirmation and operational approval reference human decisions.
There is no transition algorithm, automatic assessment or stage advancement.
Completion has a separate level and lifecycle; COMPLETE requires an explicit
human decision reference and cannot coexist with a declared unresolved critical
dependency. This check does not authenticate that decision or certify completion.
No confidence level changes the content kind or supplies a human decision.

MC-02 primaryNature is optional and plural; no unapproved nature taxonomy is
introduced. Scope segments belong to the one parent Discovery. Applicability,
scope boundary and specialization resolution remain distinct vocabularies.

See `docs/agent-b/prototype-type-reconciliation.md` for the legacy UI mapping.
