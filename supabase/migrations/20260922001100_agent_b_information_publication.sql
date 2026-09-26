-- B14-B1.4 LOCAL REVIEW ONLY. Never edits/replays migrations 001-010.
-- No history backfill: legacy payloads and immutable operation results survive.
begin;

create function agent_b_private.information_binding(p jsonb) returns jsonb
language plpgsql immutable set search_path='' as $$
declare b jsonb:=p->'domainBinding';
begin
 if p ? 'domainBinding' then
  if jsonb_typeof(b) is distinct from 'object' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  if b->>'kind'='DOMAIN' then
   if b-array['kind','domainId']<>'{}'::jsonb or not agent_b_private.context_text(b->'domainId') then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  elsif b->>'kind'='CORE_NEUTRAL' then
   if b-array['kind']<>'{}'::jsonb then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  else raise exception using errcode='22023',message='INVALID_INPUT';end if;
  if p ? 'domainId' and (b->>'kind'<>'DOMAIN' or p->'domainId' is distinct from b->'domainId') then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  return b;
 end if;
 if not agent_b_private.context_text(p->'domainId') then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 return jsonb_build_object('kind','DOMAIN','domainId',p->'domainId');
end $$;

-- Frozen R08-10 physical cardinalities. Parity checked against TypeScript.
create function agent_b_private.information_cardinality(f text) returns text
language sql immutable set search_path='' as $$
 select case f
  when 'field.subject_context' then 'SINGLE'
  when 'field.primary_objective' then 'SINGLE'
  when 'field.current_state' then 'SINGLE'
  when 'field.desired_state' then 'SINGLE'
  when 'field.constraints' then 'MULTIPLE'
  when 'field.success_criteria' then 'MULTIPLE'
  when 'field.governance_context' then 'MULTIPLE'
 end;
$$;

-- Invoker/RLS for public reads; definer callers must authorize before calling.
create function agent_b_private.information_references(d uuid,c jsonb) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare refs jsonb:=c->'informationReferences';legacy jsonb;v jsonb;rid jsonb;row public.agent_b_information_records;
 fields text[]:='{}';ids text[]:='{}';result jsonb;
begin
 if c ? 'informationRecordId' then
  if not agent_b_private.context_text(c->'informationRecordId') then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  select * into row from public.agent_b_information_records where discovery_id=d and record_id=c->>'informationRecordId';
  if not found or not agent_b_private.context_text(row.payload->'fieldId') then raise exception using errcode='22023',message='INVALID_CURRENT_REFERENCE';end if;
  legacy:=jsonb_build_array(jsonb_build_object('fieldId',row.payload->'fieldId','recordIds',jsonb_build_array(row.record_id)));
 end if;
 if not(c ? 'informationReferences') then refs:=coalesce(legacy,'[]'::jsonb);end if;
 if jsonb_typeof(refs) is distinct from 'array' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 for v in select value from jsonb_array_elements(refs) loop
  if jsonb_typeof(v) is distinct from 'object' or v-array['fieldId','recordIds']<>'{}'::jsonb
    or not agent_b_private.context_text(v->'fieldId') or jsonb_typeof(v->'recordIds') is distinct from 'array'
    or v->>'fieldId'=any(fields) then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  fields:=array_append(fields,v->>'fieldId');
  if agent_b_private.information_cardinality(v->>'fieldId')='SINGLE' and jsonb_array_length(v->'recordIds')>1 then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  for rid in select value from jsonb_array_elements(v->'recordIds') loop
   if not agent_b_private.context_text(rid) or (rid#>>'{}')=any(ids) then raise exception using errcode='22023',message='INVALID_INPUT';end if;
   ids:=array_append(ids,rid#>>'{}');
   select * into row from public.agent_b_information_records where discovery_id=d and record_id=rid#>>'{}';
   if not found or row.payload->>'fieldId' is distinct from v->>'fieldId'
      or row.payload->>'discoveryId' is distinct from d::text or row.payload->>'recordId' is distinct from row.record_id then
    raise exception using errcode='22023',message='INVALID_CURRENT_REFERENCE';end if;
   perform agent_b_private.information_binding(row.payload);
  end loop;
 end loop;
 select coalesce(jsonb_agg(jsonb_build_object('fieldId',x->'fieldId','recordIds',
   (select coalesce(jsonb_agg(y order by (y#>>'{}') collate "C"),'[]'::jsonb) from jsonb_array_elements(x->'recordIds') y))
   order by (x->>'fieldId') collate "C"),'[]'::jsonb) into result from jsonb_array_elements(refs) x;
 if legacy is not null and result is distinct from legacy then raise exception using errcode='22023',message='CONFLICTING_CURRENT_REPRESENTATIONS';end if;
 return result;
end $$;

create function agent_b_private.information_current(d uuid,c jsonb,rid text) returns boolean
language sql stable security invoker set search_path='' as $$
 select exists(select 1 from jsonb_array_elements(agent_b_private.information_references(d,c)) f,
 jsonb_array_elements_text(f->'recordIds') r where r=rid);
$$;

create table public.agent_b_information_operations (
 operation_id uuid primary key,
 discovery_id uuid not null references public.agent_b_discoveries(discovery_id) on delete restrict,
 actor_id uuid not null references auth.users(id) on delete restrict,
 request jsonb not null,result jsonb not null,
 unique(discovery_id,operation_id)
);
create table public.agent_b_information_candidates (
 discovery_id uuid not null, candidate_id uuid not null, operation_id uuid not null,record_id text not null,
 primary key(discovery_id,candidate_id),unique(discovery_id,record_id),
 foreign key(discovery_id,operation_id) references public.agent_b_information_operations(discovery_id,operation_id) deferrable initially deferred,
 foreign key(discovery_id,record_id) references public.agent_b_information_records(discovery_id,record_id) on delete restrict
);
alter table public.agent_b_information_operations enable row level security;
alter table public.agent_b_information_candidates enable row level security;
revoke all on public.agent_b_information_operations,public.agent_b_information_candidates from public,anon,authenticated,service_role;
create trigger agent_b_information_operations_immutable before update or delete on public.agent_b_information_operations
 for each row execute function agent_b_private.governance_immutable();
create trigger agent_b_information_candidates_immutable before update or delete on public.agent_b_information_candidates
 for each row execute function agent_b_private.governance_immutable();

create function agent_b_private.publish_information(p_actor uuid,p_input jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare d uuid;op uuid;expected bigint;r public.agent_b_runtime_state;replay public.agent_b_information_operations;
 c jsonb;rec jsonb;b jsonb;refs jsonb;ids jsonb;v jsonb;old public.agent_b_information_records;
 field text;rid text;pred text;cid uuid;next_version bigint;root text;result jsonb;records jsonb:='[]';affected bigint;
 seen_candidates uuid[]:='{}';seen_records text[]:='{}';seen_predecessors text[]:='{}';stage jsonb;source jsonb;
 stages text[]:=array['CAPTURE','SEMANTIC_VERIFICATION','STRUCTURAL_VALIDATION','CONTEXTUAL_VALIDATION','EVIDENCE_CORRELATION','HUMAN_CONFIRMATION','OPERATIONAL_APPROVAL'];idx integer;
begin
 if jsonb_typeof(p_input) is distinct from 'object' or p_input-array['discoveryId','operationId','expectedRuntimeVersion','capturedAt','candidates']<>'{}'::jsonb
   or not(p_input ?& array['discoveryId','operationId','expectedRuntimeVersion','capturedAt','candidates'])
   or not agent_b_private.context_version(p_input->'expectedRuntimeVersion') or not agent_b_private.context_timestamp(p_input->'capturedAt')
   or jsonb_typeof(p_input->'candidates') is distinct from 'array' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 d:=(p_input->>'discoveryId')::uuid;op:=(p_input->>'operationId')::uuid;expected:=(p_input->>'expectedRuntimeVersion')::bigint;
 if jsonb_array_length(p_input->'candidates')=0 then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 perform agent_b_private.lock_governance_access(p_actor,d);
 select * into r from public.agent_b_runtime_state where discovery_id=d for update;
 if not found then raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';end if;
 select * into replay from public.agent_b_information_operations where operation_id=op;
 if found then
  if replay.discovery_id<>d or replay.actor_id<>p_actor or replay.request is distinct from p_input then raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';end if;
  return replay.result;
 end if;
 if r.runtime_version<>expected then raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';end if;
 refs:=agent_b_private.information_references(d,r.current_state);
 for c in select value from jsonb_array_elements(p_input->'candidates') loop
  if jsonb_typeof(c) is distinct from 'object' or c-array['candidateId','record','predecessorRecordId','expectedEntityVersion']<>'{}'::jsonb
   or not(c ?& array['candidateId','record','predecessorRecordId','expectedEntityVersion']) then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  cid:=(c->>'candidateId')::uuid;rec:=c->'record';field:=rec->>'fieldId';rid:=rec->>'recordId';pred:=c->>'predecessorRecordId';
  if cid is null or cid=any(seen_candidates) or exists(select 1 from public.agent_b_information_candidates where discovery_id=d and candidate_id=cid) then raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';end if;
  if jsonb_typeof(rec) is distinct from 'object' or rec-array['recordId','discoveryId','fieldId','domainBinding','domainId','entityVersion','content','sources','evidence','validation','confidence']<>'{}'::jsonb
   or not agent_b_private.context_text(rec->'recordId') or rec->>'discoveryId' is distinct from d::text
   or agent_b_private.information_cardinality(field) is null or not agent_b_private.context_version(rec->'entityVersion')
   or rid=any(seen_records) or pred=rid or rid=any(seen_predecessors) or pred=any(seen_records) or pred=any(seen_predecessors)
   then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  b:=agent_b_private.information_binding(rec);
  if (field='field.subject_context' and b is distinct from '{"kind":"CORE_NEUTRAL"}'::jsonb)
    or (field<>'field.subject_context' and b is distinct from jsonb_build_object('kind','DOMAIN','domainId',case when field='field.governance_context' then 'domain.governance' else 'domain.business' end)) then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  -- This bounded writer cannot promote confidence, evidence or human approval.
  if jsonb_typeof(rec->'content') is distinct from 'object' or (rec->'content')-array['kind','value']<>'{}'::jsonb
    or rec->'content'->>'kind' is distinct from 'STATEMENT' or not(rec->'content' ? 'value')
    or jsonb_typeof(rec->'confidence') is distinct from 'object' or (rec->'confidence')-array['level','sources','rationale']<>'{}'::jsonb
    or rec->'confidence'->>'level' is distinct from 'UNVERIFIED' or jsonb_typeof(rec->'confidence'->'sources') is distinct from 'array'
    or (rec->'confidence' ? 'rationale' and not agent_b_private.context_text(rec->'confidence'->'rationale'))
    or rec->'evidence' is distinct from '[]'::jsonb or jsonb_typeof(rec->'sources') is distinct from 'array'
    or jsonb_typeof(rec->'validation') is distinct from 'object' or (rec->'validation')-array['steps']<>'{}'::jsonb
    or jsonb_typeof(rec->'validation'->'steps') is distinct from 'array' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  for source in select value from jsonb_array_elements((rec->'sources')||(rec->'confidence'->'sources')) loop
   if not agent_b_private.context_source(source) then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  end loop;
  if jsonb_array_length(rec->'validation'->'steps')<>7 then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  idx:=1;
  for stage in select value from jsonb_array_elements(rec->'validation'->'steps') loop
   if jsonb_typeof(stage) is distinct from 'object' or stage-array['stage','result']<>'{}'::jsonb or stage->>'stage' is distinct from stages[idx]
      or jsonb_typeof(stage->'result') is distinct from 'object' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
   if stage->'result'->>'status'='PENDING' then
    if stage->'result' is distinct from jsonb_build_object('status','PENDING') then raise exception using errcode='22023',message='INVALID_INPUT';end if;
   elsif idx<=5 and stage->'result'->>'status' in ('PASSED','FAILED') then
    if (stage->'result')-array['status','source','recordedAt']<>'{}'::jsonb or not agent_b_private.context_source(stage->'result'->'source')
      or not agent_b_private.context_timestamp(stage->'result'->'recordedAt') then raise exception using errcode='22023',message='INVALID_INPUT';end if;
   else raise exception using errcode='22023',message='INVALID_INPUT';end if;
   idx:=idx+1;
  end loop;
  select x->'recordIds' into ids from jsonb_array_elements(refs) x where x->>'fieldId'=field;
  ids:=coalesce(ids,'[]'::jsonb);
  if pred is null then
   if c->'expectedEntityVersion' is distinct from 'null'::jsonb or rec->'entityVersion'<>'0'::jsonb then raise exception using errcode='22023',message='INVALID_INPUT';end if;
   next_version:=0;root:=rid;
  else
   if not agent_b_private.context_text(c->'predecessorRecordId') or not agent_b_private.context_version(c->'expectedEntityVersion') or not(ids ? pred) then raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';end if;
   select * into old from public.agent_b_information_records where discovery_id=d and record_id=pred for share;
   if not found or old.payload->>'fieldId' is distinct from field or old.entity_version<>(c->>'expectedEntityVersion')::bigint
      or agent_b_private.information_binding(old.payload) is distinct from b then raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';end if;
   next_version:=old.entity_version+1;root:=old.lineage_root_id;
   if rec->'entityVersion' is distinct from to_jsonb(next_version) then raise exception using errcode='22023',message='INVALID_INPUT';end if;
   ids:=ids-pred;
  end if;
  ids:=ids||jsonb_build_array(rid);
  if agent_b_private.information_cardinality(field)='SINGLE' and jsonb_array_length(ids)>1 then raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';end if;
  rec:=(rec-'domainId')||jsonb_build_object('domainBinding',b);
  insert into public.agent_b_information_records(record_id,discovery_id,entity_version,payload,lineage_root_id,supersedes_record_id,created_at)
   values(rid,d,next_version,rec,root,pred,(p_input->>'capturedAt')::timestamptz);
  insert into public.agent_b_information_candidates values(d,cid,op,rid);
  select coalesce(jsonb_agg(x),'[]'::jsonb) into refs from jsonb_array_elements(refs) x where x->>'fieldId'<>field;
  refs:=refs||jsonb_build_array(jsonb_build_object('fieldId',field,'recordIds',ids));
  records:=records||jsonb_build_array(rec);
  seen_candidates:=array_append(seen_candidates,cid);seen_records:=array_append(seen_records,rid);
  if pred is not null then seen_predecessors:=array_append(seen_predecessors,pred);end if;
 end loop;
 refs:=agent_b_private.information_references(d,jsonb_build_object('informationReferences',refs));
 update public.agent_b_runtime_state set current_state=(current_state-'informationRecordId')||jsonb_build_object('informationReferences',refs),runtime_version=expected+1
  where discovery_id=d and runtime_version=expected returning * into r;
 get diagnostics affected=row_count;
 if affected<>1 then raise exception using errcode='40001',message='CONCURRENT_MODIFICATION';end if;
 result:=jsonb_build_object('operationId',op,'records',records,'runtime',jsonb_build_object('discoveryId',d,'runtimeVersion',r.runtime_version,'freshness',r.freshness,'current',r.current_state,'pending',r.pending));
 insert into public.agent_b_information_operations values(op,d,p_actor,p_input,result);
 return result;
end $$;
create function public.agent_b_publish_information(p_actor uuid,p_input jsonb) returns jsonb
 language sql security invoker set search_path='' as $$ select agent_b_private.publish_information(p_actor,p_input); $$;

-- The defective legacy update cannot identify a distinct predecessor. Fail closed;
-- replacement is only available through the atomic accepted-set operation above.
create or replace function public.agent_b_update_information_record(p_expected_identity uuid,p_discovery_id uuid,p_expected_version bigint,p_record jsonb,p_created_at timestamptz)
returns public.agent_b_information_records language plpgsql security invoker set search_path='' as $$
begin raise exception using errcode='22023',message='EXPLICIT_PREDECESSOR_REQUIRED';end $$;
-- Legacy direct create/update are not publication APIs and must not bypass the new writer.
revoke all on function public.agent_b_create_information_record(uuid,jsonb,timestamptz),public.agent_b_update_information_record(uuid,uuid,bigint,jsonb,timestamptz) from public,anon,authenticated,service_role;

revoke all on function agent_b_private.information_binding(jsonb),agent_b_private.information_cardinality(text),agent_b_private.information_references(uuid,jsonb),agent_b_private.information_current(uuid,jsonb,text),agent_b_private.publish_information(uuid,jsonb),public.agent_b_publish_information(uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function agent_b_private.information_binding(jsonb),agent_b_private.information_cardinality(text),agent_b_private.information_references(uuid,jsonb),agent_b_private.information_current(uuid,jsonb,text),agent_b_private.publish_information(uuid,jsonb),public.agent_b_publish_information(uuid,jsonb) to authenticated;

-- Pure scalar predicate required by the invoker/RLS compatibility readers.
grant execute on function agent_b_private.context_text(jsonb) to authenticated;

-- Compatibility definitions below replace only affected functions, never historical rows.

create or replace function agent_b_private.validate_context_catalog(c jsonb) returns void language plpgsql set search_path='' as $$
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
       or f-array['fieldId','domainId','domainBinding','entityVersion','informationRecordIds','completion']<>'{}'::jsonb
       or f->>'fieldId' is distinct from ident or agent_b_private.information_binding(f) is null
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
      'freshness',r.freshness,'current',(r.current_state-'informationRecordId')||jsonb_build_object('informationReferences',agent_b_private.information_references(r.discovery_id,r.current_state)),'pending',r.pending) from public.agent_b_runtime_state r where r.discovery_id=p_discovery),
    'session', (select jsonb_build_object('sessionId',s.session_id,'discoveryId',s.discovery_id,
      'previousSessionId',s.previous_session_id,'lifecycle',s.lifecycle,'createdAt',s.created_at)
      from public.agent_b_sessions s where s.discovery_id=p_discovery and s.session_id=p_session),
    'information', coalesce((select jsonb_agg(i.payload) from public.agent_b_information_records i
      join public.agent_b_runtime_state r on r.discovery_id=i.discovery_id
      and agent_b_private.information_current(r.discovery_id,r.current_state,i.record_id) where i.discovery_id=p_discovery),'[]'::jsonb),
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


create or replace function agent_b_private.mutate_evidence(p_actor uuid,p_input jsonb)
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
      or (p_input->'decision')-array['decisionId','source','recordedAt']<>'{}'::jsonb
      or jsonb_typeof(p_input->'decision'->'decisionId') is distinct from 'string'
      or jsonb_typeof(p_input->'decision'->'recordedAt') is distinct from 'string'
      or jsonb_typeof(p_input->'decision'->'source') is distinct from 'object'
      or (p_input->'decision'->'source')-array['sourceId','reference','recordedAt']<>'{}'::jsonb
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
        perform 1 from public.agent_b_runtime_state where discovery_id=d and agent_b_private.information_current(d,current_state,info.record_id) for share;
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
commit;
