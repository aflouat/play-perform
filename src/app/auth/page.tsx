'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

function getClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');
}

type Screen = 'login' | 'signup' | 'forgot' | 'forgot_sent';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [screen, setScreen] = useState<Screen>(() => searchParams.get('signup') === '1' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const db = getClient();
    db.auth.getSession().then(({ data }) => { if (data.session) router.replace('/parent'); });
    const { data: listener } = db.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) router.replace('/parent');
    });
    return () => listener.subscription.unsubscribe();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setInfo(null); setLoading(true);
    const db = getClient();
    try {
      if (screen === 'forgot') {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
        const { error: err } = await db.auth.resetPasswordForEmail(email, {
          redirectTo: `${siteUrl}/auth/reset-password`,
        });
        if (err) { setError(err.message); return; }
        setScreen('forgot_sent');
        return;
      }
      if (screen === 'signup') {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
        const { error: err } = await db.auth.signUp({ email, password, options: { emailRedirectTo: `${siteUrl}/auth/confirm` } });
        if (err) { setError(err.message); return; }
        setInfo('✉️ Vérifiez vos emails pour activer votre compte.');
        return;
      }
      const { error: err } = await db.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); return; }
      router.push('/parent');
    } finally { setLoading(false); }
  }

  const titles: Record<Screen, string> = {
    login: 'Connexion parent', signup: 'Créer un compte', forgot: 'Mot de passe oublié', forgot_sent: 'Email envoyé !',
  };

  if (screen === 'forgot_sent') {
    return (
      <div className="text-center space-y-4 bg-white rounded-2xl shadow-md p-6">
        <div className="text-5xl">✉️</div>
        <h2 className="font-black text-[#1a1a2e]">Vérifiez vos emails</h2>
        <p className="text-slate-500 text-sm">Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.</p>
        <button onClick={() => { setScreen('login'); setError(null); setInfo(null); }}
          className="w-full py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition-colors">
          Retour à la connexion
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-4">
      <h2 className="font-black text-[#1a1a2e] text-center">{titles[screen]}</h2>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-violet-400"
          placeholder="parent@email.com" />
      </div>

      {screen !== 'forgot' && (
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mot de passe</label>
          <div className="relative mt-1">
            <input type={showPwd ? 'text' : 'password'} value={password}
              onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm focus:outline-none focus:border-violet-400"
              placeholder="6 caractères minimum" />
            <button type="button" onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500 transition-colors"
              aria-label={showPwd ? 'Masquer' : 'Afficher'}>
              {showPwd ? '🙈' : '👁️'}
            </button>
          </div>
          {screen === 'login' && (
            <button type="button" onClick={() => { setScreen('forgot'); setError(null); setInfo(null); }}
              className="mt-1.5 text-xs text-violet-500 hover:underline">
              Mot de passe oublié ?
            </button>
          )}
        </div>
      )}

      {error && <p className="text-rose-600 text-sm bg-rose-50 rounded-xl px-3 py-2">{error}</p>}
      {info  && <p className="text-emerald-600 text-sm bg-emerald-50 rounded-xl px-3 py-2">{info}</p>}

      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl bg-violet-600 text-white font-bold disabled:opacity-40 hover:bg-violet-700 transition-colors">
        {loading ? 'Chargement…' : screen === 'login' ? 'Se connecter' : screen === 'signup' ? 'Créer un compte' : 'Envoyer le lien'}
      </button>
    </form>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [screen, setScreen] = useState<Screen>(() => searchParams.get('signup') === '1' ? 'signup' : 'login');

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-slate-50">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-3">👤</div>
          <p className="text-slate-500 text-sm mt-1">Espace parent · SYNTH.EDU</p>
        </div>
        <AuthForm />
        <div className="text-center space-y-2">
          {screen !== 'signup' && (
            <button onClick={() => setScreen('signup')} className="text-sm text-violet-600 font-semibold hover:underline block w-full">
              Pas encore de compte ? S'inscrire
            </button>
          )}
          {screen === 'signup' && (
            <button onClick={() => setScreen('login')} className="text-sm text-violet-600 font-semibold hover:underline block w-full">
              Déjà un compte ? Se connecter
            </button>
          )}
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 block">← Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}
