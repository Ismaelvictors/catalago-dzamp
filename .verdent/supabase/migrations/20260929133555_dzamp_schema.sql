-- DZAMP catalog schema
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  category text not null check (category in ('infantil','jovem_adulto','protecao_uv')),
  images jsonb not null default '[]'::jsonb,
  sizes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.settings enable row level security;

drop policy if exists "public read products" on public.products;
create policy "public read products"
  on public.products for select
  to anon, authenticated
  using (true);

drop policy if exists "public read settings" on public.settings;
create policy "public read settings"
  on public.settings for select
  to anon, authenticated
  using (true);

insert into public.settings (key, value)
values ('whatsapp_number', '5500999999999')
on conflict (key) do nothing;