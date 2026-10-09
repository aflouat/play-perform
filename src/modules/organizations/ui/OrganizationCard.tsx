'use client';

import { useCallback, useEffect, useState } from 'react';
import { ORG_ROLES, ROLE_LABEL, type OrgRole } from '../domain/access';
import { dismiss, fetchMembers, recruit, type Member, type Organization } from '../infra/organization-client';
import { isIdentityComplete } from '../domain/identity';
import { CentreIdentityForm } from './CentreIdentityForm';

interface Props { organization: Organization; canRecruit: boolean; isSuperAdmin: boolean; onIdentitySaved: () => void }

/** A training centre: its team, and the form to recruit a teacher or an examiner. */
export function OrganizationCard({ organization, canRecruit, isSuperAdmin, onIdentitySaved }: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrgRole>('teacher');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [identityOpen, setIdentityOpen] = useState(false);
  const roles = ORG_ROLES.filter((r) => isSuperAdmin || r !== 'org_admin');

  const load = useCallback(() => { if (canRecruit) fetchMembers(organization.id).then(setMembers); }, [organization.id, canRecruit]);
  useEffect(load, [load]);

  async function add() {
    setError(null); setMessage(null);
    const result = await recruit(organization.id, email, role);
    if (result.error) { setError(result.error); return; }
    setMessage(result.invited ? 'Invitation envoyée par e-mail.' : 'Membre ajouté.');
    setEmail(''); load();
  }
  async function remove(member: Member) {
    if (!window.confirm(`Retirer ${member.email} (${ROLE_LABEL[member.role]}) ?`)) return;
    const failure = await dismiss(organization.id, member.userId, member.role);
    if (failure) setError(failure); else load();
  }

  return (
    <li className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
      <header className="flex items-baseline justify-between">
        <h2 className="font-black text-[#1a1a2e]">{organization.kind === 'parent' ? '🏛️' : '🏫'} {organization.name}</h2>
        <span className="text-xs text-slate-400">{organization.kind === 'parent' ? 'Société mère' : 'Centre de formation'} · {organization.slug}</span>
      </header>
      {canRecruit ? (
        <>
          <button onClick={() => setIdentityOpen((v) => !v)} className={`text-xs font-bold ${isIdentityComplete(organization) ? 'text-slate-500' : 'text-amber-700'}`}>
            {identityOpen ? 'Fermer la fiche légale' : isIdentityComplete(organization) ? '📄 Fiche légale (SIREN, adresse)' : '⚠️ Compléter la fiche légale (SIREN, adresse)'}
          </button>
          {identityOpen && <CentreIdentityForm organizationId={organization.id} initial={organization} onSaved={() => { setIdentityOpen(false); onIdentitySaved(); }} />}
          <ul className="divide-y divide-slate-100 text-sm">
            {members.length === 0 && <li className="py-2 text-slate-400">Aucun membre pour l&apos;instant.</li>}
            {members.map((m) => (
              <li key={`${m.userId}-${m.role}`} className="flex items-center justify-between py-2">
                <span>{m.email} <span className="ml-1 rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700">{ROLE_LABEL[m.role]}</span></span>
                {(isSuperAdmin || m.role !== 'org_admin') && <button onClick={() => remove(m)} className="text-xs text-slate-400 hover:text-rose-500" aria-label={`Retirer ${m.email}`}>Retirer</button>}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e-mail de la personne à recruter" aria-label="E-mail"
              className="flex-1 rounded-xl border border-slate-300 p-2 text-sm" />
            <select value={role} onChange={(e) => setRole(e.target.value as OrgRole)} aria-label="Rôle" className="rounded-xl border border-slate-300 p-2 text-sm">
              {roles.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
            <button onClick={add} disabled={!email.includes('@')} className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Recruter</button>
          </div>
          {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        </>
      ) : <p className="text-sm text-slate-500">Tu fais partie de ce centre. Seul son responsable peut recruter.</p>}
    </li>
  );
}
