begin;
-- Additive content modules. Existing records are retained.
alter table public.records drop constraint records_module_check;
alter table public.records add constraint records_module_check check(module in ('settings','pages','services','faqs','research','team','jobs','applications','leads','media','navigation','announcements','notifications','redirects','seo','reports','resources','case_studies','industries','service_categories'));
create or replace function public.can(p_resource text,p_action text) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from profiles where id=auth.uid() and not disabled and (
 role='owner' or (role='admin' and p_resource<>'accounts') or
 (p_action='read' and p_resource='dashboard') or
 (role='viewer' and p_action='read' and p_resource='analytics') or
 (role='editor' and p_resource in ('resources','case_studies','industries','service_categories','pages','services','research','faqs','team','media','reports','navigation','announcements','seo','activity') and (p_resource<>'activity' or p_action='read')) or
 (role='recruiter' and p_resource in ('jobs','applications','activity','notifications') and (p_resource<>'activity' or p_action='read'))));
$$;
drop policy public_content on public.records;
create policy public_content on public.records for select to anon,authenticated using(deleted_at is null and (
(module in ('pages','faqs','team','media','navigation','announcements','redirects','seo','reports','resources','industries','service_categories') and status='published') or
(module='services' and status='published' and length(trim(coalesce(data->>'summary','')))>0 and length(trim(coalesce(data->>'description','')))>0 and length(trim(coalesce(data->>'testing_areas','')))>0) or
(module='case_studies' and status='published' and data->>'visibility'='public') or
(module='research' and status='published' and data->>'disclosure'='public') or
(module='jobs' and status in ('open','paused','closed'))));
-- NOT VALID preserves legacy published records; new writes must contain useful content.
alter table public.records add constraint services_public_content check(module<>'services' or status<>'published' or (length(trim(coalesce(data->>'summary','')))>0 and length(trim(coalesce(data->>'description','')))>0 and length(trim(coalesce(data->>'testing_areas','')))>0)) not valid;
alter table public.records add constraint case_studies_public_content check(module<>'case_studies' or status<>'published' or (coalesce(data->>'visibility','')='public' and length(trim(coalesce(data->>'scope','')))>0 and length(trim(coalesce(data->>'business_outcome','')))>0)) not valid;
create or replace function public.public_site_settings() returns jsonb language sql stable security definer set search_path=public as $$
 select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) from records,lateral jsonb_each(data)
 where module='settings' and status='published' and deleted_at is null and key in
 ('company','description','legal_name','country','address','phone','sales_email','support_email','careers_email','security_email','security_canonical','security_policy','security_languages','security_expires','disclosure_policy_enabled','linkedin','github','twitter','youtube','founder_website','assessment_enabled','booking_url','sales_cta','lead_source','careers_enabled','general_applications','research_enabled','labs_enabled','sample_report_enabled','announcements_enabled','remote','application_confirmation');
$$;
create view public.resources with (security_invoker=true) as select * from public.records where module='resources';
create view public.case_studies with (security_invoker=true) as select * from public.records where module='case_studies';
create view public.industries with (security_invoker=true) as select * from public.records where module='industries';
create view public.service_categories with (security_invoker=true) as select * from public.records where module='service_categories';
create or replace function public.validate_record() returns trigger language plpgsql set search_path=public as $$
 declare key text;value text;next_path text;visited text[];
 begin
 if length(new.title) not between 2 and 180 or new.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then raise exception 'Invalid title or slug';end if;
 if new.module='research' and new.status='published' and new.data->>'disclosure' is distinct from 'public' then raise exception 'Disclosure is not public';end if;
 for key,value in select * from jsonb_each_text(new.data) loop
  if key in ('website','portfolio','linkedin','github','twitter','youtube','founder_website','photo','primary_url','secondary_url','og_image','destination','to','url','file','booking_url','site_url','advisory_url','github_advisory','download','security_canonical','security_policy') and coalesce(value,'')<>'' then
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
alter table public.analytics_events drop constraint analytics_events_event_check;
alter table public.analytics_events add constraint analytics_events_event_check check(event in ('page_view','service_view','assessment_start','assessment_submit','booking_click','research_view','careers_view','application_submit','job_view','sample_report_view','cta_used'));
commit;
