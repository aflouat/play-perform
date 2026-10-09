'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRole } from '@/hooks/useRole';
import { clearLearnerToken } from '@/lib/auth-token';
import { clearActiveProfile } from '@/lib/profiles';
import { centreHome } from '@/modules/organizations/domain/navigation';

type NavItem = { href: string; label: string } | { label: string; onClick: () => void };

const LINK = 'hover:text-violet-600';

/** Site header, on every page. Each role sees its own space only: a learner never sees the centre's, and vice versa. */
export function SiteHeader() {
  const role = useRole();
  const router = useRouter();
  const [home, setHome] = useState('/enseignant');

  useEffect(() => {
    if (role !== 'teacher') return;
    import('@/modules/organizations').then(({ fetchMyAccess, navAccessOf }) => fetchMyAccess().then((me) => {
      if (me) setHome(centreHome(navAccessOf(me)));
    }));
  }, [role]);

  async function leaveLearner() { clearLearnerToken(); clearActiveProfile(); router.push('/'); }
  async function leaveCentre() {
    await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').auth.signOut();
    router.push('/');
  }

  const items: NavItem[] = role === 'learner'
    ? [{ href: '/competences', label: 'Ma ville' }, { href: '/classement', label: 'Compétition' }, { label: 'Quitter', onClick: leaveLearner }]
    : role === 'teacher'
      ? [
          { label: 'Déconnexion', onClick: leaveCentre },
        ]
      : role === 'visitor'
        ? [{ href: '/faq', label: 'FAQ' }, { href: '/apprenant', label: 'J’ai un code' }]
        : [];

  return (
    <>
      {/* B2B corner: the centres' entry lives apart from the learner's calls to action */}
      {role === 'visitor' && (
        <div className="bg-slate-800 text-xs text-slate-300 print:hidden">
          <div className="mx-auto flex max-w-3xl items-center justify-end gap-2 px-4 py-1.5">
            <span>Vous êtes un centre de formation ?</span>
            <Link href="/auth" className="font-semibold text-white underline-offset-2 hover:underline">Gérer mon centre →</Link>
          </div>
        </div>
      )}
    <header className="border-b border-slate-200 bg-white print:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href={role === 'learner' ? '/competences' : role === 'teacher' ? home : '/'} className="text-lg font-black tracking-tight text-[#1a1a2e]">🏰 Play Perform</Link>
        <nav aria-label="Navigation principale" className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm font-semibold text-slate-600">
          {items.map((item) => 'href' in item
            ? <Link key={item.href} href={item.href} className={LINK}>{item.label}</Link>
            : <button key={item.label} onClick={item.onClick} className={LINK}>{item.label}</button>)}
          {role === 'visitor' && (
            <Link href="/#commencer" className="rounded-full bg-violet-600 px-4 py-1.5 font-bold text-white hover:bg-violet-700">Je commence mon apprentissage</Link>
          )}
        </nav>
      </div>
    </header>
    </>
  );
}
