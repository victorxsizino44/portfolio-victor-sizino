# B02 — persistence and identity foundation

Implementation reference only. No change to semantic governance or to the B01
contracts. No MC-01 runtime, Discovery conversation, endpoint, UI migration,
Storage, email provider integration, resume or B03+ behavior is introduced.

## Boundaries

Future transport calls application services. `DiscoveryFoundation` authenticates
the current principal and checks DiscoveryAccess AND root ownership for every
existing-root operation. Email verification never grants access to another root.
Only OWNER is represented; sharing, reassignment and access administration are
outside B02. `IdentityFoundation` preserves existing identities and delegates
email verification through the identity port, with no persistence dependency.

Provider-neutral contracts and concrete capability ports are separate from the
Supabase adapters. The server composition creates a fresh SSR client per request;
it does nothing on import. Future transport must supply writable cookies AND
apply every cache header passed to `setAll`. Auth cookies are secure/HttpOnly;
requests are not cached. No client-side mutation interface or API is exposed.

## Migration and transactions

`supabase/migrations/20260922000100_agent_b_identity_persistence.sql` creates only
the operational Discovery root and its owner access. The composite foreign key
ties access identity to root owner. Both reference stable `auth.users.id`; email
is not copied. Foreign keys use RESTRICT, never destructive cascade.

RLS protects SELECT, with explicit grants only to authenticated identities,
including anonymous authenticated users. The unauthenticated `anon` role has no
access. Direct INSERT/UPDATE/DELETE are not granted. Application authorization is
mandatory even though RLS provides a second boundary.

Two specific transactional operations are implemented: root+access creation in
one RPC transaction, and atomic expected-entity-version compare-and-increment.
They are not a generic transaction callback or GenericRepository. Each RPC is
atomic; multiple RPCs are NOT one transaction. Future batches must not split a
material multi-table transaction across these calls or treat a version bump as a
semantic operation. No RuntimeVersion is stored, generated or advanced here.

Public RPC wrappers use SECURITY INVOKER. Their narrow SECURITY DEFINER helpers
live in `agent_b_private`, with pinned empty search paths, explicit names, revoked
default execution grants, and repeated auth UID/ownership checks. Their privileged
table access is intentional and does not rely on RLS being applied to a definer.
Keep `agent_b_private` out of Data API exposed schemas. Grants opt in only the two
module tables for reads and two wrapper functions for authenticated operations.
No service-role key is used by the runtime.

## Auth and identity continuity

Anonymous authentication uses `signInAnonymously`. Authenticated identity is
obtained through server-side `getUser`, never an unverified cookie user or user
metadata. Email upgrade calls `updateUser({email})` on that same user, followed by
`verifyOtp` with `email_change`. Verification must return the same user ID and an
email-confirmed permanent identity. A mismatched session is signed out locally
and rejected; no account merge or ownership reassignment is attempted. A failure
or existing-email collision does not create another Discovery.

The transport/auth UI and link callback are not implemented. The provided
verification capability supports a code supplied in the current authenticated
session. Future transport must integrate it without bypassing the application.
No email is sent by tests or by importing/composing this foundation.

## Configuration and validation limits

Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are read,
centrally and lazily. `.env.example` contains blank values. Secret/service-role
key formats are rejected; no database credential is needed by the runtime.
Unconfigured builds remain valid, but invoking the provider factory fails closed.

The migration has NOT been applied and live integration has NOT been validated.
Unit tests use doubles or SDK requests intercepted by a fake fetch. Static SQL
contract tests do not establish PostgreSQL syntax validity, transactional behavior
or actual RLS enforcement. No Supabase CLI, SQL driver or test database dependency
is installed. No remote account, user, email, policy or resource is changed.

Before live validation, configure the two public variables outside Git and confirm
manual identity linking is enabled in addition to anonymous sign-in, email and
confirmation. Applying the migration requires an authorized PostgreSQL migration
connection (host/database/user/password, with privileges to create the module's
schemas/tables/functions/policies and reference auth.users), or an authorized
operator applying it through the Supabase SQL Editor. None was available here.
Do not substitute a service-role API key for database migration credentials.
STOP before attempting credential-dependent migration/integration work; request
the authorized environment instead. No credentials belong in source or reports.

Required live checks remain: apply in an isolated database; use two authenticated
principals and an unauthenticated client; verify read/write denials, root+access
rollback on failure, competing CAS requests, and same-user email upgrade.

## Provider references

- [Anonymous identity upgrade](https://supabase.com/docs/guides/auth/auth-anonymous)
- [SSR client and cookies](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [RLS and explicit privileges](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Database functions and transaction boundary](https://supabase.com/docs/guides/database/functions)

Authentication ≠ Authorization ≠ Human Governance. Persistence ≠ Semantic Authority.
