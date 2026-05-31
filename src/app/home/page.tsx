'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useScore } from '@/hooks/useScore';
import { useAvatar } from '@/hooks/useAvatar';
import { useLearningMode } from '@/hooks/useLearningMode';
import { AvatarPicker } from '@/components/shared/AvatarPicker';
import { ProfileHeader } from '@/components/shared/ProfileHeader';
import { clearActiveProfile, getActiveProfileId, getProfileById } from '@/lib/profiles';
import { ALL_QUIZ_SUBJECTS, getSubjectLabel } from '@/lib/quiz-data';
import { getQuestions } from '@/lib/question-banks';
import type { Subject } from '@/types';
import { SubjectBadge } from '@/components/home/SubjectBadge';

const SUBJECT_META: Record<Subject, { emoji: string; bg: string }> = {
  maths: { emoji: '🧮', bg: 'bg-sky-500' },
  francais: { emoji: '📝', bg: 'bg-violet-500' },
  svt: { emoji: '🔬', bg: 'bg-emerald-500' },
  histoire: { emoji: '🏛️', bg: 'bg-amber-500' },
  physique: { emoji: '⚡', bg: 'bg-rose-500' },
  it: { emoji: '💻', bg: 'bg-cyan-500' },
  culture: { emoji: '🌍', bg: 'bg-teal-500' },
  espace: { emoji: '🚀', bg: 'bg-indigo-500' },
  meteo: { emoji: '🌦️', bg: 'bg-cyan-400' },
  chimie: { emoji: '⚗️', bg: 'bg-lime-500' },
  mecanique: { emoji: '⚙️', bg: 'bg-orange-500' },
  geo: { emoji: '🌍', bg: 'bg-teal-500' },
  anglais: { emoji: '🇬🇧', bg: 'bg-blue-500' },
  espagnol: { emoji: '🇪🇸', bg: 'bg-red-500' },
  informatique: { emoji: '💻', bg: 'bg-slate-500' },
  telecom: { emoji: '📡', bg: 'bg-purple-500' },
};

export default function HomePage() {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [showAvatars, setShowAvatars] = useState(false);

  useEffect(() => {
    const id = getActiveProfileId();
    if (!id) { router.replace('/'); return; }
    setProfileId(id);
  }, [router]);

  const { score, xpToNextLevel } = useScore(profileId ?? '__none__');
  const { avatar, avatarId, allAvatars, selectAvatar } = useAvatar(profileId ?? '__none__', score.xp);
  const { mode, setMode } = useLearningMode(profileId ?? 'omar');
  const profile = profileId ? getProfileById(profileId) : null;

  if (!profileId) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Chargement…</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-md mx-auto px-5 pt-8 pb-24">
        <ProfileHeader
          name={profile?.name ?? profileId}
          avatarEmoji={avatar?.emoji ?? '🎓'}
          score={score}
          xpToNextLevel={xpToNextLevel}
          mode={mode}
          onModeChange={setMode}
          onBack={() => { clearActiveProfile(); router.push('/'); }}
          accentColor="bg-sky-400"
        />

        <button onClick={() => setShowAvatars(v=>!v)}
          className="w-full rounded-2xl bg-white shadow-sm py-2 text-slate-400 text-xs font-medium mb-5 hover:bg-slate-50 transition-colors">
          {showAvatars ? '▲ Fermer les avatars' : '▼ Changer d\'avatar'}
        </button>

        {showAvatars && (
          <div className="mb-6 rounded-2xl bg-white shadow-lg p-5">
            <AvatarPicker allAvatars={allAvatars} currentXp={score.xp} selectedId={avatarId}
              onSelect={(id) => { selectAvatar(id); setShowAvatars(false); }} />
          </div>
        )}

        <h1 className="text-2xl font-black text-[#1a1a2e] leading-snug tracking-tight mb-2">
          Qu'est-ce qu'on apprend aujourd'hui ?
        </h1>
        <p className="text-slate-400 text-xs mb-5">
          🔢 = questions à revoir · ✓ = maîtrisé · gris = nouveau
        </p>

        <div className="grid grid-cols-2 gap-3 mb-7">
          {ALL_QUIZ_SUBJECTS.map(subject => {
            const meta = SUBJECT_META[subject];
            const all = getQuestions(subject);
            if (all.length === 0) return null;
            return (
              <Link key={subject} href={`/quiz/${subject}?mode=${mode}`}
                className="relative group rounded-2xl p-4 bg-white shadow-md hover:shadow-lg active:scale-[0.97] transition-all duration-200">
                <SubjectBadge profileId={profileId} subject={subject} />
                <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center text-xl mb-2.5 shadow group-hover:scale-110 transition-transform duration-200`}>
                  {meta.emoji}
                </div>
                <div className="font-bold text-[#1a1a2e] text-sm leading-tight">{getSubjectLabel(subject)}</div>
                <div className="text-slate-400 text-xs mt-0.5">{all.length} questions</div>
              </Link>
            );
          })}
        </div>

        {score.badges.filter(b=>b.unlockedAt).length > 0 && (
          <div className="rounded-2xl bg-white shadow-md p-5">
            <h2 className="text-[#1a1a2e] font-black text-base mb-3">Mes badges</h2>
            <div className="flex flex-wrap gap-2">
              {score.badges.filter(b=>b.unlockedAt).map(b => (
                <span key={b.id} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 border border-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700" title={b.description}>
                  {b.emoji} {b.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
