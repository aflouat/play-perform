'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchMyAccess, type MyAccess } from '../infra/organization-client';

/** Shortcuts to the screens of my role(s): corrections, enrollment decisions, team management. */
export function TeamLinks() {
  const [access, setAccess] = useState<MyAccess | null>(null);
  useEffect(() => { fetchMyAccess().then(setAccess); }, []);
  if (!access) return null;

  const has = (role: string) => access.memberships.some((m) => m.role === role);
  const links = [
    (access.isSuperAdmin || has('examiner') || has('org_admin')) && { href: '/admin/evaluations', label: '✍️ Évaluations à corriger' },
    (access.isSuperAdmin || has('teacher') || has('org_admin')) && { href: '/admin/inscriptions', label: '📨 Demandes d’inscription' },
    (access.isSuperAdmin || has('org_admin')) && { href: '/admin/organisations', label: '🏫 Mon équipe' },
  ].filter((l): l is { href: string; label: string } => Boolean(l));
  if (links.length === 0) return null;

  return (
    <nav aria-label="Mon équipe" className="flex flex-wrap gap-2">
      {links.map((l) => <Link key={l.href} href={l.href} className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-100">{l.label}</Link>)}
    </nav>
  );
}
