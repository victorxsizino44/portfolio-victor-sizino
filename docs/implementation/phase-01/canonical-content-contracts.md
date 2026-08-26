# Canonical Content Contracts

## Common record envelope

Every canonical entity MUST carry: `canonicalId`, `entityType`, `lifecycleStatus`, `verificationStatus`, `owner`, `classification`, `sourceReferences`, `createdAt`, `updatedAt`, `reviewedAt`, `version`, and optional `providerMappings`. Material changes require an audit event. Public projection must exclude internal, restricted and secret fields.

`sourceReferences` identify evidence without copying secrets or unnecessary personal data. A canonical fact records the responsible source, verification state and reviewer. Narrative may reference facts but cannot silently replace them.

## Entity contracts

| Entity | Required domain fields | Key relations | Canonicality rule |
| --- | --- | --- | --- |
| Professional Profile | display name, approved headline, approved biography | positioning, contact channels, social links | One active public profile per locale. |
| Positioning | label, proposition, audience, approved claims | profile, skills | Claims require provenance and review. |
| Company | legal/display name, normalized key | experiences, cases, media | Display variants map to one canonical company. |
| Experience | company, role title, start/end, location, summary | skills, cases, claims | Dates and titles require human approval. |
| Case Study | title, summary, status, participation, period, public slug | company, claims, media, skills | Slug is an alias; unpublished evidence remains non-public. |
| Claim | statement, metric/value, scope, evidence, verification | profile, experience or case | No publication when material evidence is unverified. |
| Skill | canonical label, description | skill group, experiences, cases | Synonyms map to one skill ID. |
| Skill Group | label, order | skills | Presentation order is not identity. |
| Certification | title, issuer, issue date, credential reference | profile, evidence | Near-duplicates resolve before import. |
| Education | institution, program, level, period | profile, evidence | Public projection follows approved privacy policy. |
| Language | language, normalized proficiency | profile, evidence | Use one approved proficiency vocabulary. |
| Page | page key, locale, route alias, lifecycle | sections, SEO metadata | Route changes require URL manifest approval. |
| Page Section | section key, type, ordered content references | page, entities, media | Structured references preferred over copied facts. |
| Navigation Item | label, destination, order, visibility | page | External destinations require ownership review. |
| SEO Metadata | title, description, canonical URL, social image | page, media | Canonical URL must resolve from approved route manifest. |
| Media Asset | asset role, alt text, rights status, checksum | pages, cases, companies | Checksum detects duplicates; rights state gates publication. |
| Social Link | platform, public URL, label | profile | URL approval belongs to Platform Owner. |
| Contact Channel | type, public value/reference, purpose | profile, form | Personal/public classification and display are explicit. |
| Agent Definition | agent key, purpose, capability state, limitations | knowledge sources, integrations | Public description must match operational capability. |
| Agent Knowledge Source | source type, authority, eligibility, version, review date | agent, evidence | Inclusion requires registered authority and classification. |
| Agent Public Content | approved description, disclosures, CTA | agent, page | Editorial content is separate from prompts/runtime. |
| Document Reference | document type, version, public URL, checksum | profile, evidence | Document is a snapshot, not canonical truth. |
| Integration Reference | integration type, adapter key, configuration status | agent/form | Stores no secret value and grants no semantic authority. |

## Identity and URL rules

- Generate canonical UUID/ULID before provider creation.
- Maintain `providerMappings` as replaceable adapters.
- Never use Sanity `_id`, Supabase row ID, Make scenario ID or URL slug as canonical identity.
- Preserve existing slugs as aliases until a reviewed redirect manifest is approved.
- Prevent reuse of retired canonical IDs and public slugs.

## Provenance and evidence

Evidence records include type, responsible source, classification, stable reference/checksum, related entity/fields, verification state, access eligibility, retention rule and review date. Transformations point to an input version. Generated/inferred content is labeled and cannot directly promote itself to fact.

## Resolution procedure

For a conflict: identify the subject; separate facts from narrative; compare authority and provenance; classify the difference; propose a canonical target; identify every representation affected; obtain human approval for material changes; then update and reconcile all projections.
