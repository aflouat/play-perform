'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { fetchMyAccess } from '../infra/organization-client';

/** For what all centres share (questions, import, learning routes, prices): the parent company only. */
export function SuperAdminGate({ children }: { children: ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  useEffect(() => { fetchMyAccess().then((me) => setAllowed(Boolean(me?.isSuperAdmin))); }, []);

  if (allowed === null) return null;
  if (allowed) return <>{children}</>;
  return (
    <div role="alert" className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
      <p className="font-bold text-[#1a1a2e]">Cette page est réservée à la société mère.</p>
      <p className="mt-1 text-sm text-slate-500">Les questions, parcours et tarifs sont communs à tous les centres.</p>
      <Link href="/enseignant" className="mt-4 inline-block rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-white">Retour à mon centre</Link>
    </div>
  );
}
