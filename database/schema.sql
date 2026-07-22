-- ============================================================
-- TutorWise Database Schema (Supabase / PostgreSQL)
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- ---------- profiles ----------
-- One row per authenticated user, linked 1:1 with auth.users.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null,
  class_num int not null check (class_num between 1 and 10),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ---------- test_results ----------
-- One row per completed test. answers/analysis stored as JSONB so the
-- shape can evolve without a migration every time.
create table if not exists public.test_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  class_num int not null,
  subject text not null,
  chapter text,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  score int not null,
  total_questions int not null,
  correct_count int not null,
  wrong_count int not null,
  skipped_count int not null,
  time_taken_seconds int,
  answers jsonb not null,
  analysis jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_test_results_user_id on public.test_results (user_id);
create index if not exists idx_test_results_created_at on public.test_results (created_at desc);

alter table public.test_results enable row level security;

create policy "Users can view their own test results"
  on public.test_results for select
  using (auth.uid() = user_id);

create policy "Users can insert their own test results"
  on public.test_results for insert
  with check (auth.uid() = user_id);

-- ---------- prompt_templates ----------
-- Backs the admin "Manage AI prompt templates" feature. The backend
-- currently reads templates from utils/promptBuilder.js; this table
-- lets an admin override them without a redeploy if wired up later.
create table if not exists public.prompt_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  template text not null,
  updated_by uuid references auth.users (id),
  updated_at timestamptz not null default now()
);

alter table public.prompt_templates enable row level security;

create policy "Only service role can manage prompt templates"
  on public.prompt_templates for all
  using (false);
  -- Backend uses the service-role key, which bypasses RLS entirely,
  -- so this table is effectively admin/backend-only by default.

-- ============================================================
-- Notes:
-- - The backend connects with the SERVICE ROLE key, which bypasses
--   RLS. RLS above protects the database if the ANON key is ever
--   used directly from the frontend (e.g. for Supabase Auth calls).
-- - Run `select * from auth.users;` in the SQL editor to find a
--   user's UUID if you need to manually set ADMIN_EMAILS-equivalent
--   access for testing.
-- ============================================================
