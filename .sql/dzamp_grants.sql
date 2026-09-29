grant usage on schema public to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.settings to anon, authenticated;
grant all on public.products to service_role;
grant all on public.settings to service_role;
