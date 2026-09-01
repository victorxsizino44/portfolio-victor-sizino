# Migration Inventory

## Universal gates

No migration starts until applicable human decisions, evidence, provider prerequisites, backup/export, URL behavior, reconciliation and rollback are approved. HD-01–HD-08 provide domain policy but do not authorize execution.

Every batch records source version/checksum, mapping version, actor/time, decision baseline, counts before/after, rejected records, reconciliation, private evidence references and rollback outcome. Secrets and unnecessary personal data are excluded.

| Batch | Domain | Approved source/target | Preconditions and open conditions | Validation | Rollback |
| --- | --- | --- | --- | --- | --- |
| MIG-01 | Provider-neutral contracts | Phase 01 docs → repository schemas/adapters | Separate implementation approval | Fixtures and contract review | Revert schema commit |
| MIG-02 | Profile/positioning | HD-01/02 → future Sanity | Exact months not required for annual projection; no inferred 2022–2024 record | Approved fact comparison | Static source remains active |
| MIG-03 | Companies/relationships | HD-01/05 → future Sanity | Employer/client/project mapping | Relationship reconciliation | Static mappings |
| MIG-04 | Experiences/timeline | HD-01 → future Sanity | Months/additional 2022–2024 remain `Requires Human Confirmation` | Dates, titles, gaps and projection comparison | Static Experience data |
| MIG-05 | Metrics/geography | HD-02 → future Sanity | Exclude all superseded numeric counts | Static scan and projection tests | Prior static rendering only if policy-safe |
| MIG-06 | Cases/claims | HD-05 → future Sanity | Classify every claim; Porto Seguro relationship unresolved | Eight routes, nature, role, evidence and confidentiality review | Current case routes/data |
| MIG-07 | Skills/groups | Current sources → future Sanity | Taxonomy approval | Alias/order/reference checks | Static skill data |
| MIG-08 | Certification register | HD-04 evidence table → future Sanity | Missing evidence remains `Requires Human Confirmation`; rights separate | Official title/date/evidence/state comparison | Current listings |
| MIG-09 | Certification selection | Six approved records → public projection | Selection separate from complete register | Exactly six approved selections; no n8n | Existing UI until authorized cutover |
| MIG-10 | Education/languages | HD-04 → future Sanity | Exact education months not invented; self-declarations labeled | Field/projection review | Existing representations |
| MIG-11 | Pages/navigation/SEO | Approved canonical entities → future Sanity | Preview and URL manifest | Route/metadata snapshot | Static components |
| MIG-12 | Contact/social | HD-03 → future Sanity | Form operation verified separately; phone/WhatsApp excluded | Owner confirms public channel projections | Static values, with private data never promoted |
| MIG-13 | CV/document reference | Canonical entities → governed pt-BR document | Document Operations architecture, privacy reconciliation and separate authorization | Checksum/version/source baseline/approval and link test | Restore preceding private approved version |
| MIG-14 | Media | Public files → governed Media Asset/usages | Rights + visual + semantic + reference review; groups 8/9 `Blocked` | Asset table, links, build and manifest | Preserve current files/URLs/mappings |
| MIG-15 | Agent R editorial definition | Approved public agent content → future Sanity | Capability/content review | Public copy regression | Static Agent R copy |
| MIG-16 | Agent R knowledge release | Approved public canonical records → generated release | Sanitized Make inspection; model/source contract; implementation approval | Release ID/version/checksum/source baseline, evals and safe operational test | Prior approved release |
| MIG-17 | Make consumption | Identifiable knowledge release → governed adapter | Active scenario `Requires Current Verification`; no direct CMS access approved | Sanitized scenario inventory and request/response contract | Restore prior external configuration only under separate authorization |
| MIG-18 | Operational provenance | Repository manifests → future Supabase PostgreSQL | Separate implementation, legal/region/retention approval | Migration/reconciliation/audit tests | Export/down migration |
| MIG-19 | Agent B | Static prototype/types | Artifacts 02–04 and later human approval | Future gate | No migration; prototype stays static |

## Superseded and blocked data handling

- Do not migrate project/product/company counts or `12+ anos` as public facts.
- Do not migrate phone/WhatsApp to public channels or Agent R™.
- Do not use the current CV, certificates, Agent R JSON or manual Make content as independent source of truth.
- Do not create a third Product Management certificate from aliases.
- Do not publish n8n certification until evidence is located and confirmed.
- Do not combine Porto Seguro and SETUR.
- Do not migrate asset groups 8 or 9 while `Blocked`.

## URL, asset and document preservation

Capture every current route, case slug, asset path and CV alias before cutover. Existing paths remain active until an approved manifest specifies target, status and rollback. No redirect, asset deletion/rename/deduplication or CV replacement is authorized by this inventory.
