begin;

-- B02 operational ownership only. No MC-01 data, runtime state or email copy.
create schema agent_b_private;
revoke all on schema agent_b_private from public, anon, authenticated, service_role;
grant usage on schema agent_b_private to authenticated;

create table public.agent_b_discoveries (
  discovery_id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  entity_version bigint not null default 0 check (entity_version between 0 and 9007199254740991),
  created_at timestamptz not null default now(),
  unique (discovery_id, owner_id)
);

create table public.agent_b_discovery_access (
  discovery_id uuid not null,
  identity_id uuid not null references auth.users(id) on delete restrict,
  role text not null check (role = 'OWNER'),
  primary key (discovery_id, identity_id),
  foreign key (discovery_id, identity_id)
    references public.agent_b_discoveries(discovery_id, owner_id) on delete restrict
);
create index agent_b_discoveries_owner_idx on public.agent_b_discoveries(owner_id);
create index agent_b_discovery_access_identity_idx on public.agent_b_discovery_access(identity_id);

alter table public.agent_b_discoveries enable row level security;
alter table public.agent_b_discovery_access enable row level security;

-- Exposure is opt-in. Neither anon nor authenticated has direct DML privileges.
revoke all on table public.agent_b_discoveries from public, anon, authenticated, service_role;
revoke all on table public.agent_b_discovery_access from public, anon, authenticated, service_role;
grant select on public.agent_b_discoveries to authenticated;
grant select on public.agent_b_discovery_access to authenticated;

create policy agent_b_access_owner_read on public.agent_b_discovery_access
  for select to authenticated
  using (identity_id = (select auth.uid()));

create policy agent_b_root_owner_read on public.agent_b_discoveries
  for select to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.agent_b_discovery_access a
      where a.discovery_id = agent_b_discoveries.discovery_id
        and a.identity_id = (select auth.uid()) and a.role = 'OWNER'
    )
  );

-- Narrow private definer functions allow atomic writes without granting table
-- DML to API roles. They repeat authorization because their owner can bypass RLS.
-- Keep agent_b_private OUT of Data API exposed schemas.
create function agent_b_private.create_owned_discovery(p_expected_identity uuid)
returns setof public.agent_b_discoveries
language plpgsql security definer set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  created_id uuid;
begin
  if actor is null or auth.role() is distinct from 'authenticated'
    or p_expected_identity is distinct from actor then
    raise exception using errcode = '42501', message = 'ACCESS_DENIED';
  end if;
  insert into public.agent_b_discoveries(owner_id) values (actor)
    returning discovery_id into created_id;
  insert into public.agent_b_discovery_access(discovery_id, identity_id, role)
    values (created_id, actor, 'OWNER');
  return query select d.* from public.agent_b_discoveries d where d.discovery_id = created_id;
end;
$$;

create function agent_b_private.advance_entity_version(
  p_discovery_id uuid, p_expected_identity uuid, p_expected_version bigint
)
returns setof public.agent_b_discoveries
language plpgsql security definer set search_path = ''
as $$
declare
  actor uuid := auth.uid();
begin
  if actor is null or auth.role() is distinct from 'authenticated'
    or p_expected_identity is distinct from actor
    or not exists (
      select 1 from public.agent_b_discoveries d
      join public.agent_b_discovery_access a on a.discovery_id = d.discovery_id
      where d.discovery_id = p_discovery_id and d.owner_id = actor
        and a.identity_id = actor and a.role = 'OWNER'
    ) then
    raise exception using errcode = '42501', message = 'ACCESS_DENIED';
  end if;
  if p_expected_version is null or p_expected_version < 0 or p_expected_version >= 9007199254740991 then
    raise exception using errcode = '22023', message = 'INVALID_INPUT';
  end if;
  return query
    update public.agent_b_discoveries d
    set entity_version = d.entity_version + 1
    where d.discovery_id = p_discovery_id and d.owner_id = actor
      and d.entity_version = p_expected_version
      and exists (
        select 1 from public.agent_b_discovery_access a
        where a.discovery_id = d.discovery_id and a.identity_id = actor and a.role = 'OWNER'
      )
    returning d.*;
  if not found then
    raise exception using errcode = '40001', message = 'CONCURRENT_MODIFICATION';
  end if;
end;
$$;

revoke all on function agent_b_private.create_owned_discovery(uuid) from public, anon, authenticated, service_role;
revoke all on function agent_b_private.advance_entity_version(uuid, uuid, bigint) from public, anon, authenticated, service_role;
grant execute on function agent_b_private.create_owned_discovery(uuid) to authenticated;
grant execute on function agent_b_private.advance_entity_version(uuid, uuid, bigint) to authenticated;

-- Exposed wrappers are INVOKER, with no authority or arbitrary SQL of their own.
create function public.agent_b_create_owned_discovery(p_expected_identity uuid)
returns setof public.agent_b_discoveries
language sql security invoker set search_path = ''
as $$ select * from agent_b_private.create_owned_discovery(p_expected_identity); $$;

create function public.agent_b_advance_entity_version(
  p_discovery_id uuid, p_expected_identity uuid, p_expected_version bigint
)
returns setof public.agent_b_discoveries
language sql security invoker set search_path = ''
as $$ select * from agent_b_private.advance_entity_version(p_discovery_id, p_expected_identity, p_expected_version); $$;

revoke all on function public.agent_b_create_owned_discovery(uuid) from public, anon, authenticated, service_role;
revoke all on function public.agent_b_advance_entity_version(uuid, uuid, bigint) from public, anon, authenticated, service_role;
grant execute on function public.agent_b_create_owned_discovery(uuid) to authenticated;
grant execute on function public.agent_b_advance_entity_version(uuid, uuid, bigint) to authenticated;

commit;
