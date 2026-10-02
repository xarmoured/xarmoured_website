begin;
drop policy public_content on records;
create policy public_content on records for select to anon,authenticated using(deleted_at is null and ((module in ('pages','services','faqs','team','media','navigation','announcements','redirects','seo','reports') and status='published') or (module='research' and status='published' and data->>'disclosure'='public') or (module='jobs' and status in ('open','paused','closed'))));
-- Settings may contain internal email templates. Only explicitly public company
-- fields are exposed to the marketing site, including when accessed through REST.
create function public.public_site_settings() returns jsonb language sql stable security definer set search_path=public as $$
 select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) from records,lateral jsonb_each(data)
 where module='settings' and status='published' and deleted_at is null and key in
 ('company','description','legal_name','country','address','phone','sales_email','support_email','careers_email','security_email','linkedin','github','twitter','youtube','founder_website','assessment_enabled','booking_url','sales_cta','lead_source','careers_enabled','general_applications','research_enabled','labs_enabled','sample_report_enabled','announcements_enabled','remote','application_confirmation');
$$;
revoke all on function public.public_site_settings() from public;
grant execute on function public.public_site_settings() to anon,authenticated;
commit;
