import { createClient } from 'npm:@supabase/supabase-js@2';
const reply = (body: object, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
Deno.serve(async (req) => {
  if (req.method !== 'POST') return reply({ error: 'method_not_allowed' }, 405);
  const bearer = req.headers.get('authorization') ?? '';
  if (!bearer.startsWith('Bearer ')) return reply({ error: 'unauthorized' }, 401);
  const url = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  const adminKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !anon || !adminKey) return reply({ error: 'not_configured' }, 503);
  const client = createClient(url, anon, { auth: { persistSession: false } });
  const { data: { user }, error } = await client.auth.getUser(bearer.slice(7));
  if (error || !user?.email || !user.email_confirmed_at) return reply({ error: 'verified_account_required' }, 401);
  const payload = await req.json().catch(() => null);
  const purchaseId = payload?.purchase_id;
  if (typeof purchaseId !== 'string' || !/^[a-zA-Z0-9_-]{5,100}$/.test(purchaseId))
    return reply({ error: 'invalid_purchase_id' }, 400);
  const admin = createClient(url, adminKey, { auth: { persistSession: false } });
  const { data, error: claimError } = await admin.rpc('fitplan_claim_purchase', {
    p_purchase_id: purchaseId, p_user_id: user.id, p_email: user.email,
  });
  if (claimError) return reply({ error: 'claim_failed' }, 500);
  return reply({ claimed: data === true }, data ? 200 : 404);
});
