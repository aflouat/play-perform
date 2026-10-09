'use client';

import { useState } from 'react';
import { validateCentreIdentity, formatSiren, formatSiret, type CentreIdentity, type StoredIdentity } from '../domain/identity';
import { saveIdentity } from '../infra/organization-client';

interface Props { organizationId: string; initial: StoredIdentity; onSaved: () => void }

const FIELDS: { key: keyof CentreIdentity; label: string; hint?: string; width?: string }[] = [
  { key: 'legalName', label: 'Raison sociale' },
  { key: 'siren', label: 'SIREN', hint: '9 chiffres', width: 'sm:col-span-1' },
  { key: 'siret', label: 'SIRET de l’établissement', hint: '14 chiffres', width: 'sm:col-span-1' },
  { key: 'address', label: 'Adresse de l’établissement' },
  { key: 'postalCode', label: 'Code postal', width: 'sm:col-span-1' },
  { key: 'city', label: 'Ville', width: 'sm:col-span-1' },
];

/** Legal identity of a training centre: company (SIREN), establishment (SIRET) and address. */
export function CentreIdentityForm({ organizationId, initial, onSaved }: Props) {
  const [values, setValues] = useState<Record<keyof CentreIdentity, string>>({
    legalName: initial.legalName ?? '', siren: initial.siren ? formatSiren(initial.siren) : '', siret: initial.siret ? formatSiret(initial.siret) : '',
    address: initial.address ?? '', postalCode: initial.postalCode ?? '', city: initial.city ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    const checked = validateCentreIdentity(values);
    if (!checked.ok) { setError(checked.error); return; }
    setBusy(true); setError(null);
    const failure = await saveIdentity(organizationId, checked.value);
    setBusy(false);
    if (failure) setError(failure); else onSaved();
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); void save(); }} className="grid gap-3 sm:grid-cols-2" aria-label="Identité du centre">
      {FIELDS.map((f) => (
        <label key={f.key} className={`space-y-1 text-xs font-semibold text-slate-600 ${f.width ?? 'sm:col-span-2'}`}>
          {f.label}{f.hint && <span className="ml-1 font-normal text-slate-400">({f.hint})</span>}
          <input value={values[f.key]} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} inputMode={f.key === 'siren' || f.key === 'siret' || f.key === 'postalCode' ? 'numeric' : undefined}
            className="block w-full rounded-lg border border-slate-300 p-2 text-sm font-normal text-slate-900" />
        </label>
      ))}
      {error && <p role="alert" className="text-sm text-rose-700 sm:col-span-2">{error}</p>}
      <button type="submit" disabled={busy} className="rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white disabled:opacity-40 sm:col-span-2">{busy ? 'Enregistrement…' : 'Enregistrer l’identité du centre'}</button>
    </form>
  );
}
