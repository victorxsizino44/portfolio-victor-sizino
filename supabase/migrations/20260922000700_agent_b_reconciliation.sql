-- Stage 08 reconciliation: durable MC-02, evidence lineage and governed handoff.
-- MC-02 contracts have independent entity-version sequences. Immutable
-- snapshots contain the semantics; the current table contains references only.
create table public.agent_b_mc02_state (
  record_id uuid primary key,
  discovery_id uuid not null references public.agent_b_discoveries(discovery_id) on delete restrict,
  kind text not null check(kind in ('CLASSIFICATION','SCOPE','SPECIALIZATION')),
  entity_version bigint not null check (entity_version between 0 and 9007199254740991),
  payload jsonb not null,
  lineage_root_id uuid not null,
  supersedes_id uuid null,
  operation_id uuid not null unique,
  request jsonb not null,
  created_at timestamptz not null default now(),
  unique(discovery_id,kind,entity_version),
  unique(discovery_id,kind,record_id),
  foreign key(discovery_id,kind,lineage_root_id) references public.agent_b_mc02_state(discovery_id,kind,record_id) on delete restrict,
  foreign key(discovery_id,kind,supersedes_id) references public.agent_b_mc02_state(discovery_id,kind,record_id) on delete restrict,
  check((entity_version=0 and lineage_root_id=record_id and supersedes_id is null) or
    (entity_version>0 and lineage_root_id<>record_id and supersedes_id is not null and supersedes_id<>record_id)),
  check(jsonb_typeof(payload)='object' and payload->>'discoveryId'=discovery_id::text
    and payload->'entityVersion'=to_jsonb(entity_version))
);
create index agent_b_mc02_lineage on public.agent_b_mc02_state(discovery_id,kind,lineage_root_id,entity_version);
create table public.agent_b_mc02_current (
  discovery_id uuid not null references public.agent_b_discoveries(discovery_id) on delete restrict,
  kind text not null check(kind in ('CLASSIFICATION','SCOPE','SPECIALIZATION')),
  record_id uuid not null,
  primary key(discovery_id,kind),
  foreign key(discovery_id,kind,record_id) references public.agent_b_mc02_state(discovery_id,kind,record_id) on delete restrict
);
alter table public.agent_b_mc02_current enable row level security;
revoke all on public.agent_b_mc02_current from public,anon,authenticated,service_role;
grant select on public.agent_b_mc02_current to authenticated;
alter table public.agent_b_file_references add unique(discovery_id,object_id);
alter table public.agent_b_file_references add unique(discovery_id,path);
create table public.agent_b_file_reference_sources (
  file_reference_id text primary key,
  discovery_id uuid not null references public.agent_b_discoveries(discovery_id) on delete restrict,
  object_id text not null,
  source jsonb not null,
  unique(discovery_id,file_reference_id),
  unique(discovery_id,object_id),
  foreign key(discovery_id,object_id) references public.agent_b_file_references(discovery_id,object_id) on delete restrict
);
alter table public.agent_b_file_reference_sources enable row level security;
revoke all on public.agent_b_file_reference_sources from public,anon,authenticated,service_role;
grant select on public.agent_b_file_reference_sources to authenticated;
create table public.agent_b_evidence_operations (
  operation_id uuid primary key,
  discovery_id uuid not null references public.agent_b_discoveries(discovery_id) on delete restrict,
  actor_id uuid not null references auth.users(id) on delete restrict,
  request jsonb not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.agent_b_evidence_operations enable row level security;
revoke all on public.agent_b_evidence_operations from public,anon,authenticated,service_role;
create table public.agent_b_evidence_representations (
  representation_id text primary key,
  discovery_id uuid not null references public.agent_b_discoveries(discovery_id) on delete restrict,
  file_reference_id text not null,
  payload jsonb not null,
  unique(discovery_id,representation_id),
  foreign key(discovery_id,file_reference_id) references public.agent_b_file_reference_sources(discovery_id,file_reference_id) on delete restrict
);
create table if not exists public.agent_b_evidence_candidates (
  candidate_id text primary key,
  discovery_id uuid not null references public.agent_b_discoveries(discovery_id) on delete restrict,
  representation_id text not null,
  payload jsonb not null,
  unique(discovery_id,candidate_id),
  foreign key(discovery_id,representation_id) references public.agent_b_evidence_representations(discovery_id,representation_id) on delete restrict
);
create table if not exists public.agent_b_governed_evidence (
  evidence_id text not null,
  entity_version bigint not null check(entity_version between 0 and 9007199254740991),
  discovery_id uuid not null references public.agent_b_discoveries(discovery_id) on delete restrict,
  candidate_id text not null,
  previous_version bigint null,
  payload jsonb not null,
  operation_id uuid not null unique references public.agent_b_evidence_operations(operation_id) deferrable initially deferred,
  created_at timestamptz not null default now(),
  primary key(discovery_id,evidence_id,entity_version),
  foreign key(discovery_id,candidate_id) references public.agent_b_evidence_candidates(discovery_id,candidate_id) on delete restrict,
  foreign key(discovery_id,evidence_id,previous_version) references public.agent_b_governed_evidence(discovery_id,evidence_id,entity_version) on delete restrict,
  check((entity_version=0 and previous_version is null) or (entity_version>0 and previous_version is not null and previous_version=entity_version-1))
);
create table public.agent_b_evidence_current (
  discovery_id uuid not null references public.agent_b_discoveries(discovery_id) on delete restrict,
  evidence_id text not null,
  candidate_id text not null,
  entity_version bigint not null,
  primary key(discovery_id,evidence_id),
  unique(discovery_id,candidate_id),
  foreign key(discovery_id,candidate_id) references public.agent_b_evidence_candidates(discovery_id,candidate_id) on delete restrict,
  foreign key(discovery_id,evidence_id,entity_version) references public.agent_b_governed_evidence(discovery_id,evidence_id,entity_version) on delete restrict
);
alter table public.agent_b_evidence_current enable row level security;
revoke all on public.agent_b_evidence_current from public,anon,authenticated,service_role;
grant select on public.agent_b_evidence_current to authenticated;
alter table public.agent_b_information_records add unique(discovery_id,record_id,entity_version);
create table if not exists public.agent_b_evidence_information_links (
  evidence_id text not null,
  information_record_id text not null,
  discovery_id uuid not null references public.agent_b_discoveries(discovery_id) on delete restrict,
  entity_version bigint not null,
  information_version bigint not null,
  primary key(discovery_id,evidence_id,entity_version,information_record_id),
  foreign key(discovery_id,evidence_id,entity_version) references public.agent_b_governed_evidence(discovery_id,evidence_id,entity_version) on delete restrict,
  foreign key(discovery_id,information_record_id,information_version) references public.agent_b_information_records(discovery_id,record_id,entity_version) on delete restrict
);
alter table public.agent_b_mc02_state enable row level security;
alter table public.agent_b_evidence_representations enable row level security;
alter table public.agent_b_evidence_candidates enable row level security;
alter table public.agent_b_governed_evidence enable row level security;
alter table public.agent_b_evidence_information_links enable row level security;
revoke all on public.agent_b_mc02_state, public.agent_b_evidence_representations, public.agent_b_evidence_candidates, public.agent_b_governed_evidence, public.agent_b_evidence_information_links from public, anon, authenticated, service_role;
grant select on public.agent_b_mc02_state, public.agent_b_evidence_representations, public.agent_b_evidence_candidates, public.agent_b_governed_evidence, public.agent_b_evidence_information_links to authenticated;
create or replace function public.agent_b_has_owner_access(p_discovery uuid) returns boolean language sql stable security invoker set search_path=public as $$ select exists(select 1 from agent_b_discoveries d join agent_b_discovery_access a using(discovery_id) where d.discovery_id=p_discovery and d.owner_id=auth.uid() and a.identity_id=auth.uid() and a.role='OWNER') $$;
create policy agent_b_mc02_owner_read on public.agent_b_mc02_state for select to authenticated using (public.agent_b_has_owner_access(discovery_id));
create policy agent_b_mc02_current_owner_read on public.agent_b_mc02_current for select to authenticated using (public.agent_b_has_owner_access(discovery_id));
create policy agent_b_repr_owner_read on public.agent_b_evidence_representations for select to authenticated using (public.agent_b_has_owner_access(discovery_id));
create policy agent_b_candidate_owner_read on public.agent_b_evidence_candidates for select to authenticated using (public.agent_b_has_owner_access(discovery_id));
create policy agent_b_evidence_owner_read on public.agent_b_governed_evidence for select to authenticated using (public.agent_b_has_owner_access(discovery_id));
create policy agent_b_link_owner_read on public.agent_b_evidence_information_links for select to authenticated using (public.agent_b_has_owner_access(discovery_id));
create policy agent_b_file_source_owner_read on public.agent_b_file_reference_sources for select to authenticated using (public.agent_b_has_owner_access(discovery_id));
create policy agent_b_evidence_current_read on public.agent_b_evidence_current for select to authenticated using (public.agent_b_has_owner_access(discovery_id));

-- Governance foundation. Authority provisioning is deliberately NOT exposed to
-- clients/application/AI. Only independently trusted database administration can
-- provision/revoke authority; this migration does not grant anyone authority.
create table public.agent_b_governance_authorities (
  authority_id text not null check (length(btrim(authority_id)) > 0),
  discovery_id uuid not null references public.agent_b_discoveries(discovery_id) on delete restrict,
  actor_identity_id uuid not null references auth.users(id) on delete restrict,
  role text not null check (role = 'HUMAN_GOVERNANCE_AUTHORITY'),
  status text not null check (status in ('ACTIVE','REVOKED')),
  version bigint not null check (version between 0 and 9007199254740991),
  primary key (authority_id, version)
);
create table public.agent_b_human_decisions (
  decision_id text primary key check (length(btrim(decision_id)) > 0),
  discovery_id uuid not null references public.agent_b_discoveries(discovery_id) on delete restrict,
  authority_id text not null,
  authority_version bigint not null,
  actor_identity_id uuid not null references auth.users(id) on delete restrict,
  operation_id uuid not null unique,
  payload jsonb not null,
  foreign key (authority_id, authority_version) references public.agent_b_governance_authorities(authority_id, version) on delete restrict
);
alter table public.agent_b_governance_authorities enable row level security;
alter table public.agent_b_human_decisions enable row level security;
revoke all on public.agent_b_governance_authorities, public.agent_b_human_decisions from public, anon, authenticated, service_role;
grant select on public.agent_b_governance_authorities, public.agent_b_human_decisions to authenticated;
create policy agent_b_authority_read on public.agent_b_governance_authorities for select to authenticated
  using (public.agent_b_has_owner_access(discovery_id));
create policy agent_b_decision_read on public.agent_b_human_decisions for select to authenticated
  using (public.agent_b_has_owner_access(discovery_id));

create function agent_b_private.governance_immutable() returns trigger
language plpgsql set search_path='' as $$ begin
  raise exception using errcode='42501', message='IMMUTABLE_GOVERNANCE_RECORD';
end $$;
create trigger agent_b_authority_immutable before update or delete on public.agent_b_governance_authorities
  for each row execute function agent_b_private.governance_immutable();
create trigger agent_b_decision_immutable before update or delete on public.agent_b_human_decisions
  for each row execute function agent_b_private.governance_immutable();

-- Append-only authority revisions preserve history. Root locks serialize
-- revocation/provisioning with validation and future material transactions.
create function agent_b_private.governance_authority_revision() returns trigger
language plpgsql set search_path='' as $$
declare previous public.agent_b_governance_authorities;
begin
  perform 1 from public.agent_b_discoveries where discovery_id=new.discovery_id for update;
  select * into previous from public.agent_b_governance_authorities
    where authority_id=new.authority_id order by version desc limit 1;
  if found then
    if new.version <> previous.version+1 or new.discovery_id <> previous.discovery_id
      or new.actor_identity_id <> previous.actor_identity_id or new.role <> previous.role then
      raise exception using errcode='40001', message='CONCURRENT_MODIFICATION';
    end if;
  elsif new.version <> 0 then
    raise exception using errcode='40001', message='CONCURRENT_MODIFICATION';
  end if;
  return new;
end $$;
create trigger agent_b_authority_revision before insert on public.agent_b_governance_authorities
  for each row execute function agent_b_private.governance_authority_revision();

create function agent_b_private.lock_governance_access(p_actor uuid, p_discovery uuid)
returns void language plpgsql security definer set search_path='' as $$ begin
  if p_actor is null or p_actor is distinct from auth.uid() or auth.role() is distinct from 'authenticated' then
    raise exception using errcode='42501', message='ACCESS_DENIED';
  end if;
  perform 1 from public.agent_b_discoveries where discovery_id=p_discovery and owner_id=p_actor for update;
  if not found then raise exception using errcode='42501', message='ACCESS_DENIED'; end if;
  perform 1 from public.agent_b_discovery_access where discovery_id=p_discovery and identity_id=p_actor and role='OWNER' for share;
  if not found then raise exception using errcode='42501', message='ACCESS_DENIED'; end if;
end $$;

create function agent_b_private.record_human_decision(p_actor uuid, p_decision jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.agent_b_governance_authorities; existing public.agent_b_human_decisions; k text;
begin
  if jsonb_typeof(p_decision) is distinct from 'object' then
    raise exception using errcode='22023', message='INVALID_INPUT';
  end if;
  foreach k in array array['decisionId','discoveryId','authorityId','actorIdentityId','action','targetType','targetId','outcome','operationId','recordedAt'] loop
    if jsonb_typeof(p_decision->k) is distinct from 'string' or length(btrim(p_decision->>k))=0 then
      raise exception using errcode='22023', message='INVALID_INPUT';
    end if;
  end loop;
  if exists(select 1 from jsonb_object_keys(p_decision) key where key not in
    ('decisionId','discoveryId','authorityId','actorIdentityId','action','targetType','targetId','targetVersion','outcome','operationId','recordedAt','version'))
    or (p_decision->>'action') not in ('VALIDATE_EVIDENCE','REJECT_EVIDENCE','SUPERSEDE_EVIDENCE','ISSUE_HANDOFF','SUPERSEDE_HANDOFF')
    or jsonb_typeof(p_decision->'version') is distinct from 'number'
    or (p_decision->>'version') !~ '^[0-9]+$'
    or (p_decision->>'version')::numeric > 9007199254740991 then
    raise exception using errcode='22023', message='INVALID_INPUT';
  end if;
  if p_decision ? 'targetVersion' and (jsonb_typeof(p_decision->'targetVersion') is distinct from 'number'
    or (p_decision->>'targetVersion') !~ '^[0-9]+$' or (p_decision->>'targetVersion')::numeric > 9007199254740991) then
    raise exception using errcode='22023', message='INVALID_INPUT';
  end if;
  perform (p_decision->>'recordedAt')::timestamptz;
  if (p_decision->>'recordedAt') !~ '(Z|[+-][0-9]{2}:[0-9]{2})$' then
    raise exception using errcode='22023', message='INVALID_INPUT';
  end if;
  perform agent_b_private.lock_governance_access(p_actor,(p_decision->>'discoveryId')::uuid);
  select * into a from public.agent_b_governance_authorities
    where authority_id=p_decision->>'authorityId' order by version desc limit 1;
  if not found or a.status <> 'ACTIVE' or a.discovery_id <> (p_decision->>'discoveryId')::uuid
    or a.actor_identity_id <> p_actor or (p_decision->>'actorIdentityId')::uuid <> p_actor then
    raise exception using errcode='42501', message='ACCESS_DENIED';
  end if;
  select * into existing from public.agent_b_human_decisions where operation_id=(p_decision->>'operationId')::uuid;
  if found then
    if existing.payload is distinct from p_decision then
      raise exception using errcode='40001', message='CONCURRENT_MODIFICATION';
    end if;
    return existing.payload;
  end if;
  insert into public.agent_b_human_decisions values
    (p_decision->>'decisionId',a.discovery_id,a.authority_id,a.version,p_actor,(p_decision->>'operationId')::uuid,p_decision);
  return p_decision;
end $$;

-- Read-only externally, but the lock lasts until transaction end. Material RPCs
-- MUST invoke this helper within their own transaction before writing anything.
-- Ref/source strings and successful previous preflights never confer authority.
create function agent_b_private.validate_human_decision(p_actor uuid, p_intent jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare d public.agent_b_human_decisions; a public.agent_b_governance_authorities; k text;
begin
  perform agent_b_private.lock_governance_access(p_actor,(p_intent->>'discoveryId')::uuid);
  select * into d from public.agent_b_human_decisions where decision_id=p_intent->'reference'->>'decisionId';
  if not found then raise exception using errcode='42501', message='ACCESS_DENIED'; end if;
  select * into a from public.agent_b_governance_authorities where authority_id=d.authority_id order by version desc limit 1;
  if not found or a.status <> 'ACTIVE' or a.actor_identity_id <> p_actor or d.actor_identity_id <> p_actor
    or a.discovery_id <> (p_intent->>'discoveryId')::uuid or d.discovery_id <> a.discovery_id
    or d.operation_id is distinct from (p_intent->>'operationId')::uuid
    or d.payload->>'recordedAt' is distinct from p_intent->'reference'->>'recordedAt' then
    raise exception using errcode='42501', message='ACCESS_DENIED';
  end if;
  foreach k in array array['action','targetType','targetId','targetVersion','outcome'] loop
    if d.payload->k is distinct from p_intent->k then
      raise exception using errcode='42501', message='ACCESS_DENIED';
    end if;
  end loop;
end $$;

create function public.agent_b_record_human_decision(p_actor uuid,p_decision jsonb)
returns jsonb language sql security invoker set search_path='' as $$
  select agent_b_private.record_human_decision(p_actor,p_decision);
$$;
create function public.agent_b_validate_human_decision(p_actor uuid,p_intent jsonb)
returns void language sql security invoker set search_path='' as $$
  select agent_b_private.validate_human_decision(p_actor,p_intent);
$$;
revoke all on function agent_b_private.governance_immutable(), agent_b_private.governance_authority_revision(), agent_b_private.lock_governance_access(uuid,uuid), agent_b_private.record_human_decision(uuid,jsonb), agent_b_private.validate_human_decision(uuid,jsonb), public.agent_b_record_human_decision(uuid,jsonb), public.agent_b_validate_human_decision(uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function agent_b_private.record_human_decision(uuid,jsonb), agent_b_private.validate_human_decision(uuid,jsonb), public.agent_b_record_human_decision(uuid,jsonb), public.agent_b_validate_human_decision(uuid,jsonb) to authenticated;

-- Registered bytes/provenance are immutable. Preserve original limits/MIME
-- bucket configuration, and forbid overwrite/deletion after registration.
drop policy agent_b_storage_owner on storage.objects;
create function agent_b_private.evidence_cleanup_allowed(p_path text)
returns boolean language plpgsql volatile security definer set search_path='' as $$
declare d uuid;
begin
  d:=split_part(p_path,'/',1)::uuid;
  perform agent_b_private.lock_governance_access(auth.uid(),d);
  -- Serialized with registration; a pre-commit cleanup snapshot cannot race
  -- registration and delete bytes that have acquired a durable reference.
  return not exists(select 1 from public.agent_b_file_references where discovery_id=d and path=p_path);
exception when invalid_text_representation then return false;
end $$;
revoke all on function agent_b_private.evidence_cleanup_allowed(text) from public,anon,authenticated,service_role;
grant execute on function agent_b_private.evidence_cleanup_allowed(text) to authenticated;
create policy agent_b_storage_read on storage.objects for select to authenticated using(
  bucket_id='agent-b-private' and exists(select 1 from public.agent_b_discoveries d join public.agent_b_discovery_access a using(discovery_id)
    where d.discovery_id::text=split_part(name,'/',1) and d.owner_id=auth.uid() and a.identity_id=auth.uid() and a.role='OWNER'));
create policy agent_b_storage_insert on storage.objects for insert to authenticated with check(
  bucket_id='agent-b-private' and exists(select 1 from public.agent_b_discoveries d join public.agent_b_discovery_access a using(discovery_id)
    where d.discovery_id::text=split_part(name,'/',1) and d.owner_id=auth.uid() and a.identity_id=auth.uid() and a.role='OWNER'));
create policy agent_b_storage_cleanup_unregistered on storage.objects for delete to authenticated using(
  bucket_id='agent-b-private' and agent_b_private.evidence_cleanup_allowed(name));
create trigger agent_b_file_metadata_immutable before update or delete on public.agent_b_file_references
  for each row execute function agent_b_private.governance_immutable();
create trigger agent_b_file_source_immutable before update or delete on public.agent_b_file_reference_sources
  for each row execute function agent_b_private.governance_immutable();
create trigger agent_b_representation_immutable before update or delete on public.agent_b_evidence_representations
  for each row execute function agent_b_private.governance_immutable();
create trigger agent_b_candidate_immutable before update or delete on public.agent_b_evidence_candidates
  for each row execute function agent_b_private.governance_immutable();
create trigger agent_b_evidence_immutable before update or delete on public.agent_b_governed_evidence
  for each row execute function agent_b_private.governance_immutable();
create trigger agent_b_evidence_link_immutable before update or delete on public.agent_b_evidence_information_links
  for each row execute function agent_b_private.governance_immutable();
create trigger agent_b_evidence_operation_immutable before update or delete on public.agent_b_evidence_operations
  for each row execute function agent_b_private.governance_immutable();

create function agent_b_private.evidence_file_intact(p_discovery uuid,p_object text)
returns void language plpgsql security definer set search_path='' as $$
declare f public.agent_b_file_references; obj storage.objects; mime text;
begin
  select * into f from public.agent_b_file_references where discovery_id=p_discovery and object_id=p_object;
  if not found then raise exception using errcode='22023',message='INVALID_INPUT'; end if;
  select * into obj from storage.objects where bucket_id='agent-b-private' and name=f.path for share;
  mime:=case f.file_type when 'PDF' then 'application/pdf' when 'DOCX' then 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    when 'TXT' then 'text/plain' when 'MD' then 'text/markdown' when 'CSV' then 'text/csv'
    when 'XLSX' then 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    when 'PNG' then 'image/png' when 'JPEG' then 'image/jpeg' when 'WEBP' then 'image/webp' end;
  if obj.id is null or mime is null or obj.metadata->>'mimetype' is distinct from mime
    or (obj.metadata->>'size')::bigint is distinct from f.byte_size
    or f.sha256 !~ '^[a-f0-9]{64}$' or f.path<>p_discovery::text||'/'||p_object
    or not exists(select 1 from storage.buckets where id='agent-b-private' and public=false and file_size_limit=10485760) then
    raise exception using errcode='22023',message='INVALID_INPUT';
  end if;
end $$;
create function agent_b_private.register_evidence_file(p_actor uuid,p_stored jsonb,p_reference jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare d uuid; prior public.agent_b_file_references; k text;
begin
  d:=(p_stored->>'discoveryId')::uuid;
  perform agent_b_private.lock_governance_access(p_actor,d);
  if jsonb_typeof(p_stored) is distinct from 'object' or jsonb_typeof(p_reference) is distinct from 'object'
    or p_stored-array['objectId','discoveryId','path','fileType','byteSize','sha256','createdAt']<>'{}'::jsonb
    or p_reference-array['fileReferenceId','objectId','discoveryId','source']<>'{}'::jsonb
    or p_reference->>'discoveryId' is distinct from d::text
    or p_reference->>'objectId' is distinct from p_stored->>'objectId'
    or p_reference->>'fileReferenceId' is distinct from 'ref-'||(p_stored->>'objectId')
    or jsonb_typeof(p_reference->'source') is distinct from 'object'
    or p_reference->'source'-array['sourceId','reference','recordedAt']<>'{}'::jsonb
    or jsonb_typeof(p_reference->'source'->'sourceId') is distinct from 'string'
    or jsonb_typeof(p_reference->'source'->'reference') is distinct from 'string'
    or length(btrim(p_reference->'source'->>'sourceId'))=0 or length(p_reference->'source'->>'reference')=0 then
    raise exception using errcode='22023',message='INVALID_INPUT';
  end if;
  foreach k in array array['objectId','path','fileType','sha256','createdAt'] loop
    if jsonb_typeof(p_stored->k) is distinct from 'string' or length(btrim(p_stored->>k))=0 then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  end loop;
  if jsonb_typeof(p_stored->'byteSize') is distinct from 'number'
    or (p_stored->>'byteSize') !~ '^[0-9]+$' or (p_stored->>'byteSize')::bigint not between 1 and 10485760
    or p_stored->>'sha256' !~ '^[a-f0-9]{64}$'
    or position('/' in p_stored->>'objectId')>0 then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  if p_reference->'source' ? 'recordedAt' then
    if jsonb_typeof(p_reference->'source'->'recordedAt') is distinct from 'string'
      or p_reference->'source'->>'recordedAt' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T.*(Z|[+-][0-9]{2}:[0-9]{2})$' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
    perform (p_reference->'source'->>'recordedAt')::timestamptz;
  end if;
  select * into prior from public.agent_b_file_references where object_id=p_stored->>'objectId';
  if found then
    if prior.discovery_id<>d or prior.path<>p_stored->>'path' or prior.file_type<>p_stored->>'fileType'
      or prior.sha256<>p_stored->>'sha256' or prior.byte_size<>(p_stored->>'byteSize')::bigint
      or not exists(select 1 from public.agent_b_file_reference_sources where discovery_id=d and object_id=prior.object_id and source=p_reference->'source') then
      raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';
    end if;
  else
    insert into public.agent_b_file_references values(p_stored->>'objectId',d,p_stored->>'path',p_stored->>'fileType',(p_stored->>'byteSize')::bigint,p_stored->>'sha256',(p_stored->>'createdAt')::timestamptz);
    insert into public.agent_b_file_reference_sources values(p_reference->>'fileReferenceId',d,p_stored->>'objectId',p_reference->'source');
  end if;
  perform agent_b_private.evidence_file_intact(d,p_stored->>'objectId');
end $$;

create function agent_b_private.mutate_evidence(p_actor uuid,p_input jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  d uuid; op uuid; action text; allowed text[]; k text; v jsonb; result jsonb; intent jsonb;
  existing public.agent_b_evidence_operations; repr public.agent_b_evidence_representations;
  candidate public.agent_b_evidence_candidates; source public.agent_b_file_reference_sources;
  prior public.agent_b_governed_evidence; info public.agent_b_information_records;
  next_version bigint; expected bigint; status text; v_evidence_id text; decision jsonb; target jsonb;
begin
  if jsonb_typeof(p_input) is distinct from 'object' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  action:=p_input->>'action';d:=(p_input->>'discoveryId')::uuid;
  perform agent_b_private.lock_governance_access(p_actor,d);
  if action='DEFER' then return jsonb_build_object('action','DEFER');end if;
  op:=(p_input->>'operationId')::uuid;
  if op is null then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  allowed:=case action
    when 'PERSIST_REPRESENTATION' then array['discoveryId','operationId','action','representation']
    when 'PERSIST_CANDIDATE' then array['discoveryId','operationId','action','candidate']
    when 'RECEIVE' then array['discoveryId','operationId','action','candidateId','evidenceId']
    when 'VALIDATE' then array['discoveryId','operationId','action','evidenceId','expectedEntityVersion','decision','informationRecordId','informationVersion']
    when 'REJECT' then array['discoveryId','operationId','action','evidenceId','expectedEntityVersion','decision']
    when 'SUPERSEDE' then array['discoveryId','operationId','action','evidenceId','expectedEntityVersion','decision'] end;
  if allowed is null or p_input-allowed<>'{}'::jsonb or not(p_input ?& allowed) then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  if action in ('VALIDATE','REJECT','SUPERSEDE') then
    if jsonb_typeof(p_input->'decision') is distinct from 'object'
      or p_input->'decision'-array['decisionId','source','recordedAt']<>'{}'::jsonb
      or jsonb_typeof(p_input->'decision'->'decisionId') is distinct from 'string'
      or jsonb_typeof(p_input->'decision'->'recordedAt') is distinct from 'string'
      or jsonb_typeof(p_input->'decision'->'source') is distinct from 'object'
      or p_input->'decision'->'source'-array['sourceId','reference','recordedAt']<>'{}'::jsonb
      or jsonb_typeof(p_input->'decision'->'source'->'sourceId') is distinct from 'string'
      or jsonb_typeof(p_input->'decision'->'source'->'reference') is distinct from 'string'
      or length(btrim(p_input->'decision'->'source'->>'sourceId'))=0
      or length(p_input->'decision'->'source'->>'reference')=0 then raise exception using errcode='22023',message='INVALID_INPUT';end if;
    if p_input->'decision'->>'recordedAt' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T.*(Z|[+-][0-9]{2}:[0-9]{2})$' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
    if p_input->'decision'->'source' ? 'recordedAt' then
      if jsonb_typeof(p_input->'decision'->'source'->'recordedAt') is distinct from 'string'
        or p_input->'decision'->'source'->>'recordedAt' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T.*(Z|[+-][0-9]{2}:[0-9]{2})$' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
      perform (p_input->'decision'->'source'->>'recordedAt')::timestamptz;
    end if;
    if jsonb_typeof(p_input->'expectedEntityVersion') is distinct from 'number' or p_input->>'expectedEntityVersion' !~ '^[0-9]+$'
      or (p_input->>'expectedEntityVersion')::numeric>=9007199254740991 then raise exception using errcode='22023',message='INVALID_INPUT';end if;
    expected:=(p_input->>'expectedEntityVersion')::bigint;
    status:=case action when 'VALIDATE' then 'VALIDATED' when 'REJECT' then 'REJECTED' else 'SUPERSEDED' end;
    intent:=jsonb_build_object('discoveryId',d,'action',case action when 'VALIDATE' then 'VALIDATE_EVIDENCE' when 'REJECT' then 'REJECT_EVIDENCE' else 'SUPERSEDE_EVIDENCE' end,
      'targetType','EVIDENCE','targetId',p_input->>'evidenceId','targetVersion',expected,'outcome',status,'operationId',op,'reference',p_input->'decision');
    perform agent_b_private.validate_human_decision(p_actor,intent);
  end if;
  select * into existing from public.agent_b_evidence_operations where operation_id=op;
  if found then
    if existing.discovery_id<>d or existing.actor_id<>p_actor or existing.request is distinct from p_input then raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';end if;
    return existing.result;
  end if;
  if action='PERSIST_REPRESENTATION' then
    v:=p_input->'representation';
    if jsonb_typeof(v) is distinct from 'object' or v-array['representationId','fileReferenceId','status','text','reason','createdAt']<>'{}'::jsonb then raise exception using errcode='22023',message='INVALID_INPUT';end if;
    foreach k in array array['representationId','fileReferenceId','status','createdAt'] loop
      if jsonb_typeof(v->k) is distinct from 'string' or length(btrim(v->>k))=0 then raise exception using errcode='22023',message='INVALID_INPUT';end if;
    end loop;
    if (v->>'status' in ('EXTRACTED','UNSUPPORTED','FAILED')) is not true then raise exception using errcode='22023',message='INVALID_INPUT';end if;
    if v->>'status'='EXTRACTED' then
      if jsonb_typeof(v->'text') is distinct from 'string' or length(v->>'text')=0 or octet_length(v->>'text')>10485760 then raise exception using errcode='22023',message='INVALID_INPUT';end if;
    elsif v ? 'text' then raise exception using errcode='22023',message='INVALID_INPUT';
    end if;
    perform (v->>'createdAt')::timestamptz;
    if v->>'createdAt' !~ '(Z|[+-][0-9]{2}:[0-9]{2})$' or
      (v ? 'reason' and (jsonb_typeof(v->'reason') is distinct from 'string' or length(v->>'reason')=0)) then raise exception using errcode='22023',message='INVALID_INPUT';end if;
    select * into source from public.agent_b_file_reference_sources where discovery_id=d and file_reference_id=v->>'fileReferenceId';
    if not found then raise exception using errcode='22023',message='INVALID_INPUT';end if;
    perform agent_b_private.evidence_file_intact(d,source.object_id);
    insert into public.agent_b_evidence_representations values(v->>'representationId',d,source.file_reference_id,v);
    result:=v;
  elsif action='PERSIST_CANDIDATE' then
    v:=p_input->'candidate';
    if jsonb_typeof(v) is distinct from 'object' or v-array['candidateId','discoveryId','representationId','locator','statement','status']<>'{}'::jsonb
      or v->>'discoveryId' is distinct from d::text or v->>'status' is distinct from 'CANDIDATE' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
    foreach k in array array['candidateId','representationId','locator','statement'] loop
      if jsonb_typeof(v->k) is distinct from 'string' or length(btrim(v->>k))=0 then raise exception using errcode='22023',message='INVALID_INPUT';end if;
    end loop;
    select * into repr from public.agent_b_evidence_representations where discovery_id=d and representation_id=v->>'representationId';
    if not found or repr.payload->>'status'<>'EXTRACTED' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
    insert into public.agent_b_evidence_candidates values(v->>'candidateId',d,repr.representation_id,v);
    result:=v;
  else
    v_evidence_id:=p_input->>'evidenceId';
    if jsonb_typeof(p_input->'evidenceId') is distinct from 'string' or length(btrim(v_evidence_id))=0 then raise exception using errcode='22023',message='INVALID_INPUT';end if;
    select e.* into prior from public.agent_b_evidence_current c join public.agent_b_governed_evidence e
      on e.discovery_id=c.discovery_id and e.evidence_id=c.evidence_id and e.entity_version=c.entity_version
      where c.discovery_id=d and c.evidence_id=p_input->>'evidenceId';
    if action='RECEIVE' then
      if prior.evidence_id is not null then raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';end if;
      select * into candidate from public.agent_b_evidence_candidates where discovery_id=d and candidate_id=p_input->>'candidateId';
      if not found then raise exception using errcode='22023',message='INVALID_INPUT';end if;
      select * into repr from public.agent_b_evidence_representations where discovery_id=d and representation_id=candidate.representation_id;
      if not found or repr.payload->>'status'<>'EXTRACTED' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
      select * into source from public.agent_b_file_reference_sources where discovery_id=d and file_reference_id=repr.file_reference_id;
      perform agent_b_private.evidence_file_intact(d,source.object_id);
      next_version:=0;
      v:=jsonb_build_object('evidenceId',v_evidence_id,'discoveryId',d,'candidateId',candidate.candidate_id,'statement',candidate.payload->>'statement','validation','RECEIVED','source',source.source,'createdAt',now());
      decision:=null;target:=null;
    else
      -- Absence means candidate-only: direct candidate -> VALIDATED is impossible.
      if prior.evidence_id is null then raise exception using errcode='22023',message='INVALID_INPUT';end if;
      if prior.entity_version<>expected then raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';end if;
      if prior.payload->'evidence'->>'validation'=status then raise exception using errcode='22023',message='INVALID_INPUT';end if;
      next_version:=expected+1;v:=jsonb_set(prior.payload->'evidence','{validation}',to_jsonb(status));decision:=p_input->'decision';
      candidate.candidate_id:=prior.candidate_id;
      if action='VALIDATE' then
        if jsonb_typeof(p_input->'informationVersion') is distinct from 'number' or p_input->>'informationVersion' !~ '^[0-9]+$' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
        select * into info from public.agent_b_information_records where discovery_id=d and record_id=p_input->>'informationRecordId' for share;
        if not found or info.entity_version<>(p_input->>'informationVersion')::bigint then raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';end if;
        perform 1 from public.agent_b_runtime_state where discovery_id=d and current_state->>'informationRecordId'=info.record_id for share;
        if not found then raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';end if;
        target:=jsonb_build_object('informationRecordId',info.record_id,'informationVersion',info.entity_version);
      else target:=null;
      end if;
    end if;
    result:=jsonb_build_object('evidence',v,'entityVersion',next_version,'previousVersion',prior.entity_version,'operationId',op,'decision',decision,'informationTarget',target);
    insert into public.agent_b_governed_evidence(discovery_id,evidence_id,entity_version,candidate_id,previous_version,payload,operation_id)
      values(d,v_evidence_id,next_version,candidate.candidate_id,prior.entity_version,result,op);
    if action='VALIDATE' then
      insert into public.agent_b_evidence_information_links values(v_evidence_id,info.record_id,d,next_version,info.entity_version);
    end if;
    insert into public.agent_b_evidence_current values(d,v_evidence_id,candidate.candidate_id,next_version)
      on conflict(discovery_id,evidence_id) do update set entity_version=excluded.entity_version;
  end if;
  insert into public.agent_b_evidence_operations(operation_id,discovery_id,actor_id,request,result) values(op,d,p_actor,p_input,result);
  return result;
end $$;
create function public.agent_b_register_evidence_file(p_actor uuid,p_stored jsonb,p_reference jsonb)
returns void language sql security invoker set search_path='' as $$select agent_b_private.register_evidence_file(p_actor,p_stored,p_reference);$$;
create function public.agent_b_mutate_evidence(p_actor uuid,p_input jsonb)
returns jsonb language sql security invoker set search_path='' as $$select agent_b_private.mutate_evidence(p_actor,p_input);$$;
create function public.agent_b_read_evidence(p_actor uuid,p_discovery uuid,p_evidence text,p_history boolean)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
  if p_actor is null or p_actor is distinct from auth.uid() or auth.role() is distinct from 'authenticated' or not public.agent_b_has_owner_access(p_discovery) then raise exception using errcode='42501',message='ACCESS_DENIED';end if;
  if p_history then
    select coalesce(jsonb_agg(payload order by entity_version),'[]'::jsonb) into result from public.agent_b_governed_evidence where discovery_id=p_discovery and evidence_id=p_evidence;
  else
    select e.payload into result from public.agent_b_evidence_current c join public.agent_b_governed_evidence e
      on e.discovery_id=c.discovery_id and e.evidence_id=c.evidence_id and e.entity_version=c.entity_version
      where c.discovery_id=p_discovery and c.evidence_id=p_evidence;
  end if;
  return result;
end $$;
revoke all on function agent_b_private.evidence_file_intact(uuid,text),agent_b_private.register_evidence_file(uuid,jsonb,jsonb),agent_b_private.mutate_evidence(uuid,jsonb),
  public.agent_b_register_evidence_file(uuid,jsonb,jsonb),public.agent_b_mutate_evidence(uuid,jsonb),public.agent_b_read_evidence(uuid,uuid,text,boolean)
  from public,anon,authenticated,service_role;
grant execute on function agent_b_private.register_evidence_file(uuid,jsonb,jsonb),agent_b_private.mutate_evidence(uuid,jsonb),
  public.agent_b_register_evidence_file(uuid,jsonb,jsonb),public.agent_b_mutate_evidence(uuid,jsonb),public.agent_b_read_evidence(uuid,uuid,text,boolean) to authenticated;

-- MC-02 structural checks mirror the approved contract vocabularies. They do
-- not establish semantic truth, evidence validity or human approval.
create function agent_b_private.validate_mc02_contract(p_kind text,p_contract jsonb,p_discovery uuid,p_version bigint)
returns void language plpgsql set search_path='' as $$
declare segment jsonb; nature jsonb;
begin
  if jsonb_typeof(p_contract) is distinct from 'object'
    or p_contract->>'discoveryId' is distinct from p_discovery::text
    or p_contract->'entityVersion' is distinct from to_jsonb(p_version) then
    raise exception using errcode='22023', message='INVALID_INPUT';
  end if;
  if p_kind='CLASSIFICATION' then
    if (p_contract->>'understandingState' in ('UNDERSTOOD','PARTIALLY_UNDERSTOOD','AMBIGUOUS','CONFLICTING')) is not true
      or p_contract-array['discoveryId','entityVersion','understandingState','primaryNature'] <> '{}'::jsonb then
      raise exception using errcode='22023', message='INVALID_INPUT';
    end if;
    if p_contract ? 'primaryNature' then
      if jsonb_typeof(p_contract->'primaryNature') is distinct from 'array' then
        raise exception using errcode='22023', message='INVALID_INPUT';
      end if;
      if jsonb_array_length(p_contract->'primaryNature')=0 then raise exception using errcode='22023', message='INVALID_INPUT'; end if;
      for nature in select value from jsonb_array_elements(p_contract->'primaryNature') loop
        if jsonb_typeof(nature) is distinct from 'string' or length(nature#>>'{}')=0 then
          raise exception using errcode='22023', message='INVALID_INPUT';
        end if;
      end loop;
    end if;
  elsif p_kind='SCOPE' then
    if p_contract->>'kind'='ONE_DISCOVERY' then
      if p_contract-array['discoveryId','entityVersion','kind','applicability','boundary'] <> '{}'::jsonb
        or (p_contract->>'applicability' in ('APPLICABLE','CANDIDATE','EXCLUDED','UNRESOLVED')) is not true
        or (p_contract->>'boundary' in ('INCLUDED','EXCLUDED','DEFERRED','CONDITIONAL')) is not true then
        raise exception using errcode='22023', message='INVALID_INPUT';
      end if;
    elsif p_contract->>'kind'='SCOPED_SEGMENTS' then
      if p_contract-array['discoveryId','entityVersion','kind','segments'] <> '{}'::jsonb
        or jsonb_typeof(p_contract->'segments') is distinct from 'array' then
        raise exception using errcode='22023', message='INVALID_INPUT';
      end if;
      if jsonb_array_length(p_contract->'segments')=0 then raise exception using errcode='22023', message='INVALID_INPUT'; end if;
      for segment in select value from jsonb_array_elements(p_contract->'segments') loop
        if jsonb_typeof(segment) is distinct from 'object' or segment-array['segmentId','applicability','boundary'] <> '{}'::jsonb
          or jsonb_typeof(segment->'segmentId') is distinct from 'string' or length(btrim(segment->>'segmentId'))=0
          or (segment->>'applicability' in ('APPLICABLE','CANDIDATE','EXCLUDED','UNRESOLVED')) is not true
          or (segment->>'boundary' in ('INCLUDED','EXCLUDED','DEFERRED','CONDITIONAL')) is not true then
          raise exception using errcode='22023', message='INVALID_INPUT';
        end if;
      end loop;
    else raise exception using errcode='22023', message='INVALID_INPUT';
    end if;
  elsif p_kind='SPECIALIZATION' then
    if p_contract->>'status' in ('CORE_SUFFICIENT','SPECIALIZATION_UNRESOLVED') then
      if p_contract-array['discoveryId','entityVersion','status'] <> '{}'::jsonb then raise exception using errcode='22023', message='INVALID_INPUT'; end if;
    elsif p_contract->>'status'='EXISTING_SPECIALIZATION_APPLICABLE' then
      if p_contract-array['discoveryId','entityVersion','status','specializationId'] <> '{}'::jsonb
        or jsonb_typeof(p_contract->'specializationId') is distinct from 'string'
        or length(btrim(p_contract->>'specializationId'))=0 then raise exception using errcode='22023', message='INVALID_INPUT'; end if;
    elsif p_contract->>'status'='SPECIALIZATION_CANDIDATE' then
      if p_contract-array['discoveryId','entityVersion','status','candidate'] <> '{}'::jsonb
        or (p_contract ? 'candidate' and (jsonb_typeof(p_contract->'candidate') is distinct from 'string' or length(p_contract->>'candidate')=0)) then
        raise exception using errcode='22023', message='INVALID_INPUT';
      end if;
    else raise exception using errcode='22023', message='INVALID_INPUT';
    end if;
  else raise exception using errcode='22023', message='INVALID_INPUT';
  end if;
end $$;

create function agent_b_private.mc02_json(r public.agent_b_mc02_state)
returns jsonb language sql stable set search_path='' as $$
  select jsonb_build_object('recordId',r.record_id,'operationId',r.operation_id,'discoveryId',r.discovery_id,
    'entityVersion',r.entity_version,'lineageRootId',r.lineage_root_id,'supersedesId',r.supersedes_id,
    'createdAt',r.created_at,'value',jsonb_build_object('kind',r.kind,'contract',r.payload));
$$;
create trigger agent_b_mc02_immutable before update or delete on public.agent_b_mc02_state
  for each row execute function agent_b_private.governance_immutable();

create function agent_b_private.write_mc02(p_actor uuid,p_input jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  discovery uuid; operation uuid; v_kind text; expected bigint; next_version bigint;
  prior public.agent_b_mc02_state; accepted public.agent_b_mc02_state; new_id uuid;
begin
  if jsonb_typeof(p_input) is distinct from 'object'
    or p_input-array['discoveryId','operationId','expectedEntityVersion','value'] <> '{}'::jsonb
    or not (p_input ?& array['discoveryId','operationId','expectedEntityVersion','value'])
    or jsonb_typeof(p_input->'discoveryId') is distinct from 'string'
    or jsonb_typeof(p_input->'operationId') is distinct from 'string'
    or jsonb_typeof(p_input->'value') is distinct from 'object'
    or p_input->'value'-array['kind','contract'] <> '{}'::jsonb then
    raise exception using errcode='22023', message='INVALID_INPUT';
  end if;
  discovery := (p_input->>'discoveryId')::uuid;
  operation := (p_input->>'operationId')::uuid;
  v_kind := p_input->'value'->>'kind';
  if (v_kind in ('CLASSIFICATION','SCOPE','SPECIALIZATION')) is not true then
    raise exception using errcode='22023', message='INVALID_INPUT';
  end if;
  if p_input->'expectedEntityVersion' <> 'null'::jsonb then
    if jsonb_typeof(p_input->'expectedEntityVersion') is distinct from 'number'
      or (p_input->>'expectedEntityVersion') !~ '^[0-9]+$'
      or (p_input->>'expectedEntityVersion')::numeric >= 9007199254740991 then
      raise exception using errcode='22023', message='INVALID_INPUT';
    end if;
    expected := (p_input->>'expectedEntityVersion')::bigint;
  end if;
  next_version := case when expected is null then 0 else expected+1 end;
  -- Short per-Discovery serialization; no external/provider calls in transaction.
  perform agent_b_private.lock_governance_access(p_actor,discovery);
  perform agent_b_private.validate_mc02_contract(v_kind,p_input->'value'->'contract',discovery,next_version);
  select * into accepted from public.agent_b_mc02_state where operation_id=operation;
  if found then
    if accepted.discovery_id<>discovery or accepted.request is distinct from p_input then
      raise exception using errcode='40001', message='CONCURRENT_MODIFICATION';
    end if;
    return agent_b_private.mc02_json(accepted);
  end if;
  select s.* into prior from public.agent_b_mc02_current c
    join public.agent_b_mc02_state s on s.discovery_id=c.discovery_id and s.kind=c.kind and s.record_id=c.record_id
    where c.discovery_id=discovery and c.kind=v_kind;
  if (expected is null and prior.record_id is not null) or
    (expected is not null and (prior.record_id is null or prior.entity_version<>expected)) then
    raise exception using errcode='40001', message='CONCURRENT_MODIFICATION';
  end if;
  new_id := gen_random_uuid();
  insert into public.agent_b_mc02_state(record_id,discovery_id,kind,entity_version,payload,lineage_root_id,supersedes_id,operation_id,request)
    values(new_id,discovery,v_kind,next_version,p_input->'value'->'contract',coalesce(prior.lineage_root_id,new_id),prior.record_id,operation,p_input)
    returning * into accepted;
  insert into public.agent_b_mc02_current(discovery_id,kind,record_id) values(discovery,v_kind,new_id)
    on conflict(discovery_id,kind) do update set record_id=excluded.record_id;
  -- No runtime/entity root counters, semantic validity or governed approvals changed.
  return agent_b_private.mc02_json(accepted);
end $$;
create function public.agent_b_write_mc02(p_actor uuid,p_input jsonb)
returns jsonb language sql security invoker set search_path='' as $$
  select agent_b_private.write_mc02(p_actor,p_input);
$$;
create function public.agent_b_read_mc02(p_actor uuid,p_discovery uuid,p_kind text,p_history boolean)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
  if p_actor is null or p_actor is distinct from auth.uid() or auth.role() is distinct from 'authenticated'
    or not public.agent_b_has_owner_access(p_discovery) then
    raise exception using errcode='42501', message='ACCESS_DENIED';
  end if;
  if p_history is null or (p_kind in ('CLASSIFICATION','SCOPE','SPECIALIZATION')) is not true then
    raise exception using errcode='22023', message='INVALID_INPUT';
  end if;
  if p_history then
    select coalesce(jsonb_agg(agent_b_private.mc02_json(s) order by s.entity_version),'[]'::jsonb) into result
      from public.agent_b_mc02_state s where s.discovery_id=p_discovery and s.kind=p_kind;
  else
    select agent_b_private.mc02_json(s) into result from public.agent_b_mc02_current c
      join public.agent_b_mc02_state s on s.discovery_id=c.discovery_id and s.kind=c.kind and s.record_id=c.record_id
      where c.discovery_id=p_discovery and c.kind=p_kind;
  end if;
  return result;
end $$;
revoke all on function agent_b_private.validate_mc02_contract(text,jsonb,uuid,bigint),
  agent_b_private.mc02_json(public.agent_b_mc02_state),agent_b_private.write_mc02(uuid,jsonb),
  public.agent_b_write_mc02(uuid,jsonb),public.agent_b_read_mc02(uuid,uuid,text,boolean)
  from public,anon,authenticated,service_role;
grant execute on function agent_b_private.mc02_json(public.agent_b_mc02_state),agent_b_private.write_mc02(uuid,jsonb),
  public.agent_b_write_mc02(uuid,jsonb),public.agent_b_read_mc02(uuid,uuid,text,boolean) to authenticated;

-- R08-03: immutable artifacts + append-only supersession edges. Historical status
-- is projected from the edge; issued contents are NEVER updated in place.
alter table public.agent_b_handoffs add constraint agent_b_handoff_discovery_version
  unique(discovery_id,handoff_id,version);
alter table public.agent_b_handoffs add constraint agent_b_handoff_discovery_id unique(discovery_id,handoff_id);
alter table public.agent_b_handoffs add constraint agent_b_handoff_previous_discovery
  foreign key(discovery_id,previous_handoff_id) references public.agent_b_handoffs(discovery_id,handoff_id) on delete restrict;
alter table public.agent_b_handoffs add constraint agent_b_handoff_version_positive check(version > 0);
alter table public.agent_b_human_decisions add constraint agent_b_decision_discovery_id unique(discovery_id,decision_id);

create table public.agent_b_handoff_operations (
  operation_id uuid primary key,
  discovery_id uuid not null references public.agent_b_discoveries(discovery_id) on delete restrict,
  actor_identity_id uuid not null references auth.users(id) on delete restrict,
  decision_id text not null,
  handoff_id uuid not null,
  request jsonb not null,
  result jsonb not null,
  source_state jsonb not null,
  unique(discovery_id,operation_id),
  foreign key(discovery_id,decision_id) references public.agent_b_human_decisions(discovery_id,decision_id) on delete restrict,
  foreign key(discovery_id,handoff_id) references public.agent_b_handoffs(discovery_id,handoff_id) on delete restrict
);
create table public.agent_b_handoff_current (
  discovery_id uuid primary key references public.agent_b_discoveries(discovery_id) on delete restrict,
  handoff_id uuid not null,
  version integer not null,
  foreign key(discovery_id,handoff_id,version) references public.agent_b_handoffs(discovery_id,handoff_id,version) on delete restrict
);
-- Explicit preexisting ISSUED state only; multiple heads fail instead of guessing latest.
insert into public.agent_b_handoff_current(discovery_id,handoff_id,version)
  select discovery_id,handoff_id,version from public.agent_b_handoffs where status='ISSUED';
create table public.agent_b_handoff_supersessions (
  discovery_id uuid not null references public.agent_b_discoveries(discovery_id) on delete restrict,
  previous_handoff_id uuid primary key,
  previous_version integer not null,
  replacement_handoff_id uuid not null unique,
  replacement_version integer not null,
  operation_id uuid not null unique,
  check(previous_handoff_id <> replacement_handoff_id and replacement_version=previous_version+1),
  foreign key(discovery_id,previous_handoff_id,previous_version) references public.agent_b_handoffs(discovery_id,handoff_id,version) on delete restrict,
  foreign key(discovery_id,replacement_handoff_id,replacement_version) references public.agent_b_handoffs(discovery_id,handoff_id,version) on delete restrict,
  foreign key(discovery_id,operation_id) references public.agent_b_handoff_operations(discovery_id,operation_id) on delete restrict
);
alter table public.agent_b_handoff_operations enable row level security;
alter table public.agent_b_handoff_current enable row level security;
alter table public.agent_b_handoff_supersessions enable row level security;
revoke all on public.agent_b_handoff_operations,public.agent_b_handoff_current,public.agent_b_handoff_supersessions
  from public,anon,authenticated,service_role;
grant select on public.agent_b_handoff_operations,public.agent_b_handoff_current,public.agent_b_handoff_supersessions to authenticated;
create policy agent_b_handoff_operation_read on public.agent_b_handoff_operations for select to authenticated
  using(public.agent_b_has_owner_access(discovery_id));
create policy agent_b_handoff_current_read on public.agent_b_handoff_current for select to authenticated
  using(public.agent_b_has_owner_access(discovery_id));
create policy agent_b_handoff_supersession_read on public.agent_b_handoff_supersessions for select to authenticated
  using(public.agent_b_has_owner_access(discovery_id));
create trigger agent_b_handoff_immutable before update or delete on public.agent_b_handoffs
  for each row execute function agent_b_private.governance_immutable();
create trigger agent_b_handoff_operation_immutable before update or delete on public.agent_b_handoff_operations
  for each row execute function agent_b_private.governance_immutable();
create trigger agent_b_handoff_supersession_immutable before update or delete on public.agent_b_handoff_supersessions
  for each row execute function agent_b_private.governance_immutable();

create function agent_b_private.handoff_json(h public.agent_b_handoffs) returns jsonb
language sql stable security invoker set search_path='' as $$
  select jsonb_build_object('handoffId',h.handoff_id,'discoveryId',h.discovery_id,'version',h.version,
    'status',case when h.status='SUPERSEDED' or exists(select 1 from public.agent_b_handoff_supersessions s
      where s.discovery_id=h.discovery_id and s.previous_handoff_id=h.handoff_id) then 'SUPERSEDED' else 'ISSUED' end,
    'sourceRuntimeVersion',h.source_runtime_version,'decision',h.decision,
    'previousHandoffId',h.previous_handoff_id,'issuedAt',coalesce(
      (select o.result->>'issuedAt' from public.agent_b_handoff_operations o where o.discovery_id=h.discovery_id and o.handoff_id=h.handoff_id),
      to_char(h.issued_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')));
$$;
create function agent_b_private.mutate_handoff(p_actor uuid,p_input jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  d uuid; op uuid; hid uuid; prior_id uuid; expected integer; next_version integer;
  action text; k text; intent jsonb; result jsonb; source jsonb;
  head public.agent_b_handoff_current; replay public.agent_b_handoff_operations;
  runtime public.agent_b_runtime_state;
begin
  if jsonb_typeof(p_input) is distinct from 'object' then
    raise exception using errcode='22023',message='INVALID_INPUT';
  end if;
  action:=p_input->>'action';
  if (action in ('ISSUE_HANDOFF','SUPERSEDE_HANDOFF')) is not true then
    raise exception using errcode='22023',message='INVALID_INPUT';
  end if;
  foreach k in array array['discoveryId','operationId','handoffId','issuedAt'] loop
    if jsonb_typeof(p_input->k) is distinct from 'string' or length(p_input->>k)=0 then
      raise exception using errcode='22023',message='INVALID_INPUT';
    end if;
  end loop;
  if exists(select 1 from jsonb_object_keys(p_input) key where key not in
    ('discoveryId','operationId','handoffId','issuedAt','action','sourceRuntimeVersion','decision','expectedHandoffId','expectedVersion'))
    or jsonb_typeof(p_input->'decision') is distinct from 'object'
    or jsonb_typeof(p_input->'sourceRuntimeVersion') is distinct from 'number'
    or (p_input->>'sourceRuntimeVersion') !~ '^[0-9]+$'
    or (p_input->>'sourceRuntimeVersion')::numeric > 9007199254740991 then
    raise exception using errcode='22023',message='INVALID_INPUT';
  end if;
  d:=(p_input->>'discoveryId')::uuid; op:=(p_input->>'operationId')::uuid; hid:=(p_input->>'handoffId')::uuid;
  perform (p_input->>'issuedAt')::timestamptz;
  perform agent_b_private.lock_governance_access(p_actor,d);
  if action='ISSUE_HANDOFF' then
    if p_input ? 'expectedHandoffId' or p_input ? 'expectedVersion' then
      raise exception using errcode='22023',message='INVALID_INPUT';
    end if;
    expected:=1; prior_id:=null;
  else
    if jsonb_typeof(p_input->'expectedHandoffId') is distinct from 'string'
      or jsonb_typeof(p_input->'expectedVersion') is distinct from 'number'
      or (p_input->>'expectedVersion') !~ '^[1-9][0-9]*$'
      or (p_input->>'expectedVersion')::numeric >= 2147483647 then
      raise exception using errcode='22023',message='INVALID_INPUT';
    end if;
    prior_id:=(p_input->>'expectedHandoffId')::uuid;
    expected:=(p_input->>'expectedVersion')::integer;
    if hid=prior_id then raise exception using errcode='22023',message='INVALID_INPUT'; end if;
  end if;
  intent:=jsonb_build_object('discoveryId',d,'action',action,'targetType','HANDOFF',
    'targetId',coalesce(prior_id,hid),'targetVersion',expected,
    'outcome',case when action='ISSUE_HANDOFF' then 'ISSUED' else 'SUPERSEDED' end,
    'operationId',op,'reference',p_input->'decision');
  -- Repeat governance validation inside this transaction, also on replay.
  perform agent_b_private.validate_human_decision(p_actor,intent);
  select * into replay from public.agent_b_handoff_operations where operation_id=op;
  if found then
    if replay.discovery_id<>d or replay.actor_identity_id<>p_actor or replay.request is distinct from p_input then
      raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';
    end if;
    return replay.result;
  end if;
  select * into head from public.agent_b_handoff_current where discovery_id=d for update;
  if action='ISSUE_HANDOFF' then
    if head.handoff_id is not null or exists(select 1 from public.agent_b_handoffs where discovery_id=d) then
      raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';
    end if;
    next_version:=1;
  else
    if head.handoff_id is distinct from prior_id or head.version is distinct from expected
      or exists(select 1 from public.agent_b_handoff_supersessions where previous_handoff_id=prior_id)
      or not exists(select 1 from public.agent_b_handoffs where discovery_id=d and handoff_id=prior_id and status='ISSUED') then
      raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';
    end if;
    next_version:=expected+1;
  end if;
  select * into runtime from public.agent_b_runtime_state where discovery_id=d for update;
  if not found or runtime.runtime_version is distinct from (p_input->>'sourceRuntimeVersion')::bigint then
    raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';
  end if;
  -- Referential source snapshot only, not a second semantic authority.
  source:=jsonb_build_object('runtimeVersion',runtime.runtime_version,'current',runtime.current_state,
    'freshness',runtime.freshness,'pending',runtime.pending);
  result:=jsonb_build_object('handoffId',hid,'discoveryId',d,'version',next_version,'status','ISSUED',
    'sourceRuntimeVersion',runtime.runtime_version,'decision',p_input->'decision',
    'previousHandoffId',prior_id,'issuedAt',p_input->>'issuedAt');
  insert into public.agent_b_handoffs(handoff_id,discovery_id,version,status,source_runtime_version,decision,previous_handoff_id,issued_at)
    values(hid,d,next_version,'ISSUED',runtime.runtime_version,p_input->'decision',prior_id,(p_input->>'issuedAt')::timestamptz);
  insert into public.agent_b_handoff_operations(operation_id,discovery_id,actor_identity_id,decision_id,handoff_id,request,result,source_state)
    values(op,d,p_actor,p_input->'decision'->>'decisionId',hid,p_input,result,source);
  if action='SUPERSEDE_HANDOFF' then
    insert into public.agent_b_handoff_supersessions(discovery_id,previous_handoff_id,previous_version,replacement_handoff_id,replacement_version,operation_id)
      values(d,prior_id,expected,hid,next_version,op);
  end if;
  insert into public.agent_b_handoff_current(discovery_id,handoff_id,version) values(d,hid,next_version)
    on conflict(discovery_id) do update set handoff_id=excluded.handoff_id,version=excluded.version;
  return result;
end $$;
create function public.agent_b_mutate_handoff(p_actor uuid,p_input jsonb) returns jsonb
language sql security invoker set search_path='' as $$
  select agent_b_private.mutate_handoff(p_actor,p_input);
$$;
create function public.agent_b_read_handoff(p_actor uuid,p_discovery uuid,p_history boolean) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
  if p_actor is null or p_actor is distinct from auth.uid() or auth.role() is distinct from 'authenticated'
    or not public.agent_b_has_owner_access(p_discovery) then
    raise exception using errcode='42501',message='ACCESS_DENIED';
  end if;
  if p_history is null then raise exception using errcode='22023',message='INVALID_INPUT'; end if;
  if p_history then
    select coalesce(jsonb_agg(agent_b_private.handoff_json(h) order by h.version),'[]'::jsonb) into result
      from public.agent_b_handoffs h where h.discovery_id=p_discovery;
  else
    select agent_b_private.handoff_json(h) into result from public.agent_b_handoff_current c
      join public.agent_b_handoffs h on h.discovery_id=c.discovery_id and h.handoff_id=c.handoff_id and h.version=c.version
      where c.discovery_id=p_discovery;
  end if;
  return result;
end $$;
revoke all on function agent_b_private.handoff_json(public.agent_b_handoffs),agent_b_private.mutate_handoff(uuid,jsonb),
  public.agent_b_mutate_handoff(uuid,jsonb),public.agent_b_read_handoff(uuid,uuid,boolean) from public,anon,authenticated,service_role;
grant execute on function agent_b_private.handoff_json(public.agent_b_handoffs),agent_b_private.mutate_handoff(uuid,jsonb),
  public.agent_b_mutate_handoff(uuid,jsonb),public.agent_b_read_handoff(uuid,uuid,boolean) to authenticated;

-- R08-04A corrective DDL: leave applied migration 005 unchanged. Remove its
-- unsafe arbitrary-runtime RPC rather than leaving a parallel write authority.
-- The legacy ledger lacks historical runtime snapshots. Never silently change
-- replay semantics for existing accepted operations. A nonempty ledger requires
-- a separate recovery decision before this migration can be applied.
do $$ begin
  if exists(select 1 from public.agent_b_resume_operations) then
    raise exception using errcode='55000',message='LEGACY_RESUME_RECONCILIATION_REQUIRED';
  end if;
end $$;
drop function public.agent_b_resume_atomic(uuid,uuid,uuid,text,bigint,text,jsonb,timestamptz);
alter table public.agent_b_sessions add constraint agent_b_session_previous_same_discovery
  foreign key(discovery_id,previous_session_id) references public.agent_b_sessions(discovery_id,session_id) on delete restrict;
create table public.agent_b_runtime_operations (
  operation_id uuid primary key,
  discovery_id uuid not null references public.agent_b_discoveries(discovery_id) on delete restrict,
  actor_identity_id uuid not null references auth.users(id) on delete restrict,
  kind text not null check(kind in ('INITIALIZE','RESUME')),
  session_id text not null,
  request jsonb not null,
  result jsonb not null,
  foreign key(discovery_id,session_id) references public.agent_b_sessions(discovery_id,session_id) on delete restrict
);
alter table public.agent_b_runtime_operations enable row level security;
revoke all on public.agent_b_runtime_operations from public,anon,authenticated,service_role;
grant select on public.agent_b_runtime_operations to authenticated;
create policy agent_b_runtime_operation_read on public.agent_b_runtime_operations for select to authenticated
  using(public.agent_b_has_owner_access(discovery_id));
create trigger agent_b_runtime_operation_immutable before update or delete on public.agent_b_runtime_operations
  for each row execute function agent_b_private.governance_immutable();
create function agent_b_private.session_terminal_guard() returns trigger
language plpgsql set search_path='' as $$
begin
  if old.session_id is distinct from new.session_id or old.discovery_id is distinct from new.discovery_id
    or old.previous_session_id is distinct from new.previous_session_id or old.created_at is distinct from new.created_at
    or old.lifecycle <> 'OPEN' or new.lifecycle not in ('INTERRUPTED','CLOSED') then
    raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';
  end if;
  return new;
end $$;
create trigger agent_b_session_terminal before update on public.agent_b_sessions
  for each row execute function agent_b_private.session_terminal_guard();
revoke all on function agent_b_private.session_terminal_guard() from public,anon,authenticated,service_role;

create function agent_b_private.runtime_operation(p_actor uuid,p_input jsonb,p_initialize boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  d uuid; op uuid; sid text; prev text; expected bigint; affected bigint; k text;
  operation_kind text; r public.agent_b_runtime_state; s public.agent_b_sessions;
  predecessor public.agent_b_sessions; replay public.agent_b_runtime_operations;
  result jsonb;
begin
  if p_initialize is null or jsonb_typeof(p_input) is distinct from 'object' then
    raise exception using errcode='22023',message='INVALID_INPUT';
  end if;
  foreach k in array array['discoveryId','operationId','sessionId','now'] loop
    if jsonb_typeof(p_input->k) is distinct from 'string' or length(btrim(p_input->>k))=0 then
      raise exception using errcode='22023',message='INVALID_INPUT';
    end if;
  end loop;
  if exists(select 1 from jsonb_object_keys(p_input) key where key not in
    ('discoveryId','operationId','sessionId','now','expectedRuntimeVersion','previousSessionId')) then
    raise exception using errcode='22023',message='INVALID_INPUT';
  end if;
  d:=(p_input->>'discoveryId')::uuid; op:=(p_input->>'operationId')::uuid;
  -- UUID identity only, never timestamp-derived session identifiers.
  perform (p_input->>'sessionId')::uuid;
  sid:=p_input->>'sessionId';
  if (p_input->>'now') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}([.][0-9]+)?(Z|[+-][0-9]{2}:[0-9]{2})$' then
    raise exception using errcode='22023',message='INVALID_INPUT';
  end if;
  perform (p_input->>'now')::timestamptz;
  if p_initialize then
    if p_input ? 'expectedRuntimeVersion' or p_input ? 'previousSessionId' then
      raise exception using errcode='22023',message='INVALID_INPUT';
    end if;
    operation_kind:='INITIALIZE';
  else
    if jsonb_typeof(p_input->'expectedRuntimeVersion') is distinct from 'number'
      or (p_input->>'expectedRuntimeVersion') !~ '^[0-9]+$'
      or (p_input->>'expectedRuntimeVersion')::numeric >= 9007199254740991
      or jsonb_typeof(p_input->'previousSessionId') is distinct from 'string'
      or length(btrim(p_input->>'previousSessionId'))=0 then
      raise exception using errcode='22023',message='INVALID_INPUT';
    end if;
    expected:=(p_input->>'expectedRuntimeVersion')::bigint; prev:=p_input->>'previousSessionId';
    if sid=prev then raise exception using errcode='22023',message='INVALID_INPUT'; end if;
    operation_kind:='RESUME';
  end if;
  -- Serializes operations on this Discovery and rechecks owner/access.
  perform agent_b_private.lock_governance_access(p_actor,d);
  select * into replay from public.agent_b_runtime_operations where operation_id=op;
  if found then
    if replay.discovery_id<>d or replay.actor_identity_id<>p_actor or replay.kind<>operation_kind
      or replay.request is distinct from p_input then
      raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';
    end if;
    return replay.result;
  end if;
  -- A legacy accepted operation has no trustworthy post-operation snapshot.
  -- Never reuse its ID or disclose its result across Discoveries.
  if exists(select 1 from public.agent_b_resume_operations where operation_id=op) then
    raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';
  end if;
  if p_initialize then
    if exists(select 1 from public.agent_b_runtime_state where discovery_id=d)
      or exists(select 1 from public.agent_b_sessions where discovery_id=d) then
      raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';
    end if;
    insert into public.agent_b_runtime_state(discovery_id,runtime_version,freshness,current_state,pending)
      values(d,0,'CURRENT',jsonb_build_object('pendingIds','[]'::jsonb,'sessionId',sid),'[]'::jsonb) returning * into r;
  else
    select * into r from public.agent_b_runtime_state where discovery_id=d for update;
    if not found or r.runtime_version<>expected or r.current_state->>'sessionId' is distinct from prev then
      raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';
    end if;
    select * into predecessor from public.agent_b_sessions where discovery_id=d and session_id=prev for update;
    if not found then raise exception using errcode='42501',message='ACCESS_DENIED'; end if;
    if exists(select 1 from public.agent_b_sessions where discovery_id=d and lifecycle='OPEN' and session_id<>prev) then
      raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';
    end if;
    if predecessor.lifecycle='OPEN' then
      update public.agent_b_sessions set lifecycle='INTERRUPTED'
        where discovery_id=d and session_id=prev and lifecycle='OPEN';
      get diagnostics affected = row_count;
      if affected<>1 then raise exception using errcode='40001',message='CONCURRENT_MODIFICATION'; end if;
    elsif predecessor.lifecycle not in ('INTERRUPTED','CLOSED') then
      raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';
    end if;
  end if;
  insert into public.agent_b_sessions(session_id,discovery_id,previous_session_id,lifecycle,created_at)
    values(sid,d,prev,'OPEN',(p_input->>'now')::timestamptz) returning * into s;
  if not p_initialize then
    update public.agent_b_runtime_state
      set runtime_version=expected+1,current_state=jsonb_set(current_state,'{sessionId}',to_jsonb(sid),true)
      where discovery_id=d and runtime_version=expected returning * into r;
    get diagnostics affected = row_count;
    if affected<>1 then raise exception using errcode='40001',message='CONCURRENT_MODIFICATION'; end if;
  end if;
  result:=jsonb_build_object('runtime',jsonb_build_object('discoveryId',d,'runtimeVersion',r.runtime_version,
    'freshness',r.freshness,'current',r.current_state,'pending',r.pending),
    'session',jsonb_build_object('sessionId',s.session_id,'discoveryId',d,'previousSessionId',s.previous_session_id,
      'lifecycle',s.lifecycle,'createdAt',p_input->>'now'));
  insert into public.agent_b_runtime_operations(operation_id,discovery_id,actor_identity_id,kind,session_id,request,result)
    values(op,d,p_actor,operation_kind,sid,p_input,result);
  return result;
end $$;
create function public.agent_b_initialize_runtime(p_actor uuid,p_input jsonb) returns jsonb
language sql security invoker set search_path='' as $$ select agent_b_private.runtime_operation(p_actor,p_input,true); $$;
create function public.agent_b_resume_atomic(p_actor uuid,p_input jsonb) returns jsonb
language sql security invoker set search_path='' as $$ select agent_b_private.runtime_operation(p_actor,p_input,false); $$;
revoke all on function agent_b_private.runtime_operation(uuid,jsonb,boolean),public.agent_b_initialize_runtime(uuid,jsonb),
  public.agent_b_resume_atomic(uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function agent_b_private.runtime_operation(uuid,jsonb,boolean),public.agent_b_initialize_runtime(uuid,jsonb),
  public.agent_b_resume_atomic(uuid,jsonb) to authenticated;

-- R08-04: replay-safe operational root creation. No semantic/governance records.
create table public.agent_b_discovery_creation_operations (
  operation_id uuid primary key,
  actor_identity_id uuid not null references auth.users(id) on delete restrict,
  discovery_id uuid not null unique references public.agent_b_discoveries(discovery_id) on delete restrict
);
alter table public.agent_b_discovery_creation_operations enable row level security;
revoke all on public.agent_b_discovery_creation_operations from public,anon,authenticated,service_role;
create trigger agent_b_discovery_creation_immutable before update or delete on public.agent_b_discovery_creation_operations
  for each row execute function agent_b_private.governance_immutable();
create function agent_b_private.create_owned_discovery_once(p_expected_identity uuid,p_operation_id uuid)
returns setof public.agent_b_discoveries language plpgsql security definer set search_path='' as $$
declare prior public.agent_b_discovery_creation_operations; root public.agent_b_discoveries;
begin
  if p_expected_identity is null or p_expected_identity is distinct from auth.uid()
    or auth.role() is distinct from 'authenticated' then raise exception using errcode='42501',message='ACCESS_DENIED'; end if;
  if p_operation_id is null then raise exception using errcode='22023',message='INVALID_INPUT'; end if;
  -- Same operation serializes even across identities; replay never crosses owner.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_operation_id::text,0));
  select * into prior from public.agent_b_discovery_creation_operations where operation_id=p_operation_id;
  if found then
    if prior.actor_identity_id<>p_expected_identity then raise exception using errcode='42501',message='ACCESS_DENIED'; end if;
    perform agent_b_private.lock_governance_access(p_expected_identity,prior.discovery_id);
    return query select d.* from public.agent_b_discoveries d where d.discovery_id=prior.discovery_id;
    return;
  end if;
  select * into root from agent_b_private.create_owned_discovery(p_expected_identity);
  insert into public.agent_b_discovery_creation_operations values(p_operation_id,p_expected_identity,root.discovery_id);
  return next root;
end $$;
create function public.agent_b_create_owned_discovery_once(p_expected_identity uuid,p_operation_id uuid)
returns setof public.agent_b_discoveries language sql security invoker set search_path='' as $$
  select * from agent_b_private.create_owned_discovery_once(p_expected_identity,p_operation_id);
$$;
revoke all on function agent_b_private.create_owned_discovery_once(uuid,uuid),public.agent_b_create_owned_discovery_once(uuid,uuid)
  from public,anon,authenticated,service_role;
grant execute on function agent_b_private.create_owned_discovery_once(uuid,uuid),public.agent_b_create_owned_discovery_once(uuid,uuid) to authenticated;

-- R08-CTX: a single read statement provides one MVCC snapshot. Derived values
-- are never stored. Catalog/dependency sources are not implemented by the prior
-- batches; explicit null prevents absence being interpreted as NONE/FALSE/zero.
create function public.agent_b_read_governed_context(p_actor uuid,p_discovery uuid,p_session text)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
  if p_actor is null or p_actor is distinct from auth.uid() or auth.role() is distinct from 'authenticated'
    or not public.agent_b_has_owner_access(p_discovery) then
    raise exception using errcode='42501', message='ACCESS_DENIED';
  end if;
  select jsonb_build_object(
    'runtime', (select jsonb_build_object('discoveryId',r.discovery_id,'runtimeVersion',r.runtime_version,
      'freshness',r.freshness,'current',r.current_state,'pending',r.pending) from public.agent_b_runtime_state r where r.discovery_id=p_discovery),
    'session', (select jsonb_build_object('sessionId',s.session_id,'discoveryId',s.discovery_id,
      'previousSessionId',s.previous_session_id,'lifecycle',s.lifecycle,'createdAt',s.created_at)
      from public.agent_b_sessions s where s.discovery_id=p_discovery and s.session_id=p_session),
    'information', coalesce((select jsonb_agg(i.payload) from public.agent_b_information_records i
      join public.agent_b_runtime_state r on r.discovery_id=i.discovery_id
      and r.current_state->>'informationRecordId'=i.record_id where i.discovery_id=p_discovery),'[]'::jsonb),
    'classification', (select m.payload from public.agent_b_mc02_state m
      join public.agent_b_mc02_current c on c.discovery_id=m.discovery_id and c.kind=m.kind and c.record_id=m.record_id
      join public.agent_b_runtime_state r on r.discovery_id=m.discovery_id
      and to_jsonb(m.entity_version)=r.current_state->'classificationVersion' where m.discovery_id=p_discovery and m.kind='CLASSIFICATION'),
    'scope', (select m.payload from public.agent_b_mc02_state m
      join public.agent_b_mc02_current c on c.discovery_id=m.discovery_id and c.kind=m.kind and c.record_id=m.record_id
      join public.agent_b_runtime_state r on r.discovery_id=m.discovery_id
      and to_jsonb(m.entity_version)=r.current_state->'scopeVersion' where m.discovery_id=p_discovery and m.kind='SCOPE'),
    'catalog',null,'dependencies',null
  ) into result;
  return result;
end $$;
revoke all on function public.agent_b_read_governed_context(uuid,uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.agent_b_read_governed_context(uuid,uuid,text) to authenticated;
