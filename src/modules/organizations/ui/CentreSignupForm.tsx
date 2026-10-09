'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { clearLearnerToken } from '@/lib/auth-token';
import { validateCentreApplication } from '../domain/application';
import { submitCentreApplication } from '../infra/organization-client';

const FIELDS = [
  { key: 'legalName', label: 'Raison sociale', span: 2 },
  { key: 'siren', label: 'SIREN', hint: '9 chiffres', span: 1 },
  { key: 'siret', label: 'SIRET de l’établissement', hint: '14 chiffres', span: 1 },
  { key: 'address', label: 'Adresse de l’établissement', span: 2 },
  { key: 'postalCode', label: 'Code postal', span: 1 },
  { key: 'city', label: 'Ville', span: 1 },
] as const;

type Values = Record<(typeof FIELDS)[number]['key'] | 'email' | 'password', string>;
const EMPTY: Values = { email: '', password: '', legalName: '', siren: '', siret: '', address: '', postalCode: '', city: '' };

/** Registration of a new training centre: account + legal identity. The parent company approves the file. */
export function CentreSignupForm() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) => setValues({ ...values, [key]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const checked = validateCentreApplication(values);
    if (!checked.ok) { setError(checked.error); return; }
    if (values.password.length < 8) { setError('Le mot de passe comporte au moins 8 caractères.'); return; }
    setBusy(true); setError(null);
    const failure = await submitCentreApplication(checked.value);
    if (failure) { setBusy(false); setError(failure); return; }
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error: signUpError } = await db.auth.signUp({ email: checked.value.email, password: values.password, options: { emailRedirectTo: `${siteUrl}/auth/confirm` } });
    setBusy(false);
    if (signUpError) { setError(signUpError.message); return; }
    clearLearnerToken();
    setDone(true);
  }

  if (done) {
    return (
      <div role="status" className="space-y-3 rounded-2xl bg-white p-6 text-center shadow-sm">
        <p className="text-4xl" aria-hidden="true">✉️</p>
        <h2 className="text-lg font-black text-[#1a1a2e]">Dossier reçu</h2>
        <p className="text-sm text-slate-600">Confirme ton adresse e-mail avec le lien que nous venons d’envoyer. Play Perform examine ensuite le dossier de ton centre : tu pourras alors inscrire tes élèves.</p>
        <Link href="/auth" className="inline-block rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-bold text-white">Aller à la connexion</Link>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="grid gap-3 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2" aria-label="Inscription d’un centre de formation">
      <fieldset className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
        <legend className="mb-1 text-sm font-black text-[#1a1a2e]">Responsable du compte</legend>
        <label className="space-y-1 text-xs font-semibold text-slate-600">E-mail
          <input type="email" value={values.email} onChange={set('email')} required autoComplete="email" className="block w-full rounded-lg border border-slate-300 p-2 text-sm font-normal text-slate-900" />
        </label>
        <label className="space-y-1 text-xs font-semibold text-slate-600">Mot de passe <span className="font-normal text-slate-400">(8 caractères minimum)</span>
          <input type="password" value={values.password} onChange={set('password')} required minLength={8} autoComplete="new-password" className="block w-full rounded-lg border border-slate-300 p-2 text-sm font-normal text-slate-900" />
        </label>
      </fieldset>
      <fieldset className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
        <legend className="mb-1 text-sm font-black text-[#1a1a2e]">Votre centre de formation</legend>
        {FIELDS.map((f) => (
          <label key={f.key} className={`space-y-1 text-xs font-semibold text-slate-600 ${f.span === 2 ? 'sm:col-span-2' : ''}`}>
            {f.label}{'hint' in f && <span className="ml-1 font-normal text-slate-400">({f.hint})</span>}
            <input value={values[f.key]} onChange={set(f.key)} required inputMode={f.key === 'siren' || f.key === 'siret' || f.key === 'postalCode' ? 'numeric' : undefined}
              className="block w-full rounded-lg border border-slate-300 p-2 text-sm font-normal text-slate-900" />
          </label>
        ))}
      </fieldset>
      <label className="flex items-start gap-2 text-xs text-slate-600 sm:col-span-2">
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5" />
        <span>J’accepte la <Link href="/confidentialite" className="underline">politique de confidentialité</Link> et je certifie représenter ce centre.</span>
      </label>
      {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">{error}</p>}
      <button type="submit" disabled={busy || !accepted} className="rounded-xl bg-slate-800 py-3 text-sm font-bold text-white disabled:opacity-40 sm:col-span-2">
        {busy ? 'Envoi…' : 'Déposer le dossier de mon centre'}
      </button>
    </form>
  );
}
