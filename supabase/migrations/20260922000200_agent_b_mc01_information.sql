create table if not exists public.agent_b_information_records (
  record_id text primary key,
  discovery_id uuid not null references public.agent_b_discoveries(discovery_id) on delete restrict,
  entity_version bigint not null check (entity_version >= 0 and entity_version <= 9007199254740991),
  payload jsonb not null,
  lineage_root_id text not null,
  supersedes_record_id text null references public.agent_b_information_records(record_id) on delete restrict,
  created_at timestamptz not null,
  unique (discovery_id, record_id),
  check (lineage_root_id <> ''),
  check (supersedes_record_id is null or supersedes_record_id <> record_id)
);
alter table public.agent_b_information_records enable row level security;
revoke all on table public.agent_b_information_records from public, anon, authenticated, service_role;
grant select on table public.agent_b_information_records to authenticated;
create policy agent_b_information_owner_read on public.agent_b_information_records for select to authenticated using (
  exists (select 1 from public.agent_b_discoveries d join public.agent_b_discovery_access a using (discovery_id)
    where d.discovery_id = agent_b_information_records.discovery_id and d.owner_id = auth.uid() and a.identity_id = auth.uid() and a.role = 'OWNER')
);

create or replace function public.agent_b_create_information_record(p_expected_identity uuid, p_record jsonb, p_created_at timestamptz)
returns public.agent_b_information_records language plpgsql security definer set search_path = '' as $$
declare result public.agent_b_information_records;
begin
  if p_expected_identity <> auth.uid() then raise exception 'access denied' using errcode = '42501'; end if;
  if not exists (select 1 from public.agent_b_discoveries d join public.agent_b_discovery_access a using (discovery_id) where d.discovery_id = (p_record->>'discoveryId')::uuid and d.owner_id = auth.uid() and a.identity_id = auth.uid() and a.role = 'OWNER') then raise exception 'access denied' using errcode = '42501'; end if;
  insert into public.agent_b_information_records(record_id, discovery_id, entity_version, payload, lineage_root_id, created_at)
    values (p_record->>'recordId', (p_record->>'discoveryId')::uuid, (p_record->>'entityVersion')::bigint, p_record, p_record->>'recordId', p_created_at) returning * into result;
  return result;
end $$;
revoke all on function public.agent_b_create_information_record(uuid,jsonb,timestamptz) from public, anon, authenticated, service_role;
grant execute on function public.agent_b_create_information_record(uuid,jsonb,timestamptz) to authenticated;

create or replace function public.agent_b_update_information_record(p_expected_identity uuid, p_discovery_id uuid, p_expected_version bigint, p_record jsonb, p_created_at timestamptz)
returns public.agent_b_information_records language plpgsql security definer set search_path = '' as $$
declare result public.agent_b_information_records; previous public.agent_b_information_records;
begin
  if p_expected_identity <> auth.uid() then raise exception 'access denied' using errcode = '42501'; end if;
  select * into previous from public.agent_b_information_records where discovery_id = p_discovery_id and record_id = p_record->>'recordId' for update;
  if previous.record_id is null then raise exception 'not found' using errcode = 'P0002'; end if;
  if previous.entity_version <> p_expected_version then raise exception 'stale version' using errcode = '40001'; end if;
  if not exists (select 1 from public.agent_b_discoveries d join public.agent_b_discovery_access a using (discovery_id) where d.discovery_id = p_discovery_id and d.owner_id = auth.uid() and a.identity_id = auth.uid() and a.role = 'OWNER') then raise exception 'access denied' using errcode = '42501'; end if;
  insert into public.agent_b_information_records(record_id, discovery_id, entity_version, payload, lineage_root_id, supersedes_record_id, created_at)
    values (p_record->>'recordId', p_discovery_id, p_expected_version + 1, p_record, previous.lineage_root_id, previous.record_id, p_created_at) returning * into result;
  return result;
end $$;
revoke all on function public.agent_b_update_information_record(uuid,uuid,bigint,jsonb,timestamptz) from public, anon, authenticated, service_role;
grant execute on function public.agent_b_update_information_record(uuid,uuid,bigint,jsonb,timestamptz) to authenticated;
