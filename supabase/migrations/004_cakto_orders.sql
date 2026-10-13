-- Eventos validados, associados à compra e reivindicados pelo usuário autenticado.
create table if not exists public.fitplan_cakto_orders (
  purchase_id text primary key,
  customer_email text not null,
  offer_id text not null,
  amount numeric not null,
  status text not null check (status in ('paid', 'refunded', 'chargeback')),
  user_id uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.fitplan_cakto_orders enable row level security;
-- Nenhuma policy pública: somente funções com acesso administrativo.
create or replace function public.fitplan_claim_purchase(p_purchase_id text, p_user_id uuid, p_email text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_order public.fitplan_cakto_orders%rowtype;
begin
  select * into v_order from public.fitplan_cakto_orders where purchase_id = p_purchase_id for update;
  if not found or v_order.status <> 'paid'
     or lower(v_order.customer_email) <> lower(p_email)
     or (v_order.user_id is not null and v_order.user_id <> p_user_id) then
    return false;
  end if;
  update public.fitplan_cakto_orders set user_id = p_user_id where purchase_id = p_purchase_id;
  insert into public.fitplan_access(user_id,trial_started_at,paid_at,purchase_id,revoked_at)
  values (p_user_id,now(),now(),p_purchase_id,null)
  on conflict (user_id) do update set
    paid_at = excluded.paid_at, purchase_id = excluded.purchase_id, revoked_at = null;
  return true;
end; $$;
revoke all on function public.fitplan_claim_purchase(text,uuid,text) from public, anon, authenticated;
grant execute on function public.fitplan_claim_purchase(text,uuid,text) to service_role;
