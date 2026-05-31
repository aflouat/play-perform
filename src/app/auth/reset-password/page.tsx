'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

function getClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');
}

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase redirects here with token_hash or access_token in hash
    const db = getClient();
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    async function init() {
      if (tokenHash && type === 'recovery') {
        const { error: err } = await db.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
        if (err) { setError('Lien invalide ou expiré.'); return; }
        setReady(true);
        return;
      }
      // Implicit flow: session may already be set from hash
      const { data } = await db.auth.getSession();
      if (data.session) { setReady(true); return; }
      setError('Lien invalide ou expiré. Veuillez recommencer.');
    }
    init();
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    setError(null); setLoading(true);
    const { error: err } = await getClient().auth.updateUser({ password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    router.push('/parent');
  }

  if (error && !ready) {
    return (
      <div className="text-center space-y-4">
        <div className="text-5xl">❌</div>
        <p className="text-rose-600 text-sm bg-rose-50 rounded-xl px-3 py-2">{error}</p>
        <button onClick={() => router.push('/auth')}
          className="w-full py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700">
          Retour à la connexion
        </button>
      </div>
    );
  }

  if (!ready) return <p className="text-slate-400 text-sm text-center animate-pulse">Vérification…</p>;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-4">
      <h2 className="font-black text-[#1a1a2e] text-center">Nouveau mot de passe</h2>
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nouveau mot de passe</label>
        <div className="relative mt-1">
          <input type={showPwd ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
            required minLength={6}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm focus:outline-none focus:border-violet-400"
            placeholder="6 caractères minimum" />
          <button type="button" onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500">
            {showPwd ? '🙈' : '👁️'}
          </button>
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Confirmer</label>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6}
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-violet-400"
          placeholder="Répétez le mot de passe" />
      </div>
      {error && <p className="text-rose-600 text-sm bg-rose-50 rounded-xl px-3 py-2">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl bg-violet-600 text-white font-bold disabled:opacity-40 hover:bg-violet-700">
        {loading ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-slate-50">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center"><div className="text-5xl mb-3">🔑</div></div>
        <Suspense fallback={<p className="text-slate-400 text-sm text-center">Chargement…</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
