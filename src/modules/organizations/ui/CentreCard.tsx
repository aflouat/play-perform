'use client';

import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_ORGANIZATION_ID } from '../domain/access';
import { formatSiren, formatSiret, isIdentityComplete } from '../domain/identity';
import { fetchMyAccess, fetchOrganizations, type MyAccess, type Organization } from '../infra/organization-client';
import { CentreIdentityForm } from './CentreIdentityForm';

/** "Mon centre de formation": its legal identity, with a form for its manager. Legacy accounts see the parent company. */
export function CentreCard() {
  const [access, setAccess] = useState<MyAccess | null>(null);
  const [centres, setCentres] = useState<Organization[]>([]);
  const [editing, setEditing] = useState(false);

  const load = useCallback(() => {
    fetchMyAccess().then(setAccess);
    fetchOrganizations().then(setCentres);
  }, []);
  useEffect(load, [load]);

  if (!access) return null;
  const mine = access.memberships.find((m) => m.role === 'org_admin' || m.role === 'teacher');
  const centre = centres.find((c) => c.id === (mine?.organizationId ?? DEFAULT_ORGANIZATION_ID)) ?? centres[0];
  if (!centre) return null;

  const canEdit = access.isSuperAdmin || access.memberships.some((m) => m.organizationId === centre.id && m.role === 'org_admin');
  const complete = isIdentityComplete(centre);

  return (
    <section aria-label="Mon centre" className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{centre.kind === 'parent' ? 'Société mère' : 'Centre de formation'}</p>
          <h2 className="text-lg font-black text-[#1a1a2e]">🏫 {centre.legalName ?? centre.name}</h2>
        </div>
        {canEdit && <button onClick={() => setEditing((v) => !v)} className="text-xs font-bold text-violet-600">{editing ? 'Fermer' : complete ? 'Modifier' : 'Compléter'}</button>}
      </header>

      {!complete && !editing && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          La fiche légale du centre est incomplète (SIREN, établissement, adresse).{canEdit ? ' Complète-la pour accueillir des apprenants.' : ' Son responsable doit la compléter.'}
        </p>
      )}
      {complete && !editing && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm text-slate-600">
          <dt className="font-semibold">SIREN</dt><dd>{formatSiren(centre.siren as string)}</dd>
          <dt className="font-semibold">SIRET</dt><dd>{formatSiret(centre.siret as string)}</dd>
          <dt className="font-semibold">Adresse</dt><dd>{centre.address}, {centre.postalCode} {centre.city}</dd>
        </dl>
      )}
      {editing && canEdit && <CentreIdentityForm organizationId={centre.id} initial={centre} onSaved={() => { setEditing(false); load(); }} />}
    </section>
  );
}
