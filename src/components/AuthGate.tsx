import { useEffect, useState } from 'react';
import { Dumbbell, LogIn, UserPlus, LogOut, LoaderCircle, Cloud, ShieldCheck } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import App from '../App';
import { cloudEnabled, supabase } from '../lib/supabase';
import { exportUserData, importUserData, setActiveUserId } from '../lib/storage';

export default function AuthGate() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!cloudEnabled);
  const [mode, setMode] = useState<'login'|'register'|'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let active = true;
    async function bootstrap(next: Session | null) {
      setReady(false);
      setSession(next);
      setActiveUserId(next?.user.id ?? null);
      if (next) {
        const { data, error } = await client.from('user_app_state').select('data').eq('user_id', next.user.id).maybeSingle();
        if (error) setMessage('Não foi possível carregar seus dados na nuvem. Confira a configuração do banco.');
        else if (data?.data && typeof data.data === 'object') importUserData(data.data as Record<string, unknown>);
      }
      if (active) setReady(true);
    }
    client.auth.getSession().then(({data}) => { if (active) void bootstrap(data.session); });
    const {data:{subscription}} = client.auth.onAuthStateChange((_event, next) => {
      // Supabase callbacks should not await queries inside the callback.
      setTimeout(() => { if (active) void bootstrap(next); }, 0);
    });
    return () => { active = false; subscription.unsubscribe(); setActiveUserId(null); };
  }, []);

  useEffect(() => {
    if (!supabase || !session || !ready) return;
    const client = supabase;
    const userId = session.user.id;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const sync = () => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const {error} = await client.from('user_app_state').upsert({
          user_id: userId, data: exportUserData(), updated_at: new Date().toISOString()
        }, {onConflict:'user_id'});
        if (error) console.error('Erro ao sincronizar FitPlan:', error.message);
      }, 1200);
    };
    window.addEventListener('fitplan:storage-changed', sync);
    return () => { window.removeEventListener('fitplan:storage-changed', sync); clearTimeout(timeout); };
  }, [session?.user.id, ready]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setMessage('');
    try {
      if (mode === 'reset') {
        const {error} = await supabase.auth.resetPasswordForEmail(email, {redirectTo: window.location.origin});
        if (error) throw error;
        setMessage('Se o e-mail estiver cadastrado, você receberá instruções de recuperação.');
      } else if (mode === 'register') {
        if (password.length < 8) { setMessage('Use uma senha com pelo menos 8 caracteres.'); return; }
        const {data,error} = await supabase.auth.signUp({email,password});
        if (error) throw error;
        setMessage(data.session ? 'Conta criada!' : 'Confira seu e-mail para confirmar o cadastro.');
      } else {
        const {error} = await supabase.auth.signInWithPassword({email,password});
        if (error) throw error;
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível concluir a operação.'); }
    finally { setBusy(false); }
  }
  if (!cloudEnabled) return <App />;
  if (!ready) return <div className="auth-loading"><LoaderCircle className="spin" size={28}/><span>Preparando seu FitPlan...</span></div>;
  if (session) return <><div className="account-toolbar"><span><Cloud size={14}/> Conta: {session.user.email}</span><button onClick={async()=>{setReady(false);await supabase?.auth.signOut();setSession(null);setActiveUserId(null);setReady(true)}}><LogOut size={14}/> Sair</button></div><App key={session.user.id}/></>;
  return <div className="setup-shell"><div className="setup-card auth-card"><div className="brand"><span className="brand-mark"><Dumbbell size={23}/></span><span>fit<span className="brand-lime">plan</span></span></div><div className="setup-eyebrow">SUA EVOLUÇÃO COMEÇA AQUI</div><h1>{mode==='login'?'Bem-vindo de volta.':mode==='register'?'Crie sua conta.':'Recupere seu acesso.'}</h1><p className="muted">Entre para manter seus treinos e sua evolução vinculados à sua conta.</p><form className="setup-fields" onSubmit={submit}><label>E-mail<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@email.com"/></label>{mode!=='reset'&&<label>Senha<input type="password" minLength={mode==='register'?8:1} required autoComplete={mode==='register'?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Sua senha"/></label>}<button className="primary full" disabled={busy} type="submit">{busy?<LoaderCircle size={17} className="spin"/>:mode==='login'?<LogIn size={17}/>:<UserPlus size={17}/>} {mode==='login'?'Entrar':mode==='register'?'Criar conta':'Enviar recuperação'}</button></form>{message&&<p className="auth-message" role="status">{message}</p>}<div className="auth-switch">{mode!=='login'&&<button onClick={()=>{setMode('login');setMessage('')}}>Já tenho conta</button>}{mode!=='register'&&<button onClick={()=>{setMode('register');setMessage('')}}>Criar conta</button>}{mode!=='reset'&&<button onClick={()=>{setMode('reset');setMessage('')}}>Esqueci minha senha</button>}</div><p className="auth-secure"><ShieldCheck size={15}/> Sua senha é gerenciada pelo Supabase Auth, não pelo FitPlan.</p></div></div>;
}
