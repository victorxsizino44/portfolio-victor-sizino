# Phase 01 — Canonical Content Baseline

## Status

- Phase: `Implemented and Validated, Awaiting Human Approval`
- Scope: contracts, inventory, ownership, provenance and migration planning only.
- Runtime, providers, production data and integrations: unchanged.
- Architecture: Option A — Managed Modular Platform (`Approved`).

## Governing order

1. Approved Governance & Architecture Decision Pack.
2. Approved Content & Data Foundation Specification.
3. Approved Backend Foundation Architecture & Operations Specification.
4. Approved Editorial CMS Architecture & Publishing Operations Specification.
5. Current repository evidence.
6. Phase 01 Consolidated Assessment as read-only discovery evidence.

When sources disagree, no document silently promotes a value to canonical truth. The discrepancy enters the [duplication and conflict register](duplication-conflict-register.md) and, when material, the [human decision register](human-decision-register.md).

## Canonical principles

- Domain meaning is provider-neutral; Sanity, Supabase and Make cannot redefine it.
- Canonical identifiers are immutable and independent from provider IDs, slugs and URLs.
- Slugs and routes are addressable representations, not identity.
- Claims require provenance, verification state, owner and review lifecycle.
- Generated or inferred content cannot become a canonical fact without human approval.
- Public, internal, personal, inferred and unverified information remain separable.
- Preserve before transform; map before importing; define rollback before cutover.
- Migrations occur by domain and require evidence, reconciliation and approval.
- Make is a temporary, non-critical integration and is never a source of truth.

## Authority allocation

- **Sanity:** proposed editorial system of record for governed public content and editorial media metadata.
- **Supabase PostgreSQL:** proposed operational system of record for registries, provenance, audit and later transactional data.
- **Supabase Storage:** proposed storage for private or operational binary objects when approved.
- **Repository:** source of truth for provider-neutral schemas, application code, migration manifests and non-secret configuration contracts.
- **Vercel environment:** runtime configuration and secret references only; never canonical content.
- **Make:** execution adapter only.

See the field-level allocation in the [source-of-truth matrix](source-of-truth-matrix.md).

## Stable identity convention

Canonical records MUST use an opaque UUID or ULID generated independently of providers. Documentation inventory references use human-readable IDs such as `INV-EXP-001`; these are traceability labels, not production identifiers. Each provider adapter stores the canonical ID alongside its own implementation ID. Existing public slugs remain aliases until an approved URL manifest changes them.

## Governed lifecycle vocabulary

Content records use only these lifecycle states until a later approved revision: `Draft`, `In Review`, `Approved`, `Published`, `Archived`, `Blocked`. Verification is tracked separately as `Verified`, `Requires Human Approval`, `Requires Current Verification`, `Requires Legal Validation`, or `Unverified`.

## Phase boundaries

This phase does not create CMS schemas, databases, provider accounts, imports, redirects, analytics, secrets, webhooks or deployments. Agent B™ remains `Blocked`. Agent R™ remains a partial prototype; its current knowledge consumption by Make is `Requires Current Verification`.

The optional `content-inventory.json` was intentionally not created. A second manually maintained representation would introduce drift before an approved machine schema and validator exist. The Markdown inventory is the single Phase 01 implementation artifact.

## Deliverables

- [Content inventory](content-inventory.md)
- [Canonical content contracts](canonical-content-contracts.md)
- [Source-of-truth matrix](source-of-truth-matrix.md)
- [Duplication and conflict register](duplication-conflict-register.md)
- [Migration inventory](migration-inventory.md)
- [Agent knowledge source registry](agent-knowledge-source-registry.md)
- [Human decision register](human-decision-register.md)
