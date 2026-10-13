-- Trial de 48 horas iniciado no cadastro, com controle no servidor.
create table if not exists public.fitplan_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  trial_started_at timestamptz not null default now(),
  paid_at timestamptz,
  purchase_id text unique,
  revoked_at timestamptz
);
alter table public.fitplan_access enable row level security;
drop policy if exists "View own FitPlan access" on public.fitplan_access;
create policy "View own FitPlan access" on public.fitplan_access for select to authenticated
  using ((select auth.uid()) = user_id);
-- Sem INSERT/UPDATE/DELETE para clientes autenticados.
create or replace function public.fitplan_create_access()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.fitplan_access (user_id, trial_started_at)
  values (new.id, new.created_at)
  on conflict (user_id) do nothing;
  return new;
end; $$;
drop trigger if exists fitplan_auth_access on auth.users;
create trigger fitplan_auth_access after insert on auth.users
for each row execute function public.fitplan_create_access();
-- Contas existentes: o prazo é calculado pelo cadastro original, sem reiniciar.
insert into public.fitplan_access (user_id, trial_started_at)
select id, created_at from auth.users on conflict (user_id) do nothing;
create table if not exists public.fitplan_payment_events (
  event_id text primary key,
  purchase_id text not null,
  event_type text not null,
  received_at timestamptz not null default now()
);
alter table public.fitplan_payment_events enable row level security;
-- Apenas service_role pode registrar eventos; nunca expor a chave no frontend.
