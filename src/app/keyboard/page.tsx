'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearActiveProfile, getActiveProfileId, getProfileById } from '@/lib/profiles';
import { useScore } from '@/hooks/useScore';
import { useAvatar } from '@/hooks/useAvatar';
import { useLearningMode } from '@/hooks/useLearningMode';
import { ProfileHeader } from '@/components/shared/ProfileHeader';
import { LetterMode } from '@/components/keyboard/LetterMode';
import { WordMode } from '@/components/keyboard/WordMode';
import { ScienceMode } from '@/components/keyboard/ScienceMode';
import { playSound } from '@/lib/audio';

type GameMode = 'letters' | 'words' | 'science';

const MODES: { id: GameMode; label: string; emoji: string; color: string }[] = [
  { id: 'letters', label: 'Lettres', emoji: '🔤', color: 'bg-emerald-500' },
  { id: 'words', label: 'Mots', emoji: '📝', color: 'bg-violet-500' },
  { id: 'science', label: 'Sciences', emoji: '🔬', color: 'bg-sky-500' },
];

function FinishScreen({ onReplay, onHome, xp, level, name }: { onReplay: () => void; onHome: () => void; xp: number; level: number; name: string }) {
  useEffect(() => { playSound('levelup'); }, []);
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8 text-center">
      <div className="text-7xl">🏆</div>
      <div>
        <h2 className="text-3xl font-black text-[#1a1a2e]">Mission accomplie !</h2>
        <p className="text-slate-500 mt-1">Tu es super fort, {name} !</p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-2">
          <span className="text-amber-500 font-black">⭐ Niv.{level}</span>
          <span className="text-amber-400 text-sm">· {xp} XP</span>
        </div>
      </div>
      <div className="flex gap-3 w-full">
        <button onClick={onHome} className="flex-1 rounded-2xl bg-slate-100 py-4 font-bold text-slate-600 hover:bg-slate-200 transition-colors">Accueil</button>
        <button onClick={onReplay} className="flex-1 rounded-2xl bg-emerald-500 py-4 font-bold text-white shadow-lg hover:bg-emerald-400 transition-colors">Rejouer !</button>
      </div>
    </div>
  );
}

export default function KeyboardPage() {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string>('__none__');
  const [gameMode, setGameMode] = useState<GameMode>('letters');
  const [finished, setFinished] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const id = getActiveProfileId();
    if (!id) { router.replace('/'); return; }
    setProfileId(id);
  }, [router]);

  const { score, xpToNextLevel } = useScore(profileId);
  const { avatar } = useAvatar(profileId, score.xp);
  const profile = getProfileById(profileId);
  const { mode, setMode } = useLearningMode(profileId);

  function handleGameModeChange(m: GameMode) {
    setGameMode(m); setFinished(false); setKey(k=>k+1);
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-sm mx-auto px-5 pt-8 pb-10">
        <ProfileHeader
          name={profile?.name ?? profileId}
          avatarEmoji={avatar?.emoji ?? '🚀'}
          score={score}
          xpToNextLevel={xpToNextLevel}
          mode={mode}
          onModeChange={setMode}
          onBack={() => { clearActiveProfile(); router.push('/'); }}
          accentColor="bg-emerald-400"
        />

        {/* Game mode tabs */}
        <div className="flex gap-2 mb-6">
          {MODES.map(m => (
            <button key={m.id} onClick={() => handleGameModeChange(m.id)}
              className={`flex-1 rounded-2xl py-2.5 flex flex-col items-center gap-0.5 font-bold text-xs transition-all duration-200 ${
                gameMode===m.id ? `${m.color} text-white shadow-lg scale-105` : 'bg-white text-slate-400 shadow-sm'
              }`}>
              <span className="text-lg">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>

        {finished ? (
          <FinishScreen
            xp={score.xp}
            level={score.level}
            name={profile?.name ?? profileId}
            onReplay={() => { setFinished(false); setKey(k=>k+1); }}
            onHome={() => { clearActiveProfile(); router.push('/'); }} />
        ) : (
          <div key={key}>
            {gameMode==='letters' && <LetterMode profileId={profileId} mode={mode} onFinish={() => setFinished(true)} />}
            {gameMode==='words' && <WordMode profileId={profileId} mode={mode} onFinish={() => setFinished(true)} />}
            {gameMode==='science' && <ScienceMode profileId={profileId} mode={mode} onFinish={() => setFinished(true)} />}
          </div>
        )}
      </div>
    </div>
  );
}
