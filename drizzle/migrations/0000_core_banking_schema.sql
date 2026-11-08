create type public.app_role as enum ('admin', 'customer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  username text unique,
  phone text,
  address text,
  account_number text unique,
  status text not null default 'pending_approval',
  email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create sequence if not exists public.account_number_seq start 10000001;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, account_number)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), 'SVT-' || nextval('public.account_number_seq')::text);
  insert into public.user_roles (user_id, role) values (new.id, 'customer');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.guard_profile_update() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    if new.status is distinct from old.status or new.account_number is distinct from old.account_number then
      raise exception 'Only administrators can change account status or account number';
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger guard_profile_update before update on public.profiles for each row execute function public.guard_profile_update();

create or replace function public.bootstrap_first_admin() returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  if exists (select 1 from public.user_roles where role = 'admin') then return false; end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'admin') on conflict do nothing;
  return true;
end $$;
grant execute on function public.bootstrap_first_admin() to authenticated;

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'checking',
  balance numeric(14,2) not null default 0,
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  unique (user_id, type)
);
grant select on public.accounts to authenticated;
grant all on public.accounts to service_role;
alter table public.accounts enable row level security;

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  type text not null,
  description text not null default '',
  amount numeric(14,2) not null,
  fee numeric(14,2) not null default 0,
  currency text not null default 'USD',
  status text not null default 'pending',
  reference text not null unique,
  sender jsonb,
  recipient jsonb,
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_reason text,
  created_at timestamptz not null default now()
);
grant select, insert on public.transactions to authenticated;
grant all on public.transactions to service_role;
alter table public.transactions enable row level security;

create table public.beneficiaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  bank_name text not null default '',
  account_number text not null default '',
  routing_number text not null default '',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.beneficiaries to authenticated;
grant all on public.beneficiaries to service_role;
alter table public.beneficiaries enable row level security;

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  audience text not null default 'customer',
  title text not null,
  body text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, update on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  event text not null,
  description text not null default '',
  reference text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
grant select, insert on public.activity_log to authenticated;
grant all on public.activity_log to service_role;
alter table public.activity_log enable row level security;

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null,
  action text not null,
  target_type text not null default '',
  target_id text not null default '',
  reason text not null default '',
  metadata jsonb,
  created_at timestamptz not null default now()
);
grant select, insert on public.admin_audit_log to authenticated;
grant all on public.admin_audit_log to service_role;
alter table public.admin_audit_log enable row level security;

create table public.support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null default '',
  email text not null default '',
  subject text not null default '',
  message text not null default '',
  status text not null default 'open',
  created_at timestamptz not null default now()
);
grant select, insert on public.support_requests to authenticated;
grant insert on public.support_requests to anon;
grant all on public.support_requests to service_role;
alter table public.support_requests enable row level security;

create table public.website_content (
  key text primary key,
  value jsonb not null default '{}',
  updated_by uuid,
  updated_at timestamptz not null default now()
);
grant select on public.website_content to anon, authenticated;
grant all on public.website_content to service_role;
alter table public.website_content enable row level security;

insert into public.website_content (key, value) values
  ('notice_banner', '{"active": false, "text": ""}'),
  ('contact_info', '{"email": "support@strongholdvaulttrust.com", "phone": "", "address": ""}'),
  ('announcements', '[]');

create policy "profiles_select_own_or_admin" on public.profiles for select to authenticated using (auth.uid() = id or public.has_role(auth.uid(), 'admin'));
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own_or_admin" on public.profiles for update to authenticated using (auth.uid() = id or public.has_role(auth.uid(), 'admin'));

create policy "user_roles_select_own_or_admin" on public.user_roles for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "accounts_select_own_or_admin" on public.accounts for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "transactions_select_own_or_admin" on public.transactions for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "transactions_insert_pending_own" on public.transactions for insert to authenticated with check (auth.uid() = user_id and status = 'pending');

create policy "beneficiaries_all_own" on public.beneficiaries for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "beneficiaries_admin_select" on public.beneficiaries for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "notifications_select" on public.notifications for select to authenticated using (user_id = auth.uid() or (user_id is null and audience = 'customer') or public.has_role(auth.uid(), 'admin'));
create policy "notifications_update_own_read" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "activity_insert_own" on public.activity_log for insert to authenticated with check (user_id = auth.uid());
create policy "activity_select_admin" on public.activity_log for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "audit_insert_admin" on public.admin_audit_log for insert to authenticated with check (public.has_role(auth.uid(), 'admin') and admin_id = auth.uid());
create policy "audit_select_admin" on public.admin_audit_log for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "support_insert_anyone" on public.support_requests for insert to anon, authenticated with check (true);
create policy "support_select_own_or_admin" on public.support_requests for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "content_select_public" on public.website_content for select to anon, authenticated using (true);

alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.activity_log;
alter publication supabase_realtime add table public.transactions;