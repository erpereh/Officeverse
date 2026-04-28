drop index if exists public.offices_user_id_key;

create index if not exists offices_user_id_idx
  on public.offices(user_id);

delete from public.office_objects;
