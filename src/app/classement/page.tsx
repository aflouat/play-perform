'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ActivityFeed, CompetitionPanel, PairCard } from '@/modules/competition';
import { PairChat } from '@/modules/collab';
import { useActiveProfileId, isProfileReady } from '@/hooks/useActiveProfileId';
import { useLearningMode } from '@/hooks/useLearningMode';
import { useScore } from '@/hooks/useScore';
import { XpGainToast, useXpGain } from '@/components/ui/XpGainToast';

export default function RankingPage() {
  const router = useRouter();
  const profileId = useActiveProfileId();
  useEffect(() => { if (profileId === '__none__') router.replace('/'); }, [profileId, router]);
  const { mode } = useLearningMode(isProfileReady(profileId) ? profileId : 'demo-quiz');
  const { addXp } = useScore(profileId);
  const { lastGain, triggerGain } = useXpGain();

  if (!isProfileReady(profileId)) return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Chargement…</div>;
  return (
    <main className="mx-auto max-w-md space-y-8 px-5 pb-16 pt-8">
      <XpGainToast gain={lastGain} />
      <div>
        <button onClick={() => router.push('/competences')} className="mb-4 text-sm text-slate-400">← Ma ville des compétences</button>
        <h1 className="text-2xl font-black text-[#1a1a2e]">🏆 Compétition et communauté</h1>
        <p className="mt-1 text-sm text-slate-500">Un binôme et un défi chaque semaine, le classement et les réussites de ton centre. Tout le monde y apparaît sous un pseudo.</p>
      </div>
      <PairCard profileId={profileId} onBonus={(xp) => { addXp(xp, 'badge-earned'); triggerGain(xp); }} />
      <PairChat />
      <CompetitionPanel profileId={profileId} mode={mode} />
      <ActivityFeed profileId={profileId} />
    </main>
  );
}
