'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  return createClient(url, key);
}

export default function AuthPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getClient().auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/parent');
      else setChecking(false);
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const db = getClient();
    try {
      const { error: authError } = isSignup
        ? await db.auth.signUp({ email, password })
        : await db.auth.signInWithPassword({ email, password });
      if (authError) { setError(authError.message); return; }
      router.push('/parent');
    } finally {
      setLoading(false);
    }
  }

  if (checking) return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Chargement…</div>;

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-slate-50">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-3">👤</div>
          <h1 className="text-2xl font-black text-[#1a1a2e]">Espace parent</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isSignup ? 'Créez votre compte pour gérer vos élèves.' : 'Connectez-vous pour accéder à votre espace.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-violet-400"
              placeholder="parent@email.com" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-violet-400"
              placeholder="6 caractères minimum" />
          </div>
          {error && <p className="text-rose-600 text-sm bg-rose-50 rounded-xl px-3 py-2">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-violet-600 text-white font-bold disabled:opacity-40 hover:bg-violet-700 transition-colors">
            {loading ? 'Chargement…' : isSignup ? 'Créer un compte' : 'Se connecter'}
          </button>
        </form>

        <div className="text-center space-y-3">
          <button onClick={() => setIsSignup((v) => !v)} className="text-sm text-violet-600 font-semibold hover:underline">
            {isSignup ? 'Déjà un compte ? Se connecter' : 'Pas encore de compte ? S\'inscrire'}
          </button>
          <div>
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600">← Retour à l'accueil</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
