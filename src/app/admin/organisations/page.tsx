'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { OrganizationCard } from '@/modules/organizations/ui/OrganizationCard';
import { createCenter, fetchMyAccess, fetchOrganizations, type MyAccess, type Organization } from '@/modules/organizations';

export default function AdminOrganizationsPage() {
  const [access, setAccess] = useState<MyAccess | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => { fetchOrganizations().then(setOrganizations); }, []);

  useEffect(() => {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');
    db.auth.getSession().then(({ data }) => {
      if (!data.session) { window.location.href = '/auth'; return; }
      fetchMyAccess().then(setAccess);
      reload();
    });
  }, [reload]);

  async function create() {
    setError(null);
    const failure = await createCenter(name);
    if (failure) setError(failure); else { setName(''); reload(); }
  }

  const managerOf = new Set(access?.memberships.filter((m) => m.role === 'org_admin').map((m) => m.organizationId));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-[#1a1a2e]">Organisations et équipes</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          La société mère crée les centres de formation. Chaque centre recrute ses enseignants (qui ont leurs propres élèves) et ses examinateurs (qui corrigent ses évaluations, dans un ou plusieurs centres).
        </p>
      </div>
      {access?.isSuperAdmin && (
        <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-violet-300 p-4 sm:flex-row">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du nouveau centre de formation" aria-label="Nom du centre"
            className="flex-1 rounded-xl border border-slate-300 p-2 text-sm" />
          <button onClick={create} disabled={name.trim().length < 2} className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Créer le centre</button>
        </div>
      )}
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
      {access && organizations.length === 0 && <p className="text-sm text-slate-500">Tu n&apos;appartiens à aucune organisation.</p>}
      <ul className="space-y-4">
        {organizations.map((o) => <OrganizationCard key={o.id} organization={o} isSuperAdmin={access?.isSuperAdmin ?? false} canRecruit={(access?.isSuperAdmin ?? false) || managerOf.has(o.id)} />)}
      </ul>
    </div>
  );
}
