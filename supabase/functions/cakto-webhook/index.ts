import { createClient } from 'npm:@supabase/supabase-js@2';

const reply = (body: object, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method !== 'POST') return reply({ error: 'method_not_allowed' }, 405);
  const secret = Deno.env.get('CAKTO_WEBHOOK_SECRET');
  const offerId = Deno.env.get('CAKTO_OFFER_ID');
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!secret || !offerId || !url || !key) return reply({ error: 'not_configured' }, 503);
  const raw = await req.text();
  if (raw.length > 65536) return reply({ error: 'too_large' }, 413);
  let payload: Record<string, unknown>;
  try { payload = JSON.parse(raw); } catch { return reply({ error: 'bad_json' }, 400); }
  // Match the secret exactly; the payload format must be checked against a real Cakto test event.
  if (payload.secret !== secret) return reply({ error: 'unauthorized' }, 401);
  const event = payload.event;
  if (!['purchase_approved', 'refund', 'chargeback'].includes(String(event))) return reply({ ignored: true });
  const data = payload.data as Record<string, unknown> | undefined;
  const offer = data?.offer as Record<string, unknown> | undefined;
  const customer = data?.customer as Record<string, unknown> | undefined;
  const purchaseId = data?.id;
  const amount = data?.amount;
  if (typeof purchaseId !== 'string' || !purchaseId || offer?.id !== offerId ||
      typeof customer?.email !== 'string' || typeof amount !== 'number')
    return reply({ error: 'unrecognized_payload' }, 422);
  if (event === 'purchase_approved' && (data?.status !== 'paid' || Math.abs(amount - 49.9) > 0.01))
    return reply({ error: 'payment_not_verified' }, 422);
  const admin = createClient(url, key, { auth: { persistSession: false } });
  const status = event === 'purchase_approved' ? 'paid' : event === 'refund' ? 'refunded' : 'chargeback';
  const { data: prior, error: readError } = await admin.from('fitplan_cakto_orders')
    .select('status,user_id').eq('purchase_id', purchaseId).maybeSingle();
  if (readError) return reply({ error: 'read_failed' }, 500);
  if (prior?.status !== 'paid' && prior?.status && status === 'paid') return reply({ ok: true, ignored: true });
  const { error } = await admin.from('fitplan_cakto_orders').upsert({
    purchase_id: purchaseId, customer_email: customer.email.toLowerCase(),
    offer_id: offerId, amount, status, user_id: prior?.user_id ?? null,
  }, { onConflict: 'purchase_id' });
  if (error) return reply({ error: 'save_failed' }, 500);
  if (status !== 'paid' && prior?.user_id) {
    const { error: revokeError } = await admin.from('fitplan_access')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', prior.user_id).eq('purchase_id', purchaseId);
    if (revokeError) return reply({ error: 'revoke_failed' }, 500);
  }
  return reply({ ok: true });
});
