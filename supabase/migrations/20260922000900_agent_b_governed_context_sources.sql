-- R08-06: governed immutable definitions; no derived applicability is stored.
create or replace function agent_b_private.record_human_decision(p_actor uuid, p_decision jsonb)
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
    or (p_decision->>'action') not in ('VALIDATE_EVIDENCE','REJECT_EVIDENCE','SUPERSEDE_EVIDENCE','ISSUE_HANDOFF','SUPERSEDE_HANDOFF','PUBLISH_FIELD_CATALOG','PUBLISH_DEPENDENCY_CATALOG')
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

create table public.agent_b_context_catalog_versions (
  discovery_id uuid not null references public.agent_b_discoveries(discovery_id) on delete restrict,
  kind text not null check(kind in ('FIELD_CATALOG','DEPENDENCY_CATALOG')),
  catalog_id text not null check(length(btrim(catalog_id))>0),
  version bigint not null check(version between 0 and 9007199254740991),
  predecessor_version bigint,
  operation_id uuid not null unique,
  decision_id text not null,
  payload jsonb not null,
  request jsonb not null,
  primary key(discovery_id,kind,catalog_id,version),
  unique(discovery_id,kind,version),
  foreign key(discovery_id,kind,catalog_id,predecessor_version) references public.agent_b_context_catalog_versions(discovery_id,kind,catalog_id,version) on delete restrict,
  foreign key(discovery_id,decision_id) references public.agent_b_human_decisions(discovery_id,decision_id) on delete restrict,
  check((version=0 and predecessor_version is null) or (version>0 and predecessor_version=version-1))
);
create table public.agent_b_context_catalog_current (
  discovery_id uuid not null references public.agent_b_discoveries(discovery_id) on delete restrict,
  kind text not null,
  catalog_id text not null,
  version bigint not null,
  primary key(discovery_id,kind),
  foreign key(discovery_id,kind,catalog_id,version) references public.agent_b_context_catalog_versions(discovery_id,kind,catalog_id,version) on delete restrict
);
alter table public.agent_b_context_catalog_versions enable row level security;
alter table public.agent_b_context_catalog_current enable row level security;
revoke all on public.agent_b_context_catalog_versions,public.agent_b_context_catalog_current from public,anon,authenticated,service_role;
grant select on public.agent_b_context_catalog_versions,public.agent_b_context_catalog_current to authenticated;
create policy agent_b_context_versions_read on public.agent_b_context_catalog_versions for select to authenticated using(public.agent_b_has_owner_access(discovery_id));
create policy agent_b_context_current_read on public.agent_b_context_catalog_current for select to authenticated using(public.agent_b_has_owner_access(discovery_id));
create trigger agent_b_context_version_immutable before update or delete on public.agent_b_context_catalog_versions for each row execute function agent_b_private.governance_immutable();

-- Strict structural helpers only; they confer no human or semantic authority.
create function agent_b_private.context_text(v jsonb) returns boolean language sql immutable set search_path='' as $$
 select coalesce(jsonb_typeof(v)='string' and length(btrim(v#>>'{}',chr(9)||chr(10)||chr(11)||chr(12)||chr(13)||chr(32)||chr(160)||chr(5760)||chr(8192)||chr(8193)||chr(8194)||chr(8195)||chr(8196)||chr(8197)||chr(8198)||chr(8199)||chr(8200)||chr(8201)||chr(8202)||chr(8232)||chr(8233)||chr(8239)||chr(8287)||chr(12288)||chr(65279)))>0,false);
$$;
create function agent_b_private.context_version(v jsonb) returns boolean language sql immutable set search_path='' as $$
 select case when jsonb_typeof(v)='number' and v::text ~ '^[0-9]+$' then v::numeric between 0 and 9007199254740991 else false end;
$$;
-- TimestampSchema ISO datetime pattern (Zod 4.4.3): calendar, precision and offsets.
create function agent_b_private.context_timestamp(v jsonb) returns boolean language sql immutable set search_path='' as $$
 select coalesce(jsonb_typeof(v)='string' and (v#>>'{}') ~ '^(([0-9][0-9][2468][048]|[0-9][0-9][13579][26]|[0-9][0-9]0[48]|[02468][048]00|[13579][26]00)-02-29|[0-9]{4}-((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01])|(0[469]|11)-(0[1-9]|[12][0-9]|30)|(02)-(0[1-9]|1[0-9]|2[0-8])))T(([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9](\.[0-9]+)?)?(Z|([+-]([01][0-9]|2[0-3]):[0-5][0-9])))$',false);
$$;
create function agent_b_private.context_source(v jsonb) returns boolean language sql immutable set search_path='' as $$
 select coalesce(jsonb_typeof(v)='object' and v-array['sourceId','reference','recordedAt']='{}'::jsonb
 and agent_b_private.context_text(v->'sourceId') and jsonb_typeof(v->'reference')='string' and length(v->>'reference')>0
 and (not (v ? 'recordedAt') or agent_b_private.context_timestamp(v->'recordedAt')),false);
$$;
create function agent_b_private.context_decision_ref(v jsonb) returns boolean language plpgsql immutable set search_path='' as $$
begin
 if jsonb_typeof(v) is distinct from 'object' or v-array['decisionId','source','recordedAt']<>'{}'::jsonb
   or not agent_b_private.context_text(v->'decisionId') or not agent_b_private.context_source(v->'source')
   or not agent_b_private.context_timestamp(v->'recordedAt') then return false;end if;
 return true;
exception when others then return false;
end $$;
create function agent_b_private.context_dependency(v jsonb,d uuid) returns boolean language plpgsql immutable set search_path='' as $$
declare t jsonb:=v->'target';
begin
 if jsonb_typeof(v) is distinct from 'object' or not agent_b_private.context_text(v->'dependencyId')
   or jsonb_typeof(v->'critical') is distinct from 'boolean' or (v->>'status' in ('MISSING','UNRESOLVED','SATISFIED')) is not true
   or jsonb_typeof(t) is distinct from 'object' then return false;end if;
 if v->>'status'='SATISFIED' then
   if v-array['dependencyId','critical','target','status','source']<>'{}'::jsonb or not agent_b_private.context_source(v->'source') then return false;end if;
 elsif v-array['dependencyId','critical','target','status']<>'{}'::jsonb then return false;end if;
 if t->>'kind'='FIELD' then return t-array['kind','fieldId']='{}'::jsonb and agent_b_private.context_text(t->'fieldId');
 elsif t->>'kind'='DOMAIN' then return t-array['kind','domainId']='{}'::jsonb and agent_b_private.context_text(t->'domainId');
 elsif t->>'kind'='DISCOVERY' then return t-array['kind','discoveryId']='{}'::jsonb and agent_b_private.context_text(t->'discoveryId');
 end if;return false;
end $$;
create function agent_b_private.validate_context_catalog(c jsonb) returns void language plpgsql set search_path='' as $$
declare d uuid; def jsonb; b jsonb; f jsonb; comp jsonb; dep jsonb; ids text[]:='{}'; ident text; key text; elem jsonb;
begin
 if jsonb_typeof(c) is distinct from 'object' or not agent_b_private.context_text(c->'catalogId')
   or not agent_b_private.context_text(c->'discoveryId') or not agent_b_private.context_version(c->'version')
   or c->>'status' is distinct from 'PUBLISHED' or not agent_b_private.context_timestamp(c->'createdAt')
   or jsonb_typeof(c->'definitions') is distinct from 'array' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 d:=(c->>'discoveryId')::uuid;
 if not (c ? 'predecessorVersion')
   or ((c->>'version')::bigint=0 and c->'predecessorVersion' is distinct from 'null'::jsonb)
   or ((c->>'version')::bigint>0 and (not agent_b_private.context_version(c->'predecessorVersion') or (c->>'predecessorVersion')::bigint<>(c->>'version')::bigint-1)) then
   raise exception using errcode='22023',message='INVALID_INPUT';end if;
 if c->>'kind'='FIELD_CATALOG' then
   if c-array['catalogId','discoveryId','version','status','predecessorVersion','createdAt','kind','completeness','definitions']<>'{}'::jsonb
     or (c->>'completeness' in ('INCOMPLETE','COMPLETE')) is not true then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 elsif c->>'kind'='DEPENDENCY_CATALOG' then
   if c-array['catalogId','discoveryId','version','status','predecessorVersion','createdAt','kind','definitions']<>'{}'::jsonb then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 else raise exception using errcode='22023',message='INVALID_INPUT';end if;
 for def in select value from jsonb_array_elements(c->'definitions') loop
   b:=def->'scopeBinding';f:=def->'contract';
   if jsonb_typeof(def) is distinct from 'object' or jsonb_typeof(b) is distinct from 'object' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
   if b->>'kind'='DISCOVERY_WIDE' then
     if b-array['kind']<>'{}'::jsonb then raise exception using errcode='22023',message='INVALID_INPUT';end if;
   elsif b->>'kind'='SEGMENT_BOUND' then
     if b-array['kind','segmentIds']<>'{}'::jsonb or jsonb_typeof(b->'segmentIds') is distinct from 'array' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
     if jsonb_array_length(b->'segmentIds')=0 or (select count(distinct value) from jsonb_array_elements(b->'segmentIds'))<>jsonb_array_length(b->'segmentIds') then raise exception using errcode='22023',message='INVALID_INPUT';end if;
     for elem in select value from jsonb_array_elements(b->'segmentIds') loop
       if not agent_b_private.context_text(elem) then raise exception using errcode='22023',message='INVALID_INPUT';end if;
     end loop;
   else raise exception using errcode='22023',message='INVALID_INPUT';end if;
   if c->>'kind'='FIELD_CATALOG' then
     ident:=def->>'fieldId';
     if def-array['fieldId','contract','requirement','scopeBinding']<>'{}'::jsonb or not agent_b_private.context_text(def->'fieldId')
       or (def->>'requirement' in ('REQUIRED','OPTIONAL')) is not true or jsonb_typeof(f) is distinct from 'object'
       or f-array['fieldId','domainId','entityVersion','informationRecordIds','completion']<>'{}'::jsonb
       or f->>'fieldId' is distinct from ident or not agent_b_private.context_text(f->'domainId')
       or not agent_b_private.context_version(f->'entityVersion') or jsonb_typeof(f->'informationRecordIds') is distinct from 'array' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
     for elem in select value from jsonb_array_elements(f->'informationRecordIds') loop
       if not agent_b_private.context_text(elem) then raise exception using errcode='22023',message='INVALID_INPUT';end if;
     end loop;
     comp:=f->'completion';
     if jsonb_typeof(comp) is distinct from 'object' or comp->>'level' is distinct from 'FIELD'
       or (comp->>'status' in ('INCOMPLETE','PARTIAL','READY_FOR_REVIEW','COMPLETE')) is not true
       or jsonb_typeof(comp->'dependencies') is distinct from 'array' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
     if comp->>'status'='COMPLETE' then
       if comp-array['level','status','dependencies','humanDecision']<>'{}'::jsonb or not agent_b_private.context_decision_ref(comp->'humanDecision') then raise exception using errcode='22023',message='INVALID_INPUT';end if;
     elsif comp-array['level','status','dependencies']<>'{}'::jsonb then raise exception using errcode='22023',message='INVALID_INPUT';end if;
     for dep in select value from jsonb_array_elements(comp->'dependencies') loop
       if not agent_b_private.context_dependency(dep,d) or (comp->>'status'='COMPLETE' and dep->'critical'='true'::jsonb and dep->>'status'<>'SATISFIED') then raise exception using errcode='22023',message='INVALID_INPUT';end if;
     end loop;
   else
     ident:=def->>'dependencyId';
     if def-array['dependencyId','contract','scopeBinding']<>'{}'::jsonb or not agent_b_private.context_text(def->'dependencyId')
       or f->>'dependencyId' is distinct from ident or not agent_b_private.context_dependency(f,d)
       or (f->'target'->>'kind'='DISCOVERY' and f->'target'->>'discoveryId' is distinct from d::text) then raise exception using errcode='22023',message='INVALID_INPUT';end if;
   end if;
   if ident=any(ids) then raise exception using errcode='22023',message='INVALID_INPUT';end if;ids:=array_append(ids,ident);
 end loop;
end $$;

create function agent_b_private.publish_context_catalog(p_actor uuid,p_input jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare c jsonb:=p_input->'catalog';d uuid;op uuid;expected bigint;prior public.agent_b_context_catalog_current;accepted public.agent_b_context_catalog_versions;action text;
begin
 if jsonb_typeof(p_input) is distinct from 'object' or p_input-array['catalog','expectedVersion','operationId','decision']<>'{}'::jsonb
   or not(p_input ?& array['catalog','expectedVersion','operationId','decision']) or not agent_b_private.context_text(p_input->'operationId')
   or not agent_b_private.context_decision_ref(p_input->'decision') then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 perform agent_b_private.validate_context_catalog(c);
 d:=(c->>'discoveryId')::uuid;op:=(p_input->>'operationId')::uuid;
 if p_input->'expectedVersion' is distinct from c->'predecessorVersion' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 expected:=(p_input->>'expectedVersion')::bigint;
 perform agent_b_private.lock_governance_access(p_actor,d);
 action:=case when c->>'kind'='FIELD_CATALOG' then 'PUBLISH_FIELD_CATALOG' else 'PUBLISH_DEPENDENCY_CATALOG' end;
 perform agent_b_private.validate_human_decision(p_actor,jsonb_build_object('discoveryId',d,'action',action,'targetType',c->>'kind',
   'targetId',c->>'catalogId','targetVersion',c->'version','outcome','PUBLISHED','operationId',op,'reference',p_input->'decision'));
 select * into accepted from public.agent_b_context_catalog_versions where operation_id=op;
 if found then
   if accepted.discovery_id<>d or accepted.request is distinct from p_input then raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';end if;
   return accepted.payload;
 end if;
 select * into prior from public.agent_b_context_catalog_current where discovery_id=d and kind=c->>'kind';
 if (expected is null and prior.catalog_id is not null) or (expected is not null and (prior.catalog_id is null or prior.catalog_id<>c->>'catalogId' or prior.version<>expected)) then
   raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';end if;
 insert into public.agent_b_context_catalog_versions values(d,c->>'kind',c->>'catalogId',(c->>'version')::bigint,expected,op,p_input->'decision'->>'decisionId',c,p_input);
 insert into public.agent_b_context_catalog_current values(d,c->>'kind',c->>'catalogId',(c->>'version')::bigint)
   on conflict(discovery_id,kind) do update set version=excluded.version;
 return c;
end $$;
create function public.agent_b_publish_context_catalog(p_actor uuid,p_input jsonb) returns jsonb language sql security invoker set search_path='' as $$
 select agent_b_private.publish_context_catalog(p_actor,p_input);
$$;
create function public.agent_b_read_context_catalog(p_actor uuid,p_discovery uuid,p_kind text,p_history boolean) returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
 if p_actor is null or p_actor is distinct from auth.uid() or auth.role() is distinct from 'authenticated' or not public.agent_b_has_owner_access(p_discovery) then raise exception using errcode='42501',message='ACCESS_DENIED';end if;
 if p_history is null or (p_kind in ('FIELD_CATALOG','DEPENDENCY_CATALOG')) is not true then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 select coalesce(jsonb_agg(v.payload order by v.version),'[]') into result from public.agent_b_context_catalog_versions v
 where v.discovery_id=p_discovery and v.kind=p_kind and (p_history or exists(select 1 from public.agent_b_context_catalog_current c
   where c.discovery_id=v.discovery_id and c.kind=v.kind and c.catalog_id=v.catalog_id and c.version=v.version));
 return result;
end $$;
revoke all on function agent_b_private.context_text(jsonb),agent_b_private.context_version(jsonb),agent_b_private.context_timestamp(jsonb),agent_b_private.context_source(jsonb),agent_b_private.context_decision_ref(jsonb),agent_b_private.context_dependency(jsonb,uuid),agent_b_private.validate_context_catalog(jsonb),agent_b_private.publish_context_catalog(uuid,jsonb),public.agent_b_publish_context_catalog(uuid,jsonb),public.agent_b_read_context_catalog(uuid,uuid,text,boolean) from public,anon,authenticated,service_role;
grant execute on function agent_b_private.publish_context_catalog(uuid,jsonb),public.agent_b_publish_context_catalog(uuid,jsonb),public.agent_b_read_context_catalog(uuid,uuid,text,boolean) to authenticated;

create or replace function public.agent_b_read_governed_context(p_actor uuid,p_discovery uuid,p_session text)
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
    'catalog',(select v.payload from public.agent_b_context_catalog_current c join public.agent_b_context_catalog_versions v using(discovery_id,kind,catalog_id,version) where c.discovery_id=p_discovery and c.kind='FIELD_CATALOG'),
    'dependencies',(select v.payload from public.agent_b_context_catalog_current c join public.agent_b_context_catalog_versions v using(discovery_id,kind,catalog_id,version) where c.discovery_id=p_discovery and c.kind='DEPENDENCY_CATALOG')
  ) into result;
  return result;
end $$;
revoke all on function public.agent_b_read_governed_context(uuid,uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.agent_b_read_governed_context(uuid,uuid,text) to authenticated;
