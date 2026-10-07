'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useScore } from '@/hooks/useScore';
import { useAvatar } from '@/hooks/useAvatar';
import { useLearningMode } from '@/hooks/useLearningMode';
import { useWordSession } from '@/hooks/useWordSession';
import { useActiveProfileId } from '@/hooks/useActiveProfileId';
import { clearActiveProfile } from '@/lib/profiles';
import { LANG_LABELS, type WordLang } from '@/lib/word-data';
import { XpGainToast, useXpGain } from '@/components/ui/XpGainToast';
import { ProfileHeader } from '@/components/shared/ProfileHeader';
import { WordChallenge } from '@/components/esma/WordChallenge';

export default function EsmaPage() {
  const router = useRouter();
  const profileId = useActiveProfileId();
  useEffect(() => {
    if (profileId === '__none__') router.replace('/');
  }, [profileId, router]);

  const { score, xpToNextLevel, addXp } = useScore(profileId);
  const { avatar } = useAvatar(profileId, score.xp);
  const { mode, setMode } = useLearningMode(profileId);
  const { lastGain, popKey, triggerGain } = useXpGain();

  const { lang, challenges, currentIdx, current, scoreGame, feedback, selectedId, finished,
    handleLangChange, handleSelect, restart, sessionLength } =
    useWordSession({ addXp, triggerGain });

  if (finished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 text-center">
        <XpGainToast gain={lastGain} />
        <div className="w-full max-w-sm space-y-6">
          <div className="text-7xl">{scoreGame === sessionLength ? '🌟' : scoreGame >= 4 ? '🎀' : '💪'}</div>
          <h1 className="text-3xl font-black text-[#1a1a2e]">{scoreGame === sessionLength ? 'Parfait, Esma !' : 'Bien joué !'}</h1>
          <p className={`text-3xl font-black text-pink-500 score-pop`} key={popKey}>{scoreGame}/{sessionLength}</p>
          <div className="flex gap-3">
            <button onClick={() => { clearActiveProfile(); router.push('/'); }} className="flex-1 rounded-2xl bg-slate-100 py-4 font-bold text-slate-600">Accueil</button>
            <button onClick={restart} className="flex-1 rounded-2xl bg-pink-500 py-4 font-bold text-white shadow-lg">Rejouer !</button>
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            {(Object.keys(LANG_LABELS) as WordLang[]).map(l => (
              <button key={l} onClick={() => handleLangChange(l)}
                className={`rounded-xl px-3 py-1.5 text-sm font-bold ${lang === l ? 'bg-pink-500 text-white shadow' : 'bg-white text-slate-500 shadow-sm'}`}>
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <XpGainToast gain={lastGain} />
      <div className="max-w-sm mx-auto w-full px-5 pt-8 pb-6 flex-1 flex flex-col">
        <ProfileHeader name="Esma" avatarEmoji={avatar?.emoji ?? '🌸'}
          score={score} xpToNextLevel={xpToNextLevel} mode={mode} onModeChange={setMode}
          onBack={() => { clearActiveProfile(); router.push('/'); }} accentColor="bg-pink-400" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5">
            {(Object.keys(LANG_LABELS) as WordLang[]).map(l => (
              <button key={l} onClick={() => handleLangChange(l)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${lang === l ? 'bg-pink-500 text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className={`rounded-xl bg-pink-50 border border-pink-100 px-3 py-1.5 score-pop`} key={popKey}>
            <span className="text-pink-600 text-sm font-black">{scoreGame}/{sessionLength}</span>
          </div>
        </div>

        <WordChallenge key={current.target.id} current={current} challenges={challenges}
          currentIdx={currentIdx} mode={mode} lang={lang} feedback={feedback}
          selectedId={selectedId} onSelect={handleSelect} />
      </div>
    </div>
  );
}
