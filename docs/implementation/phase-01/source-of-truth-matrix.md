# Source-of-Truth Matrix

This matrix describes the approved architectural destination. It does not assert that providers are configured today.

| Domain | Current source | Proposed canonical authority | Derived projections | Status / condition |
| --- | --- | --- | --- | --- |
| Profile and positioning | TS/TSX, CV, Agent R JSON | Sanity | Website, CV, agents | Requires Human Approval |
| Companies | TS/TSX and assets | Sanity | Experience/case views | Requires Human Approval |
| Experiences and timeline | TS data, CV, Agent R JSON | Sanity | Website, CV, agents | Requires Human Approval |
| Cases and public claims | TS data, CV, Agent R JSON | Sanity | Routes, cards, agents | Requires Human Approval |
| Skills and groups | TS data, CV, Agent R JSON | Sanity | Website, CV, agents | Requires Human Approval |
| Certifications | TS data, CV | Sanity | Website and documents | Requires Human Approval |
| Education and languages | CV, Agent R JSON | Sanity | Documents and agents | Requires Human Approval |
| Pages, sections, navigation, SEO | TSX/layout | Sanity | Next.js rendering | Proposed |
| Editorial media metadata | `public/` and TS references | Sanity | Next.js/CDN | Rights review required |
| Private/operational binaries | None governed | Supabase Storage | Authorized operational views | Blocked pending implementation baseline |
| Public contact/social data | TSX, CV, Agent R JSON | Sanity | Website, CV, agents | Requires Human Approval |
| Consent and form submissions | Runtime passthrough only | Supabase PostgreSQL when approved | Operations | Not implemented; no ledger in scope |
| Provenance/evidence registry | Not governed | Supabase PostgreSQL | Editorial workflows | Proposed; legal/retention validation needed |
| Integration registry/audit | Code/env contracts | Supabase PostgreSQL when approved | Operations | Proposed |
| Domain schemas and adapters | Repository | Repository | Runtime/provider schemas | Approved boundary |
| URL and migration manifests | Repository | Repository | Deploy/migration tooling | Proposed |
| Runtime configuration | Environment variables | Vercel environment | Runtime | Requires Current Verification |
| Secrets | External secret stores | Approved provider secret facility | Runtime only | Never content; remain external |
| Make scenarios/responses | External Make workspace | No canonical authority | Temporary execution output | Requires Current Verification |
| Agent R knowledge release | Public JSON snapshot | Sanity source set + governed release manifest | Make/Agent R projection | Consumption Requires Current Verification |
| Agent B knowledge/runtime | Static prototype/types | Undetermined after Artifacts 02–04 | Future agent | Blocked |
| Analytics events | None governed | Future Phase 04 decision | PostHog when approved | Blocked |

## Boundary rules

Sanity owns editorial state, not operational truth. Supabase owns later operational records, not editorial semantics. The repository owns contracts and code, not mutable editorial facts. Environment variables carry configuration, not content. Make may transform and transport data but cannot originate canonical truth.
