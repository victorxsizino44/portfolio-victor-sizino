-- R08-05: preserve applied 007 history. Extract the JSONB object before
-- subtracting allowed keys; arithmetic subtraction binds before ->.
-- CREATE OR REPLACE preserves the existing function owner and privileges.
create or replace function agent_b_private.write_mc02(p_actor uuid,p_input jsonb)
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
    or (p_input->'value')-array['kind','contract'] <> '{}'::jsonb then
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
