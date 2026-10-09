'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CompetitionPanel } from '@/modules/competition';
import { useActiveProfileId, isProfileReady } from '@/hooks/useActiveProfileId';
import { useLearningMode } from '@/hooks/useLearningMode';

export default function RankingPage() {
  const router = useRouter();
  const profileId = useActiveProfileId();
  useEffect(() => { if (profileId === '__none__') router.replace('/'); }, [profileId, router]);
  const { mode } = useLearningMode(isProfileReady(profileId) ? profileId : 'demo-quiz');

  if (!isProfileReady(profileId)) return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Chargement…</div>;
  return (
    <main className="mx-auto max-w-md px-5 pb-16 pt-8">
      <button onClick={() => router.push('/competences')} className="mb-4 text-sm text-slate-400">← Ma ville des compétences</button>
      <h1 className="text-2xl font-black text-[#1a1a2e]">🏆 Compétition</h1>
      <p className="mb-5 mt-1 text-sm text-slate-500">Un défi chaque semaine et le classement de ton centre. Tout le monde y apparaît sous un pseudo.</p>
      <CompetitionPanel profileId={profileId} mode={mode} />
    </main>
  );
}
