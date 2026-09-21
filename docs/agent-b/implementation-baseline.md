# Agent B — implementation reference (B00)

Compact technical reference only; not a governance artifact or a replacement for
the approved/frozen Implementation Baseline v0.1 or Implementation Plan v0.1.
Stage 07.1 is complete; Stage 07.2/B00 is authorized. B01–B09 are not authorized.
Victor Sizino remains the Human Governance Authority.

## Architecture Boundary

Presentation → Transport → Application Services → Governed Core → Ports → Infrastructure Adapters → Providers.

Direction: **Next.js Full-Stack Modular Runtime**. This chain describes conceptual
responsibilities, not permission for the core to import concrete adapters.

Existing presentation remains in `app/`. B00 reserves `lib/agent-b/transport/`,
`application/`, `core/`, `ports/` and `infrastructure/`. Future Route Handlers in
`app/api/` must be thin. Core/ports remain independent of Next.js and provider SDKs;
adapters stay outside domain/application. ESLint guards these dependency boundaries.
`app/types/agent-b.ts` is prototype material, not the new architecture's source of truth.
Existing Agent R/contact handlers are not architectural templates for Agent B.

`infrastructure/config.server.ts` is the future configuration entry point. It
imports a native Node server boundary with a browser runtime guard. Never import
infrastructure into a client dependency graph or serialize its configuration to
presentation. B00 needs no env variables: configuration is frozen and empty, and
`.env.example` stays unchanged. Add only approved, explicitly selected and validated
settings here in later batches; never expose the environment wholesale.

Correlation primitives identify requests and operations only; they grant no
identity, authorization, governed ordering or semantic lineage. Safe errors expose
only a fixed public code/message, with no arbitrary exception details or logging.

Validation: `npm test` discovers `tests/**/*.test.ts`, including nested Agent B
tests, using the existing native Node runner. `npm run lint`, `npm run typecheck`
and `npm run build` are separate gates. TypeScript permits explicit `.ts` imports
for native tests; typecheck writes no incremental cache. Use a Node version that
supports native TypeScript and test globs (B00 validated with Node 24).

## Authority Boundaries

- Persistence ≠ Semantic Authority
- Conversation ≠ Discovery State
- Session ≠ Discovery
- Authentication ≠ Authorization
- Authentication ≠ Human Governance
- File ≠ Evidence
- Storage ≠ Evidence Authority
- AI Output ≠ Governed State
- Structured Validation ≠ Semantic Validation
- Retrieval ≠ Evidence
- Runtime Ordering ≠ Governance Authority
- Background Execution ≠ Semantic Authority
- Email ≠ Identity Authority
- Email ≠ Handoff
- Analytics ≠ Runtime Lineage
- Operational Logs ≠ Governed History
- Deployment Provider ≠ Architecture Authority
- Free Tier ≠ Governance Exception

## Implementation Dependency Invariants

- DI-01 Presentation cannot become semantic authority.
- DI-02 Transport cannot contain Governed Core rules.
- DI-03 Persistence must exist before durable runtime behavior.
- DI-04 Identity must exist before private Discovery access.
- DI-05 AI cannot precede minimum governed context.
- DI-06 AI candidate cannot directly mutate persistence.
- DI-07 MC-03 execution requires runtime context.
- DI-08 Upload cannot become Evidence directly.
- DI-09 Resume cannot depend on transcript replay.
- DI-10 Working Briefing must derive from governed state.
- DI-11 Handoff requires explicit eligibility/governance.
- DI-12 Analytics cannot become dependency of a material operation.
- DI-13 Provider failure cannot redefine governed state.
- DI-14 No implementation batch may silently introduce a new architectural authority.

## Critical semantic invariants

- Inference ≠ Fact
- Statement ≠ Evidence
- Evidence Received ≠ Evidence Validated
- Confidence ≠ Truth
- Silence ≠ Approval
- Recommendation ≠ Decision
- New Session ≠ New Discovery
- Resume ≠ Transcript Replay
- Working Briefing ≠ Governed Handoff
- AI cannot declare completion
- Human Governance remains authoritative

## Providers and free-tier rule

Future approved providers: Supabase, Gemini, Resend and PostHog; Vercel is the
runtime/deployment provider. **Do not configure them in B00.** No functional
conversation, API, persistence, authentication, Discovery, AI, Evidence, upload,
resume, Working Briefing or Handoff is implemented by this foundation.

**Free-tier-first.** Provider quota/cost pressure must never weaken governance,
security, privacy or semantic correctness.
Paid capability or new provider requirement → **Human Decision Required**.

## STOP rule

Architecture conflict or missing material decision → **STOP → report → Human Decision**.
