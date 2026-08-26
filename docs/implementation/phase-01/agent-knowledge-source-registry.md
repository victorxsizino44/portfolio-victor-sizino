# Agent Knowledge Source Registry

## Eligibility rules

An agent source is eligible only when its authority, classification, permitted fields, version, owner, verification state, review date and revocation path are registered. Public availability alone does not make a source canonical or agent-eligible. Prompts, provider responses and generated summaries are not evidence.

| Source ID | Agent | Source | Authority / role | Classification | Consumption evidence | Status |
| --- | --- | --- | --- | --- | --- | --- |
| AKS-R-001 | Agent R | `public/agent-r-knowledge.json` | Derived public snapshot; not canonical | Public / Derived | No repository import/reference found; external Make consumption not provable | Requires Current Verification |
| AKS-R-002 | Agent R | `app/data/home.ts`, `about.ts`, `experience.ts`, `cases.ts`, `stack.ts` | Current website inputs | Public | No evidence that Make consumes them directly | Unverified |
| AKS-R-003 | Agent R | `public/victor-sizino-cv.pdf` | Versioned document snapshot | Public / Personal / Derived | Linked by website; agent ingestion not evidenced | Requires Human Approval |
| AKS-R-004 | Agent R | External Make scenario, prompt and mappings | Temporary execution adapter | Internal / Restricted | Not represented in repository | Requires Current Verification |
| AKS-R-005 | Agent R | Future governed knowledge release | Projection from approved canonical records | Classification inherited per field | Not implemented | Proposed |
| AKS-B-001 | Agent B | Agent B page and experience component | Public prototype description | Public / Internal | Rendered by application; no agent retrieval | Verified |
| AKS-B-002 | Agent B | `app/types/agent-b.ts` | Preliminary implementation contract | Internal | Type definitions only | Unverified |
| AKS-B-003 | Agent B | Required Artifacts 02–04 | Future governing inputs | Undetermined | Not available as approved implementation inputs | Blocked |

## Agent R release boundary

The current JSON must not be silently treated as a Sanity seed or canonical dataset. A future release process should select only approved fields, record input versions, validate classifications, generate a checksum, run an evaluation suite, publish atomically and retain the preceding release for rollback. Make must consume a versioned release through a verified contract.

## Agent B boundary

Agent B remains a static informational prototype. No runtime, knowledge ingestion, persistence or autonomous capability is inferred from its page or TypeScript types. Implementation remains `Blocked` until its governing artifacts and human approval exist.

## Security and operations

Do not place secrets, webhook URLs, private evidence or unrestricted personal data in public knowledge artifacts. Quotas, prompt-injection defenses, source citations, evaluation coverage and governed observability remain future gates. Historical logs require separate review without copying user content.
