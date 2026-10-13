# FitPlan — Cakto e Supabase

## Regra comercial
- Trial integral por 48 horas desde **auth.users.created_at**.
- Acesso vitalício por **R$ 49,90**, pagamento único.
- Dados do usuário permanecem no Supabase após o vencimento.
- Reembolso/chargeback deve revogar o acesso.

## Ativação (não ativar paywall antes da integração)
1. Execute `supabase/migrations/003_fitplan_access.sql` no SQL Editor do Supabase.
2. Cadastre na Cakto o produto **FitPlan — Acesso Vitalício**, oferta única de R$ 49,90 e entrega externa.
3. Copie o link real do checkout para a variável pública `VITE_CAKTO_CHECKOUT_URL` no Lovable.
4. Configure o webhook **somente depois** de criar e validar uma Supabase Edge Function autenticando a origem Cakto, verificando o ID da oferta, vinculando a compra ao usuário autenticado e processando compra, refund e chargeback idempotentemente.
5. Guarde chaves privadas apenas como Supabase Edge Function secrets. Nunca em `VITE_*`.
6. Teste: pagamento real/de teste, repetição de webhook, usuário errado, refund, expiração de 48 horas, compra após expiração e acesso em segundo dispositivo.

## Importante
Esta etapa implementa o banco de permissões e a interface de teste/pagamento. **Não concede acesso por redirecionamento do checkout, por e-mail informado pelo comprador ou por evento não verificado.**
A liberação automática depende da Edge Function e do formato autenticado do webhook Cakto. Até lá, não ative o bloqueio para clientes reais.
