'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminLinks, navAccessOf, type NavLink } from '../domain/navigation';
import { fetchMyAccess } from '../infra/organization-client';

/** Back-office menu: only the screens the signed-in role may use (no dead links for a centre manager). */
export function AdminNav() {
  const pathname = usePathname();
  const [links, setLinks] = useState<NavLink[] | null>(null);

  useEffect(() => {
    fetchMyAccess().then((me) => setLinks(me ? adminLinks(navAccessOf(me)) : []));
  }, []);

  return (
    <nav aria-label="Administration" className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-slate-200 bg-white px-6 py-3">
      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Administration</span>
      {links?.map((l) => (
        <Link key={l.href + l.label} href={l.href} aria-current={pathname === l.href ? 'page' : undefined}
          className={`text-sm font-semibold transition-colors hover:text-violet-600 ${pathname === l.href ? 'text-violet-700' : 'text-slate-600'}`}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
