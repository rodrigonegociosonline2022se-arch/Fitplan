-- FitPlan database foundation for Supabase.
-- Apply only after creating a Supabase project and reviewing these policies.
-- App frontend currently uses localStorage; cloud sync/auth are not wired yet.
create extension if not exists pgcrypto;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default 'Atleta',
 goal text not null default 'Ganhar massa muscular' check (goal in ('Emagrecer','Ganhar massa muscular','Definir o corpo')),
 experience text not null default 'Iniciante' check (experience in ('Iniciante','Intermediário','Avançado')),
 training_place text not null default 'Academia completa',
 days_per_week int not null default 3 check (days_per_week between 3 and 6),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.workout_logs (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 workout_date date not null default current_date, workout_name text not null,
 duration_minutes int not null default 0 check (duration_minutes >= 0),
 completed_exercises int not null default 0 check (completed_exercises >= 0),
 completed_sets int not null default 0 check (completed_sets >= 0), created_at timestamptz not null default now()
);
create table if not exists public.progress_entries (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 recorded_at timestamptz not null default now(), weight_kg numeric(6,2) check (weight_kg is null or weight_kg > 0),
 waist_cm numeric(6,2) check (waist_cm is null or waist_cm > 0), note text, created_at timestamptz not null default now()
);
create table if not exists public.music_links (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 title text not null, url text not null check (url ~ '^https?://'), category text not null default 'Outros',
 created_at timestamptz not null default now()
);
create table if not exists public.water_logs (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 logged_on date not null default current_date, amount_ml int not null check (amount_ml > 0 and amount_ml <= 10000),
 created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.workout_logs enable row level security;
alter table public.progress_entries enable row level security;
alter table public.music_links enable row level security;
alter table public.water_logs enable row level security;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users manage own workout logs" on public.workout_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own progress entries" on public.progress_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own music links" on public.music_links for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own water logs" on public.water_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'Atleta'));
 return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Private per-user application snapshot. The client syncs profile, workout, music,
-- hydration and progress data as one JSON object.
create table if not exists public.user_app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.user_app_state enable row level security;
create policy "Users can read own app state" on public.user_app_state
  for select using (auth.uid() = user_id);
create policy "Users can insert own app state" on public.user_app_state
  for insert with check (auth.uid() = user_id);
create policy "Users can update own app state" on public.user_app_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
