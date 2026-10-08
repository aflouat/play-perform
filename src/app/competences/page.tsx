'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SkillMap } from '@/modules/skills';
import { useActiveProfileId, isProfileReady } from '@/hooks/useActiveProfileId';
import { useSkillBootstrap } from '@/hooks/useSkillBootstrap';

export default function CompetencesPage() {
  const router = useRouter();
  const profileId = useActiveProfileId();
  useEffect(() => { if (profileId === '__none__') router.replace('/'); }, [profileId, router]);
  useSkillBootstrap(profileId);
  if (!isProfileReady(profileId)) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Chargement…</div>;
  }
  return (
    <main className="mx-auto max-w-md px-5 pt-8 pb-16">
      <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
        <button onClick={() => router.push('/')}>← Changer d&apos;élève</button>
        <button onClick={() => router.push('/home')} className="font-semibold text-violet-600">Quiz par matière →</button>
      </div>
      <h1 className="text-2xl font-black text-[#1a1a2e]">Ma ville des compétences</h1>
      <p className="mb-5 mt-1 text-sm text-slate-500">Chaque bâtiment grandit avec ton niveau. Objectif : le château (niveau 5) !</p>
      <SkillMap profileId={profileId} />
    </main>
  );
}
