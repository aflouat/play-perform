'use client';

import { useEffect, useState } from 'react';
import { validateIdentityUpdate, isIdentityReady } from '../domain/identity';
import { fetchIdentity, saveIdentity, type ProfileIdentity } from '../infra/competition-client';

interface Props { profileId: string; onSaved?: (identity: ProfileIdentity) => void }

const INPUT = 'block w-full rounded-lg border border-slate-300 p-2 text-sm font-normal text-slate-900';

/** "Mon profil": the pseudonym others see (ranking, community) and the real names that only appear on the diploma. */
export function IdentityForm({ profileId, onSaved }: Props) {
  const [stored, setStored] = useState<ProfileIdentity | null>(null);
  const [values, setValues] = useState({ firstName: '', lastName: '', nickname: '' });
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchIdentity(profileId).then((identity) => {
      if (!identity) return;
      setStored(identity);
      setValues({ firstName: identity.firstName ?? '', lastName: identity.lastName ?? '', nickname: identity.nickname ?? '' });
    });
  }, [profileId]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const checked = validateIdentityUpdate({ profileId, ...values });
    if (!checked.ok) { setMessage({ ok: false, text: checked.error }); return; }
    setBusy(true); setMessage(null);
    const { profileId: _id, ...patch } = checked.value;
    const failure = await saveIdentity(profileId, patch);
    setBusy(false);
    if (failure) { setMessage({ ok: false, text: failure }); return; }
    const next = { ...(stored as ProfileIdentity), firstName: values.firstName, lastName: values.lastName, nickname: values.nickname };
    setStored(next);
    setMessage({ ok: true, text: 'Profil enregistré.' });
    onSaved?.(next);
  }

  if (!stored) return null;
  return (
    <form onSubmit={save} aria-label="Mon profil" className="space-y-3 rounded-2xl bg-white p-4 text-slate-800">
      <fieldset className="space-y-1">
        <legend className="text-sm font-black text-[#1a1a2e]">🎭 Mon pseudo</legend>
        <p className="text-xs text-slate-500">C’est le seul nom que voient les autres élèves : classement et communauté.</p>
        <label className="sr-only" htmlFor="nickname">Pseudo</label>
        <input id="nickname" value={values.nickname} onChange={(e) => setValues({ ...values, nickname: e.target.value })} placeholder="ex. RenardBleu42" className={INPUT} />
      </fieldset>
      <fieldset className="space-y-1">
        <legend className="text-sm font-black text-[#1a1a2e]">🎓 Mon nom pour le diplôme</legend>
        <p className="text-xs text-slate-500">Visible uniquement sur ton diplôme, jamais des autres élèves.</p>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs font-semibold text-slate-600">Prénom
            <input value={values.firstName} onChange={(e) => setValues({ ...values, firstName: e.target.value })} autoComplete="given-name" className={INPUT} />
          </label>
          <label className="text-xs font-semibold text-slate-600">Nom
            <input value={values.lastName} onChange={(e) => setValues({ ...values, lastName: e.target.value })} autoComplete="family-name" className={INPUT} />
          </label>
        </div>
      </fieldset>
      {message && <p role={message.ok ? 'status' : 'alert'} className={`text-sm ${message.ok ? 'text-emerald-700' : 'text-rose-700'}`}>{message.text}</p>}
      <button type="submit" disabled={busy} className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white disabled:opacity-40">
        {busy ? 'Enregistrement…' : isIdentityReady(stored) ? 'Enregistrer' : 'Enregistrer mon profil'}
      </button>
    </form>
  );
}
