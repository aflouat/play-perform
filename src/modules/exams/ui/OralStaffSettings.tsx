'use client';

import { useEffect, useState } from 'react';
import { fetchMyAccess, ROLE_LABEL } from '@/modules/organizations';
import { fetchOralStaff, setOralGrant, type StaffMember } from '../infra/staffing-client';

/** Centre manager: who may give orals ("peut faire passer les oraux") among its teachers and examiners, and their free slots. */
export function OralStaffSettings() {
  const [centres, setCentres] = useState<{ id: string; name: string; staff: StaffMember[] }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyAccess().then(async (me) => {
      const managed = (me?.memberships ?? []).filter((m) => m.role === 'org_admin');
      const loaded = await Promise.all(managed.map(async (m) => ({ id: m.organizationId, name: m.organizationName, staff: (await fetchOralStaff(m.organizationId)) ?? [] })));
      setCentres(loaded);
    });
  }, []);

  async function toggle(centreId: string, member: StaffMember, enabled: boolean) {
    const failure = await setOralGrant(centreId, member.userId, enabled);
    setError(failure);
    if (!failure) setCentres((all) => all.map((c) => (c.id !== centreId ? c : { ...c, staff: c.staff.map((s) => (s.userId === member.userId ? { ...s, canOral: enabled } : s)) })));
  }

  if (centres.length === 0) return null;
  return (
    <section aria-label="Oraux : examinateurs" className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="font-black text-slate-800">🎤 Qui fait passer les oraux ?</h2>
      <p className="text-xs text-slate-500">Les personnes cochées reçoivent une notification pour saisir leurs disponibilités ; les élèves réservent leurs créneaux.</p>
      {centres.map((c) => (
        <div key={c.id} className="space-y-1">
          {centres.length > 1 && <p className="text-xs font-bold text-slate-600">{c.name}</p>}
          {c.staff.length === 0 && <p className="text-sm text-slate-500">Recrute d’abord un enseignant ou un examinateur (Équipe).</p>}
          <ul className="divide-y divide-slate-100">
            {c.staff.map((s) => (
              <li key={s.userId} className="flex items-center gap-3 py-2 text-sm">
                <span className="min-w-0 flex-1 truncate">{s.email} <span className="text-xs text-slate-400">· {s.roles.map((r) => ROLE_LABEL[r]).join(', ')}</span></span>
                {s.canOral && <span className={`text-xs ${s.openSlots > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>{s.openSlots > 0 ? `${s.openSlots} créneau${s.openSlots > 1 ? 'x' : ''} libre${s.openSlots > 1 ? 's' : ''}` : 'aucune disponibilité'}</span>}
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                  <input type="checkbox" checked={s.canOral} onChange={(e) => toggle(c.id, s, e.target.checked)} aria-label={`${s.email} peut faire passer les oraux`} />
                  Peut faire passer les oraux
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
    </section>
  );
}
