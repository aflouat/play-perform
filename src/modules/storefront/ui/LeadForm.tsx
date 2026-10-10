'use client';

import { useState } from 'react';

const input = 'w-full rounded-xl border-2 border-violet-100 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none';

/** "Je veux m'inscrire": the visitor leaves a first name and a way to be called back; the centre recruits, the network does the rest. */
export function LeadForm({ slug, centreName, paths }: { slug: string; centreName: string; paths: { id: string; name: string; emoji: string }[] }) {
  const [form, setForm] = useState({ firstName: '', contact: '', pathId: '', message: '', consent: false });
  const [state, setState] = useState<{ sent: boolean; error: string | null; busy: boolean }>({ sent: false, error: null, busy: false });
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  async function submit() {
    setState({ sent: false, error: null, busy: true });
    try {
      const res = await fetch(`/api/centres/${encodeURIComponent(slug)}/leads`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) });
      const error = res.ok ? null : ((await res.json().catch(() => ({}))) as { error?: string }).error ?? 'Envoi impossible.';
      setState({ sent: !error, error, busy: false });
    } catch { setState({ sent: false, error: 'Envoi impossible : vérifie ta connexion.', busy: false }); }
  }

  if (state.sent) {
    return <p role="status" className="rounded-2xl bg-emerald-50 p-5 font-bold text-emerald-800">Merci {form.firstName} ! {centreName} te recontacte très vite pour ton inscription.</p>;
  }
  return (
    <form onSubmit={(e) => { e.preventDefault(); void submit(); }} aria-label="Demande d’inscription" className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-semibold text-slate-700">Prénom<input required value={form.firstName} onChange={(e) => set({ firstName: e.target.value })} className={input} /></label>
      <label className="text-sm font-semibold text-slate-700">E-mail ou téléphone<input required value={form.contact} onChange={(e) => set({ contact: e.target.value })} className={input} /></label>
      <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Parcours qui t’intéresse
        <select value={form.pathId} onChange={(e) => set({ pathId: e.target.value })} className={input}>
          <option value="">Je ne sais pas encore</option>
          {paths.map((p) => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
        </select>
      </label>
      <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Un message (facultatif)
        <textarea rows={3} maxLength={1000} value={form.message} onChange={(e) => set({ message: e.target.value })} className={input} placeholder="Ta classe, tes objectifs, tes disponibilités…" />
      </label>
      <label className="flex items-start gap-2 text-xs text-slate-600 sm:col-span-2">
        <input type="checkbox" checked={form.consent} onChange={(e) => set({ consent: e.target.checked })} className="mt-0.5" />
        J’accepte que {centreName} me recontacte au sujet de mon inscription (si j’ai moins de 15 ans, avec l’accord de mes parents). Voir la <a href="/confidentialite" className="underline">politique de confidentialité</a>.
      </label>
      {state.error && <p role="alert" className="text-sm text-rose-700 sm:col-span-2">{state.error}</p>}
      <button type="submit" disabled={state.busy} className="rounded-2xl bg-amber-400 px-6 py-3 font-black text-violet-950 shadow hover:bg-amber-300 disabled:opacity-60 sm:col-span-2">
        Je veux m’inscrire →
      </button>
    </form>
  );
}
