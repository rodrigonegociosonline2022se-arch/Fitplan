import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type Access = { trial_started_at: string; paid_at: string | null; revoked_at: string | null };
const checkout = import.meta.env.VITE_CAKTO_CHECKOUT_URL as string | undefined;
const HOUR = 60 * 60 * 1000;

export default function AccessGate({ session, children }: { session: Session; children: ReactNode }) {
  const [access, setAccess] = useState<Access | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      if (!supabase) return;
      const { data, error: fetchError } = await supabase.from('fitplan_access')
        .select('trial_started_at,paid_at,revoked_at')
        .eq('user_id', session.user.id).maybeSingle();
      if (!mounted) return;
      setError(fetchError ? 'Não foi possível verificar seu acesso. Tente novamente.' : !data ? 'A configuração de acesso ainda não foi concluída no Supabase.' : '');
      setAccess(data ?? null);
      setLoading(false);
    };
    void refresh();
    const timer = window.setInterval(() => { setNow(Date.now()); void refresh(); }, 30_000);
    const focus = () => { void refresh(); };
    window.addEventListener('focus', focus);
    return () => { mounted = false; window.clearInterval(timer); window.removeEventListener('focus', focus); };
  }, [session.user.id]);

  if (loading) return <div className="auth-loading">Verificando seu período de teste...</div>;
  if (error || !access) return <div className="setup-shell"><div className="setup-card auth-card"><h1>Acesso em configuração</h1><p className="muted">{error || 'Não foi possível verificar seu acesso.'}</p><button className="primary full" onClick={() => window.location.reload()}>Tentar novamente</button></div></div>;
  const paid = Boolean(access.paid_at) && !access.revoked_at;
  const remaining = Math.max(0, Date.parse(access.trial_started_at) + 48 * HOUR - now);
  if (paid) return <>{children}</>;
  if (remaining > 0) return <><div className="trial-banner">Teste completo: {Math.ceil(remaining / HOUR)} horas restantes • Acesso vitalício por R$ 49,90</div>{children}</>;
  return <div className="setup-shell"><div className="setup-card auth-card">
    <div className="setup-eyebrow">SEU PROGRESSO CONTINUA SALVO</div>
    <h1>Seu teste de 48 horas terminou.</h1>
    <p className="muted">Continue com seus treinos, alimentação e evolução. Pague uma única vez e tenha acesso permanente ao FitPlan.</p>
    <h2>R$ 49,90</h2><p className="muted">Pagamento único • Sem mensalidade</p>
    {checkout && /^https:\/\//.test(checkout)
      ? <a className="primary full" style={{display:'flex',justifyContent:'center',padding:14,textDecoration:'none'}} href={checkout} target="_blank" rel="noopener noreferrer">Comprar acesso vitalício</a>
      : <p className="auth-message">Checkout em preparação. Seus dados estão preservados.</p>}
    <p className="auth-secure">Após o pagamento ser confirmado, seu acesso será liberado automaticamente quando a integração estiver ativa.</p>
    <button onClick={() => window.location.reload()}>Já paguei — verificar novamente</button>
  </div></div>;
}
