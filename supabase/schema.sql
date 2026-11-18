-- Вішліст до святого Миколая: схема бази даних.
-- Виконай цей файл один раз у Supabase → SQL Editor → New query → Run.

-- Подарунки -----------------------------------------------------------------
create table if not exists public.gifts (
  id         text primary key,
  title      text not null,
  subtitle   text not null default '',
  specs      text[] not null default '{}',
  price_uah  integer,
  image_url  text not null default '',
  shop_url   text not null,
  shop_name  text not null,
  sort       integer not null default 0
);

-- Профілі: лише ім'я, яке бачать усі. Пошта лишається в auth.users і публічно не показується.
create table if not exists public.profiles (
  id   uuid primary key references auth.users (id) on delete cascade,
  name text not null
);

-- Бронювання: один подарунок може забронювати лише одна людина (gift_id — первинний ключ).
create table if not exists public.reservations (
  gift_id    text primary key references public.gifts (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Профіль створюється автоматично під час реєстрації, ім'я береться з форми.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Доступ (Row Level Security) ----------------------------------------------
alter table public.gifts        enable row level security;
alter table public.profiles     enable row level security;
alter table public.reservations enable row level security;

drop policy if exists "gifts are public" on public.gifts;
create policy "gifts are public" on public.gifts
  for select using (true);

drop policy if exists "names are public" on public.profiles;
create policy "names are public" on public.profiles
  for select using (true);

drop policy if exists "users rename themselves" on public.profiles;
create policy "users rename themselves" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "reservations are public" on public.reservations;
create policy "reservations are public" on public.reservations
  for select using (true);

drop policy if exists "users reserve for themselves" on public.reservations;
create policy "users reserve for themselves" on public.reservations
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "users cancel their own reservation" on public.reservations;
create policy "users cancel their own reservation" on public.reservations
  for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select on public.gifts, public.profiles, public.reservations to anon, authenticated;
grant update (name) on public.profiles to authenticated;
grant insert, delete on public.reservations to authenticated;

-- Перші подарунки -----------------------------------------------------------
insert into public.gifts (id, title, subtitle, specs, price_uah, image_url, shop_url, shop_name, sort) values
  ('philips-evnia',
   'Philips Evnia 24M2N3201A', 'Ігровий монітор',
   array['23.8" IPS, Full HD', '180 Гц, 1 мс', 'HDR10, білий корпус'],
   6400, '/gifts/philips-evnia.jpg',
   'https://ek.ua/ua/PHILIPS-EVNIA-24M2N3201A.htm', 'e-katalog', 1),
  ('gig-crazy-cats',
   'GIG Dynamic Long', 'Набір трусів «Crazy Cats»',
   array['Лімітований принт, чорні', 'Подовжений крій боксерів', '95% бавовна, 5% еластан'],
   1375, '/gifts/gig-crazy-cats.webp',
   'https://gigmilitary.com/product/limitovanij-nabir-trusiv-dynamic-long-crazy-cats-chornij', 'GIG', 2),
  ('jordan-element-duffle',
   'Jordan Element Duffle', 'Сумка в подорож',
   array['60 × 38 × 19,5 см, поліестер', '4 зовнішні кишені + 1 внутрішня', 'Чорна, з 3D-логотипом Jordan'],
   2999, '/gifts/jordan-element-duffle.webp',
   'https://www.footshop.ua/uk/duffle-bag/498823-jordan-element-duffle-black.html', 'Footshop', 3)
on conflict (id) do update set
  title = excluded.title, subtitle = excluded.subtitle, specs = excluded.specs,
  price_uah = excluded.price_uah, image_url = excluded.image_url,
  shop_url = excluded.shop_url, shop_name = excluded.shop_name, sort = excluded.sort;
