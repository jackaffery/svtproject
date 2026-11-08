create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, address, account_number)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    nullif(new.raw_user_meta_data->>'phone',''),
    nullif(new.raw_user_meta_data->>'address',''),
    'SVT-' || nextval('public.account_number_seq')::text
  );
  insert into public.user_roles (user_id, role) values (new.id, 'customer');
  return new;
end $$;

create or replace function public.mark_email_verified() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    update public.profiles set email_verified = true where id = new.id;
  end if;
  return new;
end $$;
create trigger on_auth_user_confirmed after update on auth.users for each row execute function public.mark_email_verified();