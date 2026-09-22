create table if not exists public.agent_b_resume_operations(operation_id uuid primary key, discovery_id uuid not null references public.agent_b_discoveries(discovery_id), runtime_version bigint not null, session_id text not null, created_at timestamptz not null);
revoke all on table public.agent_b_resume_operations from public,anon,authenticated,service_role;
create or replace function public.agent_b_resume_atomic(p_expected_identity uuid,p_discovery_id uuid,p_operation_id uuid,p_session_id text,p_expected_runtime_version bigint,p_previous_session_id text,p_runtime jsonb,p_created_at timestamptz)
returns public.agent_b_sessions language plpgsql security definer set search_path='' as $$ declare r public.agent_b_sessions; existing public.agent_b_resume_operations; begin
 if not exists(select 1 from public.agent_b_discoveries d join public.agent_b_discovery_access a using(discovery_id) where d.discovery_id=p_discovery_id and d.owner_id=auth.uid() and a.identity_id=auth.uid() and a.role='OWNER' and p_expected_identity=auth.uid()) then raise exception 'access denied' using errcode='42501'; end if;
 select * into existing from public.agent_b_resume_operations where operation_id=p_operation_id;
 if existing.operation_id is not null then select * into r from public.agent_b_sessions where session_id=existing.session_id; return r; end if;
 if not exists(select 1 from public.agent_b_runtime_state where discovery_id=p_discovery_id and runtime_version=p_expected_runtime_version) then raise exception 'stale runtime' using errcode='40001'; end if;
 if p_previous_session_id is not null then update public.agent_b_sessions set lifecycle='INTERRUPTED' where session_id=p_previous_session_id and discovery_id=p_discovery_id and lifecycle='OPEN'; end if;
 insert into public.agent_b_sessions(session_id,discovery_id,previous_session_id,lifecycle,created_at) values(p_session_id,p_discovery_id,p_previous_session_id,'OPEN',p_created_at) returning * into r;
 update public.agent_b_runtime_state set runtime_version=p_expected_runtime_version+1,current_state=p_runtime->'current',freshness=p_runtime->>'freshness',pending=p_runtime->'pending' where discovery_id=p_discovery_id and runtime_version=p_expected_runtime_version;
 insert into public.agent_b_resume_operations values(p_operation_id,p_discovery_id,p_expected_runtime_version+1,p_session_id,p_created_at); return r;
end $$;
revoke all on function public.agent_b_resume_atomic(uuid,uuid,uuid,text,bigint,text,jsonb,timestamptz) from public,anon,authenticated,service_role; grant execute on function public.agent_b_resume_atomic(uuid,uuid,uuid,text,bigint,text,jsonb,timestamptz) to authenticated;
