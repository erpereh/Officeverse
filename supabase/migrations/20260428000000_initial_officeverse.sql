create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.offices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Mi oficina',
  width int not null default 30,
  height int not null default 20,
  base_floor text not null default 'office_floor_01',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists offices_user_id_key on public.offices(user_id);

create table if not exists public.office_objects (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references public.offices(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  object_type text not null,
  asset_key text not null,
  x int not null,
  y int not null,
  rotation int not null default 0,
  layer int not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists office_objects_office_layer_idx
  on public.office_objects(office_id, layer, y, x);

create index if not exists office_objects_user_id_idx
  on public.office_objects(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists offices_set_updated_at on public.offices;
create trigger offices_set_updated_at
before update on public.offices
for each row execute function public.set_updated_at();

drop trigger if exists office_objects_set_updated_at on public.office_objects;
create trigger office_objects_set_updated_at
before update on public.office_objects
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.offices enable row level security;
alter table public.office_objects enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
on public.profiles for delete
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "offices_select_own" on public.offices;
create policy "offices_select_own"
on public.offices for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "offices_insert_own" on public.offices;
create policy "offices_insert_own"
on public.offices for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "offices_update_own" on public.offices;
create policy "offices_update_own"
on public.offices for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "offices_delete_own" on public.offices;
create policy "offices_delete_own"
on public.offices for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "office_objects_select_own" on public.office_objects;
create policy "office_objects_select_own"
on public.office_objects for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "office_objects_insert_own" on public.office_objects;
create policy "office_objects_insert_own"
on public.office_objects for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "office_objects_update_own" on public.office_objects;
create policy "office_objects_update_own"
on public.office_objects for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "office_objects_delete_own" on public.office_objects;
create policy "office_objects_delete_own"
on public.office_objects for delete
to authenticated
using ((select auth.uid()) = user_id);
