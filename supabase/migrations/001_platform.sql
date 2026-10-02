begin;
create extension if not exists pgcrypto;
create type public.admin_role as enum ('owner','admin','editor','recruiter','viewer');
create table public.profiles(id uuid primary key references auth.users(id) on delete cascade,name text not null,role public.admin_role not null default 'viewer',disabled boolean not null default false,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create function public.can(p_resource text,p_action text) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from profiles where id=auth.uid() and not disabled and (
 role='owner' or (role='admin' and p_resource<>'accounts') or
 (role='viewer' and p_action='read') or
 (role='editor' and p_resource in ('pages','services','research','faqs','team','media','reports','navigation','announcements','seo','activity') and (p_resource<>'activity' or p_action='read')) or
 (role='recruiter' and p_resource in ('jobs','applications','activity','notifications') and (p_resource<>'activity' or p_action='read'))));
$$;
create table public.records(
 id uuid primary key default gen_random_uuid(),module text not null check(module in ('settings','pages','services','faqs','research','team','jobs','applications','leads','media','navigation','announcements','notifications','redirects','seo','reports')),
 title text not null,slug text not null,status text not null default 'draft',data jsonb not null default '{}',
 published_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),created_by uuid references profiles(id),updated_by uuid references profiles(id),deleted_at timestamptz,
 unique(module,slug),check(module<>'research' or status<>'published' or data->>'disclosure'='public')
);
create index records_module_status on records(module,status,created_at desc) where deleted_at is null;
create index records_data on records using gin(data);
create table public.internal_notes(id uuid primary key default gen_random_uuid(),record_id uuid not null references records(id),body text not null check(length(body) between 1 and 5000),created_by uuid not null references profiles(id),created_at timestamptz not null default now());
create table public.record_activity(id uuid primary key default gen_random_uuid(),record_id uuid not null references records(id),actor uuid references profiles(id),action text not null,metadata jsonb default '{}',created_at timestamptz not null default now());
create table public.audit_logs(id uuid primary key default gen_random_uuid(),actor uuid references profiles(id),action text not null,entity_type text not null,entity_id uuid,metadata jsonb default '{}',created_at timestamptz not null default now());
create index audit_created on audit_logs(created_at desc);
create index record_activity_record on record_activity(record_id,created_at desc);
create table public.media_files(id uuid primary key default gen_random_uuid(),record_id uuid references records(id),bucket text not null,path text not null,mime_type text not null,size bigint not null,created_by uuid references profiles(id),created_at timestamptz default now());
create table public.analytics_events(id bigint generated always as identity primary key,event text not null check(event in ('page_view','service_view','assessment_start','assessment_submit','booking_click','research_view','careers_view','application_submit')),path text not null,source text,created_at timestamptz not null default now());
create index analytics_date on analytics_events(created_at,event);
create table public.communication_logs(id uuid primary key default gen_random_uuid(),entity_id uuid references records(id),recipient text not null,subject text not null,status text not null,created_at timestamptz default now());
create table public.rate_limits(key text primary key,attempts int not null default 1,window_start timestamptz not null default now());
create function public.check_rate_limit(bucket_key text,max_attempts int) returns boolean language plpgsql security definer set search_path=public as $$
 declare n int;
 begin
 insert into rate_limits(key) values(bucket_key) on conflict(key) do update set attempts=case when rate_limits.window_start<now()-interval '10 minutes' then 1 else rate_limits.attempts+1 end,window_start=case when rate_limits.window_start<now()-interval '10 minutes' then now() else rate_limits.window_start end returning attempts into n;
 return n<=max_attempts;
 end; $$;
revoke all on function public.check_rate_limit(text,int) from public,anon,authenticated;
grant execute on function public.check_rate_limit(text,int) to service_role;
create function public.save_record(p_id uuid,p_module text,p_title text,p_slug text,p_status text,p_data jsonb,p_expected_updated_at timestamptz default null) returns uuid language plpgsql security definer set search_path=public as $$
 declare old_record records; final_data jsonb;
 begin
 if not public.can(p_module,'update') then raise exception 'Forbidden'; end if;
 if p_status in ('published','open') and not public.can(p_module,'publish') then raise exception 'Forbidden'; end if;
 if p_module='research' and p_status='published' and p_data->>'disclosure' is distinct from 'public' then raise exception 'Disclosure is not public'; end if;
 if p_module='jobs' and p_status not in ('draft','open','paused','closed','archived') then raise exception 'Invalid job status'; end if;
 select * into old_record from records where id=p_id for update;
 if old_record.id is not null and old_record.module<>p_module then raise exception 'Module mismatch'; end if;
 if old_record.id is not null and (p_expected_updated_at is null or old_record.updated_at<>p_expected_updated_at) then raise exception 'Edit conflict'; end if;
 final_data=p_data;
 if p_module in ('leads','applications') and old_record.id is not null then final_data=final_data || jsonb_build_object('reference',old_record.data->'reference','resume_path',old_record.data->'resume_path','job_id',old_record.data->'job_id'); end if;
 insert into records(id,module,title,slug,status,data,created_by,updated_by,published_at) values(p_id,p_module,p_title,p_slug,p_status,final_data,auth.uid(),auth.uid(),case when p_status in ('published','open') then now() else null end)
 on conflict(id) do update set title=excluded.title,slug=excluded.slug,status=excluded.status,data=excluded.data,updated_by=auth.uid(),updated_at=now(),published_at=case when excluded.status in ('published','open') then coalesce(records.published_at,now()) else null end;
 insert into audit_logs(actor,action,entity_type,entity_id,metadata) values(auth.uid(),case when old_record.id is null then 'Created' when old_record.status<>p_status then 'Status changed' else 'Updated' end,p_module,p_id,jsonb_build_object('from',old_record.status,'to',p_status,'title',p_title,'actor_name',(select name from profiles where id=auth.uid())));
 insert into record_activity(record_id,actor,action,metadata) values(p_id,auth.uid(),case when old_record.status is distinct from p_status then 'Status changed' else 'Record updated' end,jsonb_build_object('from',old_record.status,'to',p_status));
 return p_id;
 end; $$;
revoke all on function public.save_record(uuid,text,text,text,text,jsonb,timestamptz) from public,anon;
grant execute on function public.save_record(uuid,text,text,text,text,jsonb,timestamptz) to authenticated;
create function public.note_activity() returns trigger language plpgsql security definer set search_path=public as $$begin insert into record_activity(record_id,actor,action) values(new.record_id,new.created_by,'Internal note added');insert into audit_logs(actor,action,entity_type,entity_id) select new.created_by,'Internal note added',module,new.record_id from records where id=new.record_id;return new;end;$$;
create trigger note_added after insert on internal_notes for each row execute function note_activity();
alter table profiles enable row level security;
create policy own_profile on profiles for select to authenticated using(id=auth.uid() or public.can('accounts','read'));
alter table records enable row level security;
create policy public_content on records for select to anon,authenticated using(deleted_at is null and ((module in ('settings','pages','services','faqs','team','media','navigation','announcements','redirects','seo','reports') and status='published') or (module='research' and status='published' and data->>'disclosure'='public') or (module='jobs' and status in ('open','paused','closed'))));
create policy admin_content on records for select to authenticated using(public.can(module,'read'));
-- Mutations exclusively use save_record, which enforces permissions and writes audit events atomically.
alter table internal_notes enable row level security;
create policy notes_read on internal_notes for select to authenticated using(exists(select 1 from records where id=record_id and public.can(module,'read')));
create policy notes_write on internal_notes for insert to authenticated with check(created_by=auth.uid() and exists(select 1 from records where id=record_id and module in ('leads','applications') and public.can(module,'update')));
alter table record_activity enable row level security;
create policy activity_read on record_activity for select to authenticated using(exists(select 1 from records where id=record_id and public.can(module,'read')));
alter table audit_logs enable row level security;
create policy audit_read on audit_logs for select to authenticated using(public.can('activity','read'));
create policy audit_login on audit_logs for insert to authenticated with check(actor=auth.uid() and action in ('User logged in','Password updated','Lead viewed','Application viewed') and public.can('activity','read'));
alter table media_files enable row level security;
create policy files_read on media_files for select to authenticated using(public.can('media','read'));
create policy files_insert on media_files for insert to authenticated with check(created_by=auth.uid() and public.can('media','update'));
alter table analytics_events enable row level security;
create policy analytics_read on analytics_events for select to authenticated using(public.can('analytics','read'));
alter table communication_logs enable row level security;
create policy email_read on communication_logs for select to authenticated using(exists(select 1 from records where id=entity_id and public.can(module,'read')));
alter table rate_limits enable row level security;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('public-assets','public-assets',true,10485760,array['image/jpeg','image/png','image/webp','image/avif','application/pdf']),
 ('private-applications','private-applications',false,5242880,array['application/pdf']),
 ('private-internal','private-internal',false,10485760,array['application/pdf','image/jpeg','image/png','image/webp']);
create policy asset_read on storage.objects for select using(bucket_id='public-assets');
create policy admin_asset_read on storage.objects for select to authenticated using((bucket_id='private-applications' and public.can('applications','read')) or (bucket_id in ('public-assets','private-internal') and public.can('media','read')));
create policy admin_asset_upload on storage.objects for insert to authenticated with check(bucket_id in ('public-assets','private-internal') and public.can('media','update'));
create policy admin_asset_delete on storage.objects for delete to authenticated using(bucket_id in ('public-assets','private-internal') and public.can('media','update'));
-- Stable SQL views expose domain boundaries while content fields remain versionable JSON.
create view jobs with (security_invoker=true) as select * from records where module='jobs';
create view job_applications with (security_invoker=true) as select * from records where module='applications';
create view leads with (security_invoker=true) as select * from records where module='leads';
create view research with (security_invoker=true) as select * from records where module='research';
create view services with (security_invoker=true) as select * from records where module='services';
create view pages with (security_invoker=true) as select * from records where module='pages';
create view faqs with (security_invoker=true) as select * from records where module='faqs';
create view team_members with (security_invoker=true) as select * from records where module='team';
create view site_settings with (security_invoker=true) as select * from records where module='settings';
create view navigation_items with (security_invoker=true) as select * from records where module='navigation';
create view announcements with (security_invoker=true) as select * from records where module='announcements';
create view notifications with (security_invoker=true) as select * from records where module='notifications';
create view redirects with (security_invoker=true) as select * from records where module='redirects';
commit;
