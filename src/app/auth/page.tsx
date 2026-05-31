'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

function getClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');
}

type Screen = 'login' | 'signup' | 'forgot' | 'forgot_sent';

// Tout useSearchParams est ici — ce composant est wrappé dans <Suspense>
function AuthContent() {
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
    db.auth.getSession().then(({ data }) => { if (data.session) router.replace('/'); });
    const { data: sub } = db.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) router.replace('/');
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setInfo(null); setLoading(true);
    const db = getClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    try {
      if (screen === 'forgot') {
        const { error: err } = await db.auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl}/auth/reset-password` });
        if (err) { setError(err.message); return; }
        setScreen('forgot_sent'); return;
      }
      if (screen === 'signup') {
        const { error: err } = await db.auth.signUp({ email, password, options: { emailRedirectTo: `${siteUrl}/auth/confirm` } });
        if (err) { setError(err.message); return; }
        setInfo('✉️ Vérifiez vos emails pour activer votre compte.'); return;
      }
      const { error: err } = await db.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); return; }
      router.push('/');
    } finally { setLoading(false); }
  }

  if (screen === 'forgot_sent') {
    return (
      <div className="text-center space-y-4 bg-white rounded-2xl shadow-md p-6">
        <div className="text-5xl">✉️</div>
        <h2 className="font-black text-[#1a1a2e]">Vérifiez vos emails</h2>
        <p className="text-slate-500 text-sm">Lien envoyé à <strong>{email}</strong>.</p>
        <button onClick={() => { setScreen('login'); setError(null); }}
          className="w-full py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition-colors">
          Retour à la connexion
        </button>
      </div>
    );
  }

  const screenLabel: Record<Screen, string> = {
    login: 'Connexion parent', signup: 'Créer un compte', forgot: 'Mot de passe oublié', forgot_sent: '',
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-4">
        <h2 className="font-black text-[#1a1a2e] text-center">{screenLabel[screen]}</h2>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500"
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

      <div className="text-center space-y-2">
        {screen !== 'signup'
          ? <button onClick={() => { setScreen('signup'); setError(null); setInfo(null); }} className="text-sm text-violet-600 font-semibold hover:underline block w-full">Pas encore de compte ? S&apos;inscrire</button>
          : <button onClick={() => { setScreen('login');  setError(null); setInfo(null); }} className="text-sm text-violet-600 font-semibold hover:underline block w-full">Déjà un compte ? Se connecter</button>
        }
        {screen === 'forgot' && (
          <button onClick={() => { setScreen('login'); setError(null); }} className="text-sm text-slate-400 hover:underline block w-full">← Retour</button>
        )}
        <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 block">← Retour à l&apos;accueil</Link>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-slate-50">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-3">👤</div>
          <p className="text-slate-500 text-sm mt-1">Espace parent ·  Play Perform</p>
        </div>
        <Suspense fallback={<div className="text-slate-400 text-sm text-center py-8">Chargement…</div>}>
          <AuthContent />
        </Suspense>
      </div>
    </div>
  );
}
