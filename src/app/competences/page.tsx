'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SkillMap } from '@/modules/skills';
import { CommandCenter } from '@/modules/dashboards';
import { useActiveProfileId, isProfileReady } from '@/hooks/useActiveProfileId';
import { useSkillBootstrap } from '@/hooks/useSkillBootstrap';

export default function CompetencesPage() {
  const router = useRouter();
  const profileId = useActiveProfileId();
  useEffect(() => { if (profileId === '__none__') router.replace('/'); }, [profileId, router]);
  useSkillBootstrap(profileId);
  if (!isProfileReady(profileId)) {
    return <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Chargement…</div>;
  }
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-8 pb-16 sm:px-6">
      <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
        <button onClick={() => router.push('/')}>← Changer d&apos;élève</button>
        <span className="flex gap-4">
          <button onClick={() => router.push('/classement')} className="font-semibold text-amber-600">🏆 Compétition</button>
          <button onClick={() => router.push('/home')} className="font-semibold text-violet-600">Quiz par matière →</button>
        </span>
      </div>
      <CommandCenter key={profileId} profileId={profileId}>
        {(pathSkillIds) => <section>
          <h2 className="text-2xl font-black text-[#1a1a2e]">Ma ville des compétences</h2>
          <p className="mb-5 mt-1 text-sm text-slate-500">Chaque bâtiment grandit avec ton niveau. Objectif : le château (niveau 5) !</p>
          <SkillMap profileId={profileId} tradeSkillIds={pathSkillIds} />
        </section>}
      </CommandCenter>
    </main>
  );
}
