'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SkillsDashboard } from '@/modules/skills';
import { useActiveProfileId, isProfileReady } from '@/hooks/useActiveProfileId';

export default function CompetencesPage() {
  const router = useRouter();
  const profileId = useActiveProfileId();
  useEffect(() => { if (profileId === '__none__') router.replace('/'); }, [profileId, router]);
  if (!isProfileReady(profileId)) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Chargement…</div>;
  }
  return (
    <main className="mx-auto max-w-md px-5 pt-8 pb-16">
      <button onClick={() => router.push('/home')} className="mb-4 text-sm text-slate-400">← Retour</button>
      <h1 className="text-2xl font-black text-[#1a1a2e]">Mes compétences</h1>
      <p className="mb-5 mt-1 text-sm text-slate-500">Ton niveau dans chaque compétence. Choisis-en une pour progresser.</p>
      <SkillsDashboard profileId={profileId} />
    </main>
  );
}
