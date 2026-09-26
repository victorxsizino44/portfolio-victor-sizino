create table if not exists public.agent_b_runtime_state (
 discovery_id uuid primary key references public.agent_b_discoveries(discovery_id) on delete restrict,
 runtime_version bigint not null check(runtime_version>=0 and runtime_version<=9007199254740991),
 freshness text not null check(freshness in ('CURRENT','REEVALUATION_REQUIRED','HISTORICAL')),
 current_state jsonb not null,
 pending jsonb not null default '[]'::jsonb
);
create table if not exists public.agent_b_sessions (
 session_id text primary key,
 discovery_id uuid not null references public.agent_b_discoveries(discovery_id) on delete restrict,
 previous_session_id text null references public.agent_b_sessions(session_id) on delete restrict,
 lifecycle text not null check(lifecycle in ('OPEN','INTERRUPTED','CLOSED')),
 created_at timestamptz not null,
 unique(discovery_id, session_id),
 check(previous_session_id is null or previous_session_id <> session_id)
);
create unique index if not exists agent_b_one_open_session on public.agent_b_sessions(discovery_id) where lifecycle='OPEN';
alter table public.agent_b_runtime_state enable row level security; alter table public.agent_b_sessions enable row level security;
revoke all on table public.agent_b_runtime_state, public.agent_b_sessions from public, anon, authenticated, service_role;
grant select on public.agent_b_runtime_state, public.agent_b_sessions to authenticated;
create policy agent_b_runtime_owner_read on public.agent_b_runtime_state for select to authenticated using (exists(select 1 from public.agent_b_discoveries d join public.agent_b_discovery_access a using(discovery_id) where d.discovery_id=agent_b_runtime_state.discovery_id and d.owner_id=auth.uid() and a.identity_id=auth.uid() and a.role='OWNER'));
create policy agent_b_session_owner_read on public.agent_b_sessions for select to authenticated using (exists(select 1 from public.agent_b_discoveries d join public.agent_b_discovery_access a using(discovery_id) where d.discovery_id=agent_b_sessions.discovery_id and d.owner_id=auth.uid() and a.identity_id=auth.uid() and a.role='OWNER'));
