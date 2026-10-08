'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveLearnerToken, hasLearnerToken, clearLearnerToken } from '@/lib/auth-token';
import { clearActiveProfile, getActiveProfileId, setActiveProfile } from '@/lib/profiles';
import { saveMode, type LearningMode } from '@/lib/learning-mode';

interface LoginResponse {
  token?: string;
  error?: string;
  student?: { id: string; name: string; emoji: string; gradient: string; learning_mode?: LearningMode };
}

export default function LearnerAccessPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (hasLearnerToken() && getActiveProfileId()) router.replace('/competences');
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const res = await fetch('/api/learner/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code }) });
    const body = (await res.json().catch(() => ({}))) as LoginResponse;
    setBusy(false);
    if (!res.ok || !body.token || !body.student) { setError(body.error ?? 'Connexion impossible.'); return; }
    saveLearnerToken(body.token);
    const { id, name, emoji, gradient, learning_mode } = body.student;
    setActiveProfile(id, { name, emoji, gradient });
    if (!localStorage.getItem(`mode:${id}`)) saveMode(id, learning_mode ?? 'advanced');
    router.push('/competences');
  }

  function leave() { clearLearnerToken(); clearActiveProfile(); router.refresh(); }

  return (
    <main className="mx-auto max-w-sm px-5 py-12">
      <div className="text-center">
        <p className="text-5xl" aria-hidden>🎒</p>
        <h1 className="mt-2 text-2xl font-black text-[#1a1a2e]">Espace apprenant</h1>
        <p className="mt-1 text-sm text-slate-500">Entre le code donné par ton enseignant pour retrouver tes compétences.</p>
      </div>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <label htmlFor="code" className="text-xs font-bold uppercase tracking-wide text-slate-500">Ton code d&apos;accès</label>
        <input id="code" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" autoCapitalize="characters"
          placeholder="ABCD-2345" maxLength={9}
          className="w-full rounded-2xl border-2 border-slate-200 px-4 py-4 text-center font-mono text-2xl tracking-widest focus:border-violet-500 focus:outline-none" />
        {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button type="submit" disabled={busy || code.trim().length < 8}
          className="w-full rounded-2xl bg-violet-600 py-3 font-bold text-white disabled:opacity-40">{busy ? 'Connexion…' : 'Entrer'}</button>
      </form>
      {hasLearnerToken() && <button onClick={leave} className="mt-6 block w-full text-center text-xs text-slate-400 hover:text-rose-500">Quitter cet appareil</button>}
    </main>
  );
}
