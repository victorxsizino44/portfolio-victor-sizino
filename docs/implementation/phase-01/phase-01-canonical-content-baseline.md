# Phase 01 — Canonical Content Baseline

## Status

- Phase deliverables: `Implemented and Validated`.
- Human decisions HD-01–HD-08: recorded on 2026-08-26 by Victor Sizino.
- Conditional verification gates: open.
- Runtime, providers, production data and integrations: unchanged.
- Architecture: Option A — Managed Modular Platform (`Approved`).

This baseline records approved policy and facts without treating pending evidence as approval. Phase 02, migration, merge and deployment require separate authorization.

## Governing order

1. Approved Governance & Architecture Decision Pack.
2. Approved Content & Data Foundation Specification.
3. Approved Backend Foundation Architecture & Operations Specification.
4. Approved Editorial CMS Architecture & Publishing Operations Specification.
5. [Human Decision Register](human-decision-register.md).
6. Current repository evidence.
7. Phase 01 Consolidated Assessment as read-only discovery evidence.

Conflicting representations become `Superseded`, `Deprecated`, `Duplicate`, `Blocked`, `Requires Human Confirmation` or `Requires Current Verification`; they are never silently promoted to canonical truth.

## Canonical principles

- Domain meaning is provider-neutral; Sanity, Supabase and Make cannot redefine it.
- Canonical identifiers are immutable and independent from provider IDs, slugs and URLs.
- Slugs and routes are representations, not identity.
- Claims require provenance, verification state, owner and review lifecycle.
- Quantitative claims are public only with corresponding evidence.
- Generated/inferred content cannot become a canonical fact without human approval.
- Public, internal, personal, inferred and unverified information remain separable.
- Preserve before transform; map before importing; define rollback before cutover.
- Make is a temporary integration and remains `Requires Current Verification`, never a source of truth.
- CV, certificates and knowledge releases are derived evidence/projections, not independent canonical authorities.

## Approved content baseline

- Career chronology uses annual precision from 2014; exact months and any additional 2022–2024 experience remain `Requires Human Confirmation`.
- The only approved public quantitative professional metric is **“10+ anos de experiência em tecnologia e produtos digitais”**.
- Approved geography distinguishes Brazil professional experience, in-person Ireland experience and remote work for a United States company.
- Public contact channels are Fale Comigo, canonical email, LinkedIn and Cal.com. Telephone and WhatsApp are not public.
- Certification registry and public editorial selection remain separate. Local evidence reconciliation does not prove external validity or image publication rights.
- Eight cases are approved subject to claim classifications. Méliuz is a product case study, not employment. The approved public-sector case is `Portal de Turismo — SETUR`; `Porto Seguro/SETUR` is not a combined canonical entity.
- Current CV is `Deprecated` but preserved at its stable URL until a separately authorized replacement.
- Future Agent R™ knowledge must be a governed release derived only from approved public canonical records.
- Asset groups 8 and 9 are `Blocked`; no asset mutation is authorized.

## Authority allocation

- **Sanity:** proposed editorial system of record for approved public content and editorial media metadata.
- **Supabase PostgreSQL:** proposed operational system for registries, provenance, audit and later transactional data.
- **Supabase Storage:** proposed storage for approved private/operational binaries.
- **Repository:** source of truth for provider-neutral schemas, application code, migration manifests and non-secret configuration contracts.
- **Vercel environment:** runtime configuration and secret references only.
- **Make:** execution adapter only; active knowledge contract is unverified.

See [source-of-truth matrix](source-of-truth-matrix.md).

## Identity and lifecycle vocabulary

Canonical production records use provider-neutral opaque UUID/ULID values. Documentation IDs such as `HD-01` and `INV-EXP-001` are traceability labels, not provider or production identifiers.

Lifecycle: `Draft`, `In Review`, `Approved`, `Published`, `Archived`, `Superseded`, `Deprecated`, `Duplicate`, `Blocked`.

Verification: `Verified`, `Verified from Local Evidence`, `Requires Human Approval`, `Requires Human Confirmation`, `Requires Current Verification`, `Requires Legal Validation`, `Unverified`.

`Verified from Local Evidence` means a legible local artifact matches the recorded value. It does not establish external validity, rights or permission to publish the artifact.

## Phase boundaries

No CMS schema, database, account, import, redirect, analytics, secret, webhook, asset operation, CV replacement or deployment is authorized. Agent B™ remains `Blocked`. Agent R™ may continue its current operation, but source/prompt/model behavior remains unverified.

The optional `content-inventory.json` remains intentionally absent to avoid a second manually maintained representation before an approved machine schema and validator exist.

## Deliverables

- [Content inventory](content-inventory.md)
- [Canonical content contracts](canonical-content-contracts.md)
- [Source-of-truth matrix](source-of-truth-matrix.md)
- [Duplication and conflict register](duplication-conflict-register.md)
- [Migration inventory](migration-inventory.md)
- [Agent knowledge source registry](agent-knowledge-source-registry.md)
- [Human decision register](human-decision-register.md)

## Later decision baseline — historical preservation notice

On 2026-09-01, Victor Sizino approved the [Career Positioning Review & Decision Baseline v0.1](../phase-02/career-positioning-review-decision-baseline-v0.1.md). It establishes a future frontend-first projection and a superseding professional-WhatsApp decision.

This later baseline:

- does not reopen Phase 01;
- does not alter the fact that Phase 01 was completed correctly under the decisions available on 2026-08-26;
- does not silently replace HD-03 or HD-06 history;
- does not change canonical employment chronology or official titles;
- does not authorize implementation, publication, migration, CV replacement, agent changes, asset changes, LinkedIn updates or deployment.

Phase 01 remains `Completed — Approved, Merged and Production Verified`. Future projections must apply the later baseline where it expressly supersedes positioning or WhatsApp policy, while all unresolved evidence, Make, asset, legal and operational gates remain open.
