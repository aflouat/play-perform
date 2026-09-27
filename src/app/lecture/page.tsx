'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useScore } from '@/hooks/useScore';
import { useAvatar } from '@/hooks/useAvatar';
import { useLearningMode } from '@/hooks/useLearningMode';
import { useReadingSession } from '@/hooks/useReadingSession';
import { useActiveProfileId, useActiveProfileName, isProfileReady } from '@/hooks/useActiveProfileId';
import { clearActiveProfile, getProfileById } from '@/lib/profiles';
import { XpGainToast, useXpGain } from '@/components/ui/XpGainToast';
import { ProfileHeader } from '@/components/shared/ProfileHeader';
import { ReadingToolbar } from '@/components/reading/ReadingToolbar';
import { DiscoverView } from '@/components/reading/DiscoverView';
import { ReadChooseView } from '@/components/reading/ReadChooseView';

export default function LecturePage() {
  const router = useRouter();
  const profileId = useActiveProfileId();
  const storedName = useActiveProfileName();
  useEffect(() => {
    if (profileId === '__none__') router.replace('/');
  }, [profileId, router]);

  const { score, xpToNextLevel, addXp } = useScore(profileId);
  const { avatar } = useAvatar(profileId, score.xp);
  const { mode, setMode } = useLearningMode(profileId);
  const { lastGain, popKey, triggerGain } = useXpGain();
  const session = useReadingSession({ addXp, triggerGain });
  const name = storedName ?? getProfileById(profileId)?.name ?? '';
  const goHome = () => { clearActiveProfile(); router.push('/'); };

  return (
    <div className="min-h-screen flex flex-col">
      <XpGainToast gain={lastGain} />
      <div className="max-w-sm mx-auto w-full px-5 pt-8 pb-6 flex-1 flex flex-col">
        <ProfileHeader name={name} avatarEmoji={avatar?.emoji ?? '📖'}
          score={score} xpToNextLevel={xpToNextLevel} mode={mode} onModeChange={setMode}
          onBack={goHome} accentColor="bg-violet-400" />

        <ReadingToolbar activity={session.activity} level={session.level}
          currentIdx={session.finished ? session.sessionLength : session.currentIdx}
          sessionLength={session.sessionLength}
          onActivityChange={session.setActivity} onLevelChange={session.setLevel} />

        {/* Session tirée au hasard : rendue côté client uniquement (profil inconnu au SSR) */}
        {!isProfileReady(profileId) ? null : session.finished ? (
          <div className="flex flex-col items-center gap-5 py-6 text-center">
            <div className="text-7xl">{session.score === session.sessionLength ? '🌟' : '💪'}</div>
            <h1 className="text-3xl font-black text-[#1a1a2e]">
              {session.score === session.sessionLength ? `Bravo${name ? `, ${name}` : ''} !` : 'Bien joué !'}
            </h1>
            <p className="text-3xl font-black text-violet-600 score-pop" key={popKey}>{session.score}/{session.sessionLength}</p>
            <div className="flex gap-3 w-full">
              <button onClick={goHome} className="flex-1 rounded-2xl bg-slate-100 py-4 font-bold text-slate-600">Accueil</button>
              <button onClick={session.restart} className="flex-1 rounded-2xl bg-violet-600 py-4 font-bold text-white shadow-lg">Rejouer !</button>
            </div>
          </div>
        ) : session.activity === 'discover' ? (
          <DiscoverView key={session.current.target.id} word={session.current.target} mode={mode} onDone={session.markRead} />
        ) : (
          <ReadChooseView key={session.current.target.id} challenge={session.current} mode={mode}
            feedback={session.feedback} selectedId={session.selectedId} onSelect={session.select} />
        )}
      </div>
    </div>
  );
}
