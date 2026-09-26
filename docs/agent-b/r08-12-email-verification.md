# R08-12R — Progressive identity MVP reconciliation

Approved MVP: Supabase Auth default SMTP + default Change Email Address
ConfirmationURL. Future target: Resend SMTP + custom Email OTP. No Resend setup,
custom template, domain purchase or billing change is required by this MVP.

## Existing authenticated session

1. Keep the original anonymous authenticated browser session open. Anonymous
   sessions cannot be recovered after logout by presenting an email or Discovery ID.
2. POST `/api/agent-b/identity/email/request` with `{ discoveryId, email }`, using
   the existing Auth cookies. The server authorizes ownership/access before
   `updateUser({ email })`. Requested does not mean delivered or verified.
3. The human opens Supabase's default email confirmation link. Supabase consumes
   ConfirmationURL and verifies the email. Agent B does not ingest callback tokens,
   link fragments or client verification assertions.
4. Return to the original authenticated tab. POST
   `/api/agent-b/identity/email/status` with `{ discoveryId }`. The server queries
   trusted `getUser()` state and requires the same identity that owns/accesses this
   Discovery. Status is VERIFIED or VERIFICATION_REQUIRED, with no email/token data.

The status endpoint is read-only and does not create a session, root, access,
authority or decision. A foreign verified identity cannot claim another Discovery.
Do not treat visiting a redirect page as successful verification. Preserve the
original session; no sign-in, session exchange or ownership merge is introduced.

The existing `/identity/email/verify` OTP endpoint remains available for the future
configured OTP mechanism; it is not required or invoked for the MVP link flow.
Resend remains delivery-only if configured in a future authorized stage.

## Real validation and human action

Default SMTP has recipient restrictions and rate limits; verify the intended
recipient is permitted by the current Supabase project. Do not bypass restrictions
or enable paid SMTP. No email is sent without an intended recipient and accessible
original session. Keep email and all credentials out of logs, fixtures and reports.

Record baseline identity/root/access and governed counts before requesting email.
After the human confirms delivery and follows the link, verify trusted identity ID,
Discovery/Access preservation and absence of new governed records. Never request
that the human paste confirmation URLs, cookies or tokens into the conversation.

Code tests, email delivery, confirmation, identity upgrade and same-Discovery
continuity are separate gates. Simulated provider confirmation is not real PASS.

## Official references

- https://supabase.com/docs/guides/auth/auth-anonymous
- https://supabase.com/docs/guides/auth/auth-email-templates
- https://supabase.com/docs/guides/auth/auth-smtp
