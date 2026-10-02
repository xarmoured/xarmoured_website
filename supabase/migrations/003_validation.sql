begin;
create function public.validate_record() returns trigger language plpgsql set search_path=public as $$
 declare key text;value text;next_path text;visited text[];
 begin
 if length(new.title) not between 2 and 180 or new.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then raise exception 'Invalid title or slug';end if;
 if new.module='research' and new.status='published' and new.data->>'disclosure' is distinct from 'public' then raise exception 'Disclosure is not public';end if;
 for key,value in select * from jsonb_each_text(new.data) loop
  if key in ('website','portfolio','linkedin','github','twitter','youtube','founder_website','photo','primary_url','secondary_url','og_image','destination','to','url','file','booking_url','site_url') and coalesce(value,'')<>'' then
   if not (value ~ '^https?://[^[:space:]]+$' or (value ~ '^/[^/]' and value !~ '[\\[:space:]]') or value='/') then raise exception 'Unsafe URL';end if;
  end if;
 end loop;
 if new.module='redirects' and new.status='published' then
  next_path=new.data->>'to';visited=array[new.data->>'from'];
  if new.data->>'from' !~ '^/' or new.data->>'code' not in ('301','302') then raise exception 'Invalid redirect';end if;
  for i in 1..100 loop
   if next_path=any(visited) then raise exception 'Redirect loop';end if;
   visited=array_append(visited,next_path);
   select data->>'to' into next_path from records where module='redirects' and status='published' and data->>'from'=next_path and id<>new.id limit 1;
   if next_path is null then exit;end if;
  end loop;
 end if;
 return new;
 end;$$;
alter table records add constraint private_media_visibility check(module<>'media' or data->>'bucket'<>'private-internal' or status<>'published');
create trigger records_validation before insert or update on records for each row execute function validate_record();
grant usage on schema public to anon,authenticated;
revoke all on public.records from anon,authenticated;
grant select on public.records to anon,authenticated;
grant select on public.profiles,public.internal_notes,public.record_activity,public.audit_logs,public.media_files,public.analytics_events,public.communication_logs to authenticated;
grant insert on public.internal_notes,public.audit_logs,public.media_files to authenticated;
grant all on all tables in schema public to service_role;
grant usage,select on all sequences in schema public to service_role;
commit;
