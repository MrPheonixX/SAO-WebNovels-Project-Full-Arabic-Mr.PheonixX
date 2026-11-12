-- SAO Arabic Reader: tables, row-level security and helper functions.
-- Run ONCE in Supabase: SQL Editor > New query > paste > Run.
-- Every object is prefixed "sao_" so it never mixes with the academy tables.
-- Safe to run again (uses "if not exists" / "create or replace" / "drop policy if exists").

-- ============ admins ============
-- Only you (through the SQL editor) can add admins. The website can never do it.
create table if not exists public.sao_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.sao_admins enable row level security;
revoke all on table public.sao_admins from anon, authenticated;
grant select on table public.sao_admins to authenticated;
drop policy if exists "admins: read own row" on public.sao_admins;
create policy "admins: read own row" on public.sao_admins
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.sao_is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.sao_admins where user_id = auth.uid());
$$;
revoke all on function public.sao_is_admin() from public;
grant execute on function public.sao_is_admin() to authenticated;

-- ============ profiles ============
create table if not exists public.sao_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 40),
  email text,
  status text not null default 'active' check (status in ('active', 'banned')),
  created_at timestamptz not null default now(),
  last_seen timestamptz not null default now()
);
alter table public.sao_profiles enable row level security;
revoke all on table public.sao_profiles from anon, authenticated;
grant select, insert on table public.sao_profiles to authenticated;
-- A user may change only these columns of their own row (never "status").
grant update (display_name, email, last_seen) on table public.sao_profiles to authenticated;

drop policy if exists "profiles: read own or admin" on public.sao_profiles;
create policy "profiles: read own or admin" on public.sao_profiles
  for select to authenticated
  using (auth.uid() = user_id or public.sao_is_admin());

drop policy if exists "profiles: insert own" on public.sao_profiles;
create policy "profiles: insert own" on public.sao_profiles
  for insert to authenticated
  with check (auth.uid() = user_id and status = 'active');

drop policy if exists "profiles: update own" on public.sao_profiles;
create policy "profiles: update own" on public.sao_profiles
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.sao_not_banned()
returns boolean
language sql stable security definer set search_path = public
as $$
  select not exists (
    select 1 from public.sao_profiles where user_id = auth.uid() and status = 'banned'
  );
$$;
revoke all on function public.sao_not_banned() from public;
grant execute on function public.sao_not_banned() to authenticated;

-- Admin-only: ban / unban a user.
create or replace function public.sao_set_user_status(p_user uuid, p_status text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.sao_is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if p_status not in ('active', 'banned') then
    raise exception 'bad status';
  end if;
  update public.sao_profiles set status = p_status where user_id = p_user;
end;
$$;
revoke all on function public.sao_set_user_status(uuid, text) from public;
grant execute on function public.sao_set_user_status(uuid, text) to authenticated;

-- ============ reading history (one row per user) ============
create table if not exists public.sao_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  constraint sao_progress_size check (pg_column_size(data) <= 100000)
);
alter table public.sao_progress enable row level security;
revoke all on table public.sao_progress from anon, authenticated;
grant select, insert, update on table public.sao_progress to authenticated;

drop policy if exists "progress: read own or admin" on public.sao_progress;
create policy "progress: read own or admin" on public.sao_progress
  for select to authenticated
  using (auth.uid() = user_id or public.sao_is_admin());

drop policy if exists "progress: insert own" on public.sao_progress;
create policy "progress: insert own" on public.sao_progress
  for insert to authenticated
  with check (auth.uid() = user_id and public.sao_not_banned());

drop policy if exists "progress: update own" on public.sao_progress;
create policy "progress: update own" on public.sao_progress
  for update to authenticated
  using (auth.uid() = user_id and public.sao_not_banned())
  with check (auth.uid() = user_id and public.sao_not_banned());

-- ============ view counter ============
create table if not exists public.sao_work_views (
  work_id text primary key check (work_id ~ '^[A-Za-z0-9_-]{1,100}$'),
  views bigint not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.sao_work_views enable row level security;
revoke all on table public.sao_work_views from anon, authenticated;
grant select on table public.sao_work_views to authenticated;
drop policy if exists "views: admin read" on public.sao_work_views;
create policy "views: admin read" on public.sao_work_views
  for select to authenticated using (public.sao_is_admin());

-- Anyone (even without an account) can add +1 to a work's counter, nothing else.
create or replace function public.sao_record_view(p_work_id text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if p_work_id is null or p_work_id !~ '^[A-Za-z0-9_-]{1,100}$' then
    return;
  end if;
  insert into public.sao_work_views (work_id, views) values (p_work_id, 1)
  on conflict (work_id)
  do update set views = public.sao_work_views.views + 1, updated_at = now();
end;
$$;
revoke all on function public.sao_record_view(text) from public;
grant execute on function public.sao_record_view(text) to anon, authenticated;

-- ============ work visibility (set by admins) ============
-- No row = published. "draft" = coming soon, "hidden" = not available.
-- Everyone may READ this (the public site needs it); only admins can change it.
create table if not exists public.sao_work_status (
  work_id text primary key check (work_id ~ '^[A-Za-z0-9_-]{1,100}$'),
  status text not null check (status in ('published', 'draft', 'hidden')),
  updated_at timestamptz not null default now()
);
alter table public.sao_work_status enable row level security;
revoke all on table public.sao_work_status from anon, authenticated;
grant select on table public.sao_work_status to anon, authenticated;
drop policy if exists "work status: public read" on public.sao_work_status;
create policy "work status: public read" on public.sao_work_status
  for select to anon, authenticated using (true);

create or replace function public.sao_set_work_status(p_work_id text, p_status text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.sao_is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if p_work_id is null or p_work_id !~ '^[A-Za-z0-9_-]{1,100}$' then
    raise exception 'bad work id';
  end if;
  if p_status not in ('published', 'draft', 'hidden') then
    raise exception 'bad status';
  end if;
  if p_status = 'published' then
    delete from public.sao_work_status where work_id = p_work_id;
  else
    insert into public.sao_work_status (work_id, status) values (p_work_id, p_status)
    on conflict (work_id) do update set status = excluded.status, updated_at = now();
  end if;
end;
$$;
revoke all on function public.sao_set_work_status(text, text) from public;
grant execute on function public.sao_set_work_status(text, text) to authenticated;

-- ============ reviews (stars + comment, one per reader per work) ============
create table if not exists public.sao_reviews (
  id uuid primary key default gen_random_uuid(),
  work_id text not null check (work_id ~ '^[A-Za-z0-9_-]{1,100}$'),
  user_id uuid not null references auth.users (id) on delete cascade,
  author text not null default 'قارئ' check (char_length(author) between 2 and 40),
  stars smallint not null check (stars between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (work_id, user_id)
);
create index if not exists sao_reviews_work_idx on public.sao_reviews (work_id, created_at desc);
alter table public.sao_reviews enable row level security;
revoke all on table public.sao_reviews from anon, authenticated;
grant select on table public.sao_reviews to anon, authenticated;
grant insert (work_id, user_id, stars, comment) on table public.sao_reviews to authenticated;
grant update (stars, comment) on table public.sao_reviews to authenticated;
grant delete on table public.sao_reviews to authenticated;

-- The author name always comes from the reader's profile (it cannot be faked).
create or replace function public.sao_review_before_write()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  select display_name into new.author from public.sao_profiles where user_id = new.user_id;
  if new.author is null then
    new.author := 'قارئ';
  end if;
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists sao_review_before_write on public.sao_reviews;
create trigger sao_review_before_write
  before insert or update on public.sao_reviews
  for each row execute function public.sao_review_before_write();

drop policy if exists "reviews: public read" on public.sao_reviews;
create policy "reviews: public read" on public.sao_reviews
  for select to anon, authenticated using (true);
drop policy if exists "reviews: insert own" on public.sao_reviews;
create policy "reviews: insert own" on public.sao_reviews
  for insert to authenticated
  with check (auth.uid() = user_id and public.sao_not_banned());
drop policy if exists "reviews: update own" on public.sao_reviews;
create policy "reviews: update own" on public.sao_reviews
  for update to authenticated
  using (auth.uid() = user_id and public.sao_not_banned())
  with check (auth.uid() = user_id and public.sao_not_banned());
drop policy if exists "reviews: delete own or admin" on public.sao_reviews;
create policy "reviews: delete own or admin" on public.sao_reviews
  for delete to authenticated
  using (auth.uid() = user_id or public.sao_is_admin());

-- ============ make yourself the first admin ============
-- 1) Create your account on the site (Login > create account).
-- 2) Replace the e-mail below with yours and run just this statement:
--
-- insert into public.sao_admins (user_id)
-- select id from auth.users where email = 'YOUR-EMAIL@example.com'
-- on conflict do nothing;
