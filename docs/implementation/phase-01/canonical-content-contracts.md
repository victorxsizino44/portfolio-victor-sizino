# Canonical Content Contracts

## Common record envelope

Every canonical entity MUST carry `canonicalId`, `entityType`, `lifecycleStatus`, `verificationStatus`, `owner`, `classification`, `sourceReferences`, `createdAt`, `updatedAt`, `reviewedAt`, `version` and optional `providerMappings`. Material changes require an audit event.

Allowed lifecycle includes `Draft`, `In Review`, `Approved`, `Published`, `Archived`, `Superseded`, `Deprecated`, `Duplicate`, `Blocked`. Verification is separate: `Verified`, `Verified from Local Evidence`, `Requires Human Approval`, `Requires Human Confirmation`, `Requires Current Verification`, `Requires Legal Validation`, `Unverified`.

`Verified from Local Evidence` confirms reconciliation to a legible local artifact only. It does not prove external validity, ownership, license or permission for public display.

## Entity contracts

| Entity | Required domain fields | Key relations | Approved rule |
| --- | --- | --- | --- |
| Professional Profile | display name, approved headline, approved biography | positioning, chronology, contacts | Uses HD-01/02 only; one active public profile per locale |
| Positioning | proposition, audience, approved claims | profile, skills | Quantitative content requires publishable evidence |
| Company | legal/display name, normalized key, relationship type | experiences, cases, media | Direct employer is distinct from client/project entity |
| Experience | company, annual start/end, official titles, public title, responsibilities | cases, claims | Exact months optional and `Requires Human Confirmation`; never infer gaps/overlap |
| Case Study | title, nature, period, relationship, role, confidentiality, public slug | company, claims, media | Méliuz nature is product case study; SETUR is separate from Porto Seguro |
| Claim | statement, class, evidence, period, publication eligibility | profile, experience/case | Class is `Measured`, `Observed`, `Qualitative`, `Proposed` or `Unverified`; quantitative publication requires evidence |
| Skill / Skill Group | canonical label, description, grouping | experiences, cases | Synonyms map to one provider-neutral ID |
| Certification | official title, institution, completion date, evidence status | evidence, editorial selection | Complete register is separate from public selection; aliases cannot create records |
| Certification Selection | locale, ordered certificate references, rationale | certifications | Contains only approved evidence-eligible records |
| Education | institution, program, annual period, completion | evidence, profile | Months cannot be invented |
| Language | language, public proficiency, basis | profile | Self-declaration is not formal CEFR certification |
| Page / Page Section | page key, locale, route alias, ordered content references | SEO, entities, media | Existing route changes require manifest approval |
| SEO Metadata | title, description, canonical URL, social image | page, approved claims | Cannot publish superseded facts |
| Media Asset | checksum, dimensions, origin, rights owner, rights state | semantic usages, evidence | Binary identity does not imply semantic identity or rights |
| Media Usage | role, entity, alt text, crop, active reference | media asset, page/case/company | Logo, cover, thumbnail and editorial roles remain distinct |
| Social Link | platform, public URL, purpose, priority | profile | Single canonical record with derived consumers |
| Contact Channel | type, public value/reference, purpose, priority, operational state | profile, form | Telephone/WhatsApp are not public; publication does not prove operation |
| Agent Definition | purpose, capability state, limitations | knowledge releases, integration | Public description must match operational evidence |
| Agent Knowledge Source | authority, eligible fields, classification, version, review | agent, evidence | Public availability does not establish eligibility or authority |
| Agent Knowledge Release | release ID, version, checksum, source baseline, publication/approval, rollback ref | agent, sources | Generated only from approved public canonical records |
| Document Reference | document ID, version, locale, checksum, source baseline, approval, stable alias | profile, evidence | CV is derived; current version is `Deprecated` |
| Integration Reference | adapter key, configuration state, verification state | agent/form | Stores no secret and grants no semantic authority |

## Approved domain constraints

- Public metric: only “10+ anos de experiência em tecnologia e produtos digitais”.
- Geography: Brazil professional experience, Ireland in-person experience, remote work for a United States company.
- Phone/WhatsApp: excluded from every public projection and Agent R™ response.
- Certificates: two evidenced Udemy Product Management records remain distinct; translated/short aliases create no third record.
- Power BI: individual 2026 evidence supersedes the former 2025 representation.
- Cases: claims without evidence cannot use causal result language; no team outcome is attributed wholly to Victor.
- CV: one current version per language, stable alias, private rollback version, no independent facts.
- Agent R™: no inferred facts about Victor; absent approved data produces an insufficient-information response.
- Assets: no rights inference, deletion, rename, redirect or deduplication without a later authorized manifest.

## Identity, provenance and resolution

Generate canonical UUID/ULID values before provider creation. Provider IDs and slugs are mappings. Evidence records include source, classification, checksum/stable reference, affected fields, verification state, access eligibility, retention and review date. Transformations identify the input version.

For conflicts: separate fact from narrative, compare authority/provenance, apply the Human Decision Register, mark the old representation `Superseded` or `Deprecated`, identify all projections and reconcile them only during an authorized migration. Reversal restores the prior approved version/mapping and records a new decision; it never rewrites decision history.
