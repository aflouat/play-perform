'use client';

import Link from 'next/link';
import { IdentityForm } from '@/modules/competition';
import { firstQuizHref, onboardingSteps, type Onboarding } from '../domain/onboarding';
import type { LearnerSnapshot } from '../domain/learner';
import { PlacementStep } from './PlacementStep';

const MARK = { done: '✓', current: '•', todo: '' } as const;

/** First connection, one step at a time: 1 profile · 2 level test · 3 first quiz. */
export function FirstSteps({ profileId, snapshot, onChange }: { profileId: string; snapshot: LearnerSnapshot; onChange: () => void }) {
  const progress: Onboarding = onboardingSteps({ identityReady: snapshot.identityComplete, hasLevel: snapshot.hasLevel, hasXp: snapshot.xp > 0 });
  return (
    <div className="space-y-4">
      <p className="text-sm text-violet-100">Bienvenue ! 3 étapes rapides pour bien démarrer.</p>
      <ol className="flex gap-2" aria-label="Étapes de démarrage">
        {progress.steps.map((s, i) => (
          <li key={s.id} aria-current={s.state === 'current' ? 'step' : undefined}
            className={`flex-1 rounded-xl px-2 py-2 text-center text-xs font-bold ${s.state === 'current' ? 'bg-amber-400 text-violet-950' : s.state === 'done' ? 'bg-white/30 text-white' : 'bg-white/10 text-violet-200'}`}>
            <span aria-hidden="true">{MARK[s.state] || i + 1}</span> {s.label}
          </li>
        ))}
      </ol>
      {progress.current === 'profile' && (
        <div className="space-y-2">
          <p className="text-sm font-bold">1 · Choisis ton pseudo et indique ton nom</p>
          <IdentityForm profileId={profileId} onSaved={onChange} />
        </div>
      )}
      {progress.current === 'level' && (
        <div className="space-y-2">
          <p className="text-sm font-bold">2 · Découvre ton niveau (5 questions, sans pression)</p>
          <PlacementStep profileId={profileId} onDone={onChange} />
        </div>
      )}
      {progress.current === 'quiz' && (
        <div className="space-y-2">
          <p className="text-sm font-bold">3 · Ton premier quiz : le plus dur est fait !</p>
          <Link href={firstQuizHref(snapshot.startedSkillId)} className="block rounded-2xl bg-amber-400 py-3 text-center font-black text-violet-950">Lancer mon premier quiz →</Link>
        </div>
      )}
    </div>
  );
}
