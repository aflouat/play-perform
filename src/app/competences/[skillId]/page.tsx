'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { SkillActivityView } from '@/modules/skills';
import { rememberLastSkill } from '@/modules/dashboards';
import { useActiveProfileId, isProfileReady } from '@/hooks/useActiveProfileId';
import { useSkillBootstrap } from '@/hooks/useSkillBootstrap';
import { useScore } from '@/hooks/useScore';
import { useLearningMode } from '@/hooks/useLearningMode';
import { XpGainToast, useXpGain } from '@/components/ui/XpGainToast';

export default function SkillPage() {
  const { skillId } = useParams<{ skillId: string }>();
  const router = useRouter();
  const asked = useSearchParams().get('activity');
  const profileId = useActiveProfileId();
  useEffect(() => { if (profileId === '__none__') router.replace('/'); }, [profileId, router]);
  useSkillBootstrap(profileId);
  useEffect(() => { if (isProfileReady(profileId)) rememberLastSkill(profileId, skillId); }, [profileId, skillId]);
  const { addXp } = useScore(profileId);
  const { mode } = useLearningMode(isProfileReady(profileId) ? profileId : 'demo-quiz');
  const { lastGain, triggerGain } = useXpGain();

  if (!isProfileReady(profileId)) {
    return <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Chargement…</div>;
  }
  return (
    <main className="mx-auto max-w-md px-5 pt-8 pb-16">
      <XpGainToast gain={lastGain} />
      <button onClick={() => router.push('/competences')} className="mb-4 text-sm text-slate-400">← Mes compétences</button>
      <SkillActivityView skillId={skillId} profileId={profileId} mode={mode} addXp={addXp} triggerGain={triggerGain} initialActivity={asked === 'quiz' || asked === 'flashcards' ? asked : null} />
    </main>
  );
}
