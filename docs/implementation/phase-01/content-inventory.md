# Content Inventory

## Method

Inventory scope covers repository-controlled routes, TypeScript data, hardcoded component content, public assets, the public CV, agent prototypes and integration references. Classification records current evidence, not future implementation.

| Inventory ID | Domain | Current source | Classification | Verification | Owner | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| INV-PRO-001 | Professional profile | `app/data/home.ts`, `app/data/about.ts`, pages, CV, Agent R JSON | Public / Personal | Requires Human Approval | Platform Owner | Name is consistent; titles and summaries vary. |
| INV-POS-001 | Positioning and availability | Home/About/Contact components | Public | Requires Human Approval | Content Owner | Multiple formulations and availability claims. |
| INV-MET-001 | Career metrics | Home/About/Experience/Stack | Public / Derived | Requires Human Approval | Content Owner | Years, projects, products and company counts conflict. |
| INV-EXP-001 | Base experiences (5) | `app/data/experience.ts` | Public | Requires Human Approval | Content Owner | Dates, titles, responsibilities and claims. |
| INV-EXP-002 | International experiences (2) | `app/data/experience.ts` | Public | Requires Human Approval | Content Owner | Webbix and HireVue; titles vary elsewhere. |
| INV-TIM-001 | Career timeline | `app/data/home.ts`, `app/data/about.ts`, CV, Agent R JSON | Public / Derived | Requires Human Approval | Content Owner | Periods and role progression conflict. |
| INV-CAS-001 | Case studies (8) | `app/data/cases.ts`, case routes | Public | Requires Human Approval | Content Owner | Current slugs are public URL aliases. |
| INV-CLM-001 | Case outcomes and metrics | Case records, CV, Agent R JSON | Public / Derived | Requires Human Approval | Content Owner | Evidence linkage is absent. |
| INV-COM-001 | Companies and organizations | About/Experience/Cases/assets | Public | Requires Human Approval | Content Owner | Names, roles and logos repeat across domains. |
| INV-SKL-001 | Skills and competencies | `app/data/about.ts`, `app/data/stack.ts`, CV, Agent R JSON | Public | Requires Human Approval | Content Owner | Taxonomy and proficiency are not governed. |
| INV-SKG-001 | Skill groups (8) | `app/data/stack.ts` | Public | Unverified | Content Owner | Presentation categories currently act as taxonomy. |
| INV-CER-001 | Certifications (15+) | About/Stack/CV | Public / Personal | Requires Human Approval | Content Owner | Near-duplicates and date differences exist. |
| INV-EDU-001 | Education | CV and Agent R JSON | Public / Personal | Requires Human Approval | Content Owner | Evidence and display policy not registered. |
| INV-LAN-001 | Languages | CV and Agent R JSON | Public / Personal | Requires Human Approval | Content Owner | Level vocabulary needs normalization. |
| INV-PAG-001 | Public pages and routes | `app/**/page.tsx` | Public | Verified | Engineering Owner | Eight page templates; dynamic cases expand to eight current URLs. |
| INV-SEC-001 | Page sections and copy | Page/component TSX files | Public | Requires Human Approval | Content Owner | Editorial content is coupled to presentation. |
| INV-NAV-001 | Navigation | Header/Footer/components | Public | Verified | Content Owner | Repeated navigation and contact destinations. |
| INV-SEO-001 | SEO metadata | `app/layout.tsx`, page metadata | Public | Requires Human Approval | Content Owner | Metadata is hardcoded and canonical URLs are incomplete. |
| INV-MED-001 | Images and logos (77 files) | `public/` | Public | Requires Human Approval | Content Owner | Exact duplicate groups and stale candidates exist. |
| INV-DOC-001 | Public CV | `public/victor-sizino-cv.pdf` | Public / Personal | Requires Human Approval | Platform Owner | Derived snapshot; contact value conflicts with site. |
| INV-SOC-001 | Social links | Contact/Footer/Agent R JSON | Public / Personal | Requires Human Approval | Platform Owner | Repeated direct identifiers. |
| INV-CON-001 | Contact channels | Contact/Footer/CV | Public / Personal | Requires Human Approval | Platform Owner | Canonical email/phone policy unresolved. |
| INV-AGT-001 | Agent R definition and UI copy | Agent R page/components/API | Public / Internal | Verified | Engineering Owner | Runtime exists; knowledge boundary is separate. |
| INV-KNW-001 | Agent R public knowledge snapshot | `public/agent-r-knowledge.json` | Public / Derived | Requires Current Verification | Content Owner | No repository import/reference proves consumption. |
| INV-AGT-002 | Agent B public prototype | Agent B page/component/types | Public / Internal | Verified | Engineering Owner | Static informational prototype; no operational agent. |
| INV-INT-001 | Integration references | API routes, environment contract | Internal / Secret-reference | Requires Current Verification | Platform Owner | Make endpoints are configuration, never content authority. |
| INV-FRM-001 | Contact and Agent R request contracts | API routes and UI forms | Public / Operational | Verified | Engineering Owner | Runtime contracts remain outside this documentation-only phase. |

## Route and URL inventory

Preserve the current home, about, experience, cases index, eight case slugs, stack, contact, VS Method and agent routes. Before migration, export an exact route manifest with current status, canonical target, redirect decision and rollback mapping. No current URL is authorized for removal or redirection by this document.

## Asset findings

Eleven exact-content duplicate groups were detected, including repeated Carrefour, HireVue, Méliuz, Houzbuddy, Porto Seguro, Stefanini/Via Varejo, AGU and Reclame Aqui assets. Filename variants such as `-v2` are only candidates until visual and usage review. Deduplication is planned, not executed.
