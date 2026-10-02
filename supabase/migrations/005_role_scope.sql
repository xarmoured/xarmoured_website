begin;
create or replace function public.can(p_resource text,p_action text) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from profiles where id=auth.uid() and not disabled and (
 role='owner' or (role='admin' and p_resource<>'accounts') or
 (p_action='read' and p_resource='dashboard') or
 (role='viewer' and p_action='read' and p_resource='analytics') or
 (role='editor' and p_resource in ('pages','services','research','faqs','team','media','reports','navigation','announcements','seo','activity') and (p_resource<>'activity' or p_action='read')) or
 (role='recruiter' and p_resource in ('jobs','applications','activity','notifications') and (p_resource<>'activity' or p_action='read'))));
$$;
drop policy admin_content on records;
create policy admin_content on records for select to authenticated using(public.can(module,'read') and (module<>'notifications' or exists(select 1 from profiles where id=auth.uid() and role in ('owner','admin')) or (data->>'destination' like '/admin/applications/%' and public.can('applications','read')) or (data->>'destination' like '/admin/leads/%' and public.can('leads','read'))));
drop policy audit_read on audit_logs;
create policy audit_read on audit_logs for select to authenticated using(public.can('activity','read') and (public.can(entity_type,'read') or actor=auth.uid()));
drop policy audit_login on audit_logs;
create policy audit_login on audit_logs for insert to authenticated with check(actor=auth.uid() and action in ('User logged in','Password updated','Lead viewed','Application viewed') and public.can('dashboard','read'));
create function public.dashboard_counts() returns jsonb language plpgsql stable security definer set search_path=public as $$begin
 if not public.can('dashboard','read') then raise exception 'Forbidden';end if;
 return (select jsonb_build_object(
 'leads',count(*) filter(where module='leads'),
 'new_leads',count(*) filter(where module='leads' and status='new'),
 'applications',count(*) filter(where module='applications'),
 'unread_applications',count(*) filter(where module='applications' and data->>'unread'='true'),
 'open_jobs',count(*) filter(where module='jobs' and status='open'),
 'drafts',count(*) filter(where module in ('jobs','research','pages') and status='draft'))
 from records where deleted_at is null);
end;$$;
revoke all on function public.dashboard_counts() from public,anon;
grant execute on function public.dashboard_counts() to authenticated;
commit;
