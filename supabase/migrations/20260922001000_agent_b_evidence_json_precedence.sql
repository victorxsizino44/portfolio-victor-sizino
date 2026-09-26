-- R08-07: extract nested JSON objects before subtracting allowed keys.
-- Only grouping changes; CREATE OR REPLACE preserves owners and privileges.
create or replace function agent_b_private.register_evidence_file(p_actor uuid,p_stored jsonb,p_reference jsonb)
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
    or (p_reference->'source')-array['sourceId','reference','recordedAt']<>'{}'::jsonb
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
