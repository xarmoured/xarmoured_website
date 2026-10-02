begin;
create function public.reorder_records(p_module text,p_items jsonb) returns void language plpgsql security definer set search_path=public as $$
declare item jsonb; r records; position integer:=0;
begin
 if p_module not in ('services','faqs','team','navigation') or not public.can(p_module,'update') then raise exception 'Forbidden';end if;
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)>1000 then raise exception 'Invalid ordering';end if;
 if (select count(distinct value->>'id') from jsonb_array_elements(p_items))<>jsonb_array_length(p_items) then raise exception 'Duplicate records';end if;
 perform id from records where module=p_module and id in(select (value->>'id')::uuid from jsonb_array_elements(p_items)) order by id for update;
 for item in select value from jsonb_array_elements(p_items) loop
  select * into r from records where id=(item->>'id')::uuid and module=p_module and deleted_at is null;
  if not found or item->>'updated_at' is null then raise exception 'Record unavailable';end if;
  perform public.save_record(r.id,r.module,r.title,r.slug,r.status,r.data||jsonb_build_object('order',position),(item->>'updated_at')::timestamptz);
  position:=position+1;
 end loop;
end;$$;
revoke all on function public.reorder_records(text,jsonb) from public,anon;
grant execute on function public.reorder_records(text,jsonb) to authenticated;
commit;
