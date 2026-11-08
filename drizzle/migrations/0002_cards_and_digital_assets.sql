create table public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'debit',
  card_number text not null default '',
  expiry_date text not null default '',
  cardholder_name text not null default '',
  daily_spending_limit numeric(14,2) not null default 1000,
  daily_atm_limit numeric(14,2) not null default 500,
  status text not null default 'active',
  created_at timestamptz not null default now()
);
grant select, update on public.cards to authenticated;
grant all on public.cards to service_role;
alter table public.cards enable row level security;

create policy "cards_select_own_or_admin" on public.cards for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "cards_update_own" on public.cards for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.digital_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  symbol text not null,
  name text not null default '',
  balance numeric(24,8) not null default 0,
  fiat_value_usd numeric(14,2) not null default 0,
  custody_address text not null default '',
  status text not null default 'secured',
  last_audit text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, symbol)
);
grant select on public.digital_assets to authenticated;
grant all on public.digital_assets to service_role;
alter table public.digital_assets enable row level security;

create policy "digital_assets_select_own_or_admin" on public.digital_assets for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));