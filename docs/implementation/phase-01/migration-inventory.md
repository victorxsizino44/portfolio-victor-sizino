# Migration Inventory

## Gates

No migration starts until material conflicts are approved, provider prerequisites are currently verified, secrets remain external, a backup/export exists, URL behavior is mapped and rollback is tested. Each batch must reconcile record counts, canonical IDs, references, checksums and public rendering.

| Batch | Domain | Source | Target projection | Preconditions | Validation | Rollback |
| --- | --- | --- | --- | --- | --- | --- |
| MIG-01 | Contract scaffolding | This Phase 01 baseline | Repository schemas/adapters | Human approval of Phase 01 | Schema fixtures and contract review | Revert schema commit |
| MIG-02 | Profile/positioning | Home/About/TSX/CV | Sanity | HD-01/02/03 resolved | Field/provenance comparison | Keep static TS source active |
| MIG-03 | Companies | Experience/Cases/assets | Sanity | Normalized company list | Relationship and logo checks | Static mappings |
| MIG-04 | Experiences/timeline | Experience/About/Home/CV | Sanity | HD-01 resolved | Date/title/order reconciliation | Static experience data |
| MIG-05 | Cases/claims | Cases/CV/knowledge JSON | Sanity | HD-05 and evidence policy | Eight slugs, claims, media and routes | Static cases and route aliases |
| MIG-06 | Skills/groups | About/Stack/CV | Sanity | Taxonomy approved | Alias, ordering and reference checks | Static skill data |
| MIG-07 | Credentials/education/languages | About/Stack/CV/JSON | Sanity | HD-04 resolved | Evidence and public projection review | Existing static projections |
| MIG-08 | Pages/sections/navigation/SEO | TSX/layout | Sanity | Page models and preview approved | Route/metadata snapshot comparison | Static components |
| MIG-09 | Media | `public/` | Sanity asset pipeline | Rights and duplicate decisions | Checksums, alt text and link checks | Existing public paths |
| MIG-10 | Contact/social | Contact/Footer/CV/JSON | Sanity | HD-03 and privacy review | Owner confirms every public channel | Static values; secrets untouched |
| MIG-11 | CV/document references | Public PDF | Sanity metadata + governed generation later | HD-06 resolved | Checksum, version and link test | Existing PDF |
| MIG-12 | Agent R editorial definition | Page/components | Sanity | Capability/content alignment review | Public copy regression | Static Agent R copy |
| MIG-13 | Agent R knowledge release | Public JSON and approved canonical content | Governed release artifact | Consumption verified; source policy approved | Contract test and safe operational test | Current approved JSON snapshot |
| MIG-14 | Operational registries/provenance | Repository manifests | Supabase PostgreSQL | Separate implementation approval, legal/region review | Migration/reconciliation/audit tests | Export and down migration |
| MIG-15 | Agent B | Static page/types | Undetermined | Artifacts 02–04 approved | Future gate | No migration; prototype remains static |

## URL preservation

Before any cutover, capture every current route and case slug with expected status, target canonical ID, locale, canonical URL and redirect behavior. Existing paths remain authoritative public aliases during migration. Redirects require review and must be reversible.

## Evidence package per batch

Store the source version/checksum, mapping version, execution actor/time, counts before/after, rejected records, reconciliation result, screenshots or contract output where appropriate, and rollback outcome. Do not copy secrets or unnecessary personal data into evidence.
