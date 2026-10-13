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

## Projeto Supabase informado
- Project ref: `gclrarhluuucohyauyfd`
- Endpoint previsto: `https://gclrarhluuucohyauyfd.supabase.co/functions/v1/cakto-webhook`
- Checkout: `https://pay.cakto.com.br/xcd5zew_1196723`
- SQL adicional: `supabase/migrations/004_cakto_orders.sql` (ainda precisa ser executado).
- Edge Function ainda **não foi publicada**. Não configure webhook ativo nem habilite `VITE_FITPLAN_PAYWALL_ENABLED` antes de validar a função.
- No painel da Cakto, obtenha o ID real da oferta e configure um segredo exclusivo para o webhook. Não coloque segredos no repositório.
- A liberação exige vinculação autenticada do pedido ao usuário; apenas o e-mail do comprador ou um redirecionamento não bastam.


## Modelo confirmado pela tela Cakto (disparo Individual)
O modelo ilustrativo exibido no painel tem:
- `secret` no corpo JSON; `event` = `purchase_approved`, `refund` ou `chargeback`;
- `data.id` é UUID do pedido; `data.offer.id` é identificador da oferta;
- `data.customer.email`, `data.status` (ex.: `paid`), `data.amount` (número);
- `data.offer.price` e `data.baseAmount` podem diferir de `data.amount` por desconto.

**Os dados no exemplo são fictícios.** O ID de oferta e o segredo precisam vir da configuração real do FitPlan, não do modelo ilustrativo. A validação do valor de 49,90 na função exige confirmar a unidade e o efeito de cupons/descontos nos eventos reais.

A função `cakto-webhook` no repositório corresponde à estrutura básica desse modelo, mas **não foi implantada nem testada contra evento real**. Não habilitar o paywall antes de testar compra aprovada, estorno e vinculação da compra ao usuário.
