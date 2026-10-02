begin;
create function public.update_own_profile(p_name text) returns void language plpgsql security definer set search_path=public as $$begin
 if auth.uid() is null or length(p_name)<2 or length(p_name)>120 then raise exception 'Invalid profile';end if;
 update profiles set name=p_name,updated_at=now() where id=auth.uid() and not disabled;
end;$$;
revoke all on function public.update_own_profile(text) from public,anon;
grant execute on function public.update_own_profile(text) to authenticated;
-- Public intake is performed only by the server credential. Job state is locked and
-- checked inside the same transaction that saves the application.
create function public.receive_submission(p_id uuid,p_module text,p_title text,p_data jsonb) returns uuid language plpgsql security definer set search_path=public as $$
 declare job records; settings jsonb;
 begin
 if p_module not in ('leads','applications') then raise exception 'Invalid submission';end if;
 select data into settings from records where module='settings' and status='published' limit 1;
 if p_module='leads' and settings->>'assessment_enabled'='false' then raise exception 'Assessment requests are paused';end if;
 if p_module='applications' then
  if settings->>'careers_enabled'='false' then raise exception 'Careers are paused';end if;
  if p_data->>'job_id'='general' then
   if coalesce(settings->>'general_applications','false')<>'true' then raise exception 'General applications are closed';end if;
  else
   select * into job from records where id=(p_data->>'job_id')::uuid and module='jobs' for share;
   if job.id is null or job.status<>'open' or job.deleted_at is not null or job.data->>'accept_applications'='false' or (nullif(job.data->>'deadline','') is not null and (job.data->>'deadline')::date<current_date) then raise exception 'Applications for this role are closed';end if;
   p_data=p_data||jsonb_build_object('job_title',job.title);
  end if;
 end if;
 insert into records(id,module,title,slug,status,data) values(p_id,p_module,p_title,p_id::text,'new',p_data);
 insert into record_activity(record_id,action) values(p_id,case when p_module='leads' then 'Assessment request submitted' else 'Application submitted' end);
 insert into records(module,title,slug,status,data) values('notifications',case when p_module='leads' then 'New assessment request' else 'New application' end,gen_random_uuid()::text,'unread',jsonb_build_object('message',p_title,'destination','/admin/'||p_module||'/'||p_id));
 insert into analytics_events(event,path) values(case when p_module='leads' then 'assessment_submit' else 'application_submit' end,case when p_module='leads' then '/assessment' else '/careers' end);
 return p_id;
 end; $$;
revoke all on function public.receive_submission(uuid,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.receive_submission(uuid,text,text,jsonb) to service_role;
-- Media deletion is owner/editor controlled and audited. Metadata is archived;
-- physical storage removal is handled separately by the server.
create function public.archive_media(p_id uuid) returns void language plpgsql security definer set search_path=public as $$begin
 if not public.can('media','update') then raise exception 'Forbidden';end if;
 update records set status='archived',updated_at=now(),updated_by=auth.uid() where id=p_id and module='media';
 insert into audit_logs(actor,action,entity_type,entity_id) values(auth.uid(),'Media archived','media',p_id);
end;$$;
revoke all on function public.archive_media(uuid) from public,anon;
grant execute on function public.archive_media(uuid) to authenticated;
commit;
