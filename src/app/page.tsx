'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PROFILES, setActiveProfileId, getHomeRouteForProfile } from '@/lib/profiles';
import { useScore } from '@/hooks/useScore';

function ProfileCard({
  profile,
  onSelect,
}: {
  profile: (typeof PROFILES)[number];
  onSelect: () => void;
}) {
  const { score } = useScore(profile.id);

  return (
    <button
      onClick={onSelect}
      className="group w-full flex items-center gap-4 rounded-2xl p-5 bg-white shadow-md hover:shadow-xl active:scale-[0.97] transition-all duration-200"
      aria-label={`Jouer en tant que ${profile.name}`}
    >
      <div
        className={`w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br ${profile.gradient} flex items-center justify-center text-3xl shadow group-hover:scale-110 transition-transform duration-200`}
      >
        {profile.emoji}
      </div>
      <div className="text-left flex-1">
        <div className="text-[#1a1a2e] font-black text-lg">{profile.name}</div>
        <div className="text-slate-500 text-sm">{profile.tagline}</div>
        {score.xp > 0 && (
          <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 border border-amber-200">
            <span className="text-amber-600 text-xs font-bold">⭐ Niv.{score.level}</span>
            <span className="text-amber-400 text-xs">· {score.xp} XP</span>
          </div>
        )}
      </div>
      <span className="text-slate-300 text-lg">→</span>
    </button>
  );
}

export default function WelcomePage() {
  const router = useRouter();

  function handleSelect(profile: (typeof PROFILES)[number]) {
    setActiveProfileId(profile.id);
    router.push(getHomeRouteForProfile(profile));
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="text-5xl mb-3">✨</div>
          <h1 className="text-3xl font-black text-[#1a1a2e] tracking-tight">Bonjour !</h1>
          <p className="text-slate-500 text-base">Qui joue aujourd'hui ?</p>
        </div>

        <div className="space-y-3">
          {PROFILES.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onSelect={() => handleSelect(profile)}
            />
          ))}

          <button
            disabled
            className="w-full flex items-center gap-4 rounded-2xl p-5 border-2 border-dashed border-slate-200 opacity-60"
          >
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-slate-100 flex items-center justify-center">
              <span className="text-slate-400 text-2xl font-light">+</span>
            </div>
            <div className="text-left">
              <div className="text-slate-400 font-bold">Ajouter un profil</div>
              <div className="text-slate-300 text-sm">Bientôt disponible</div>
            </div>
          </button>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 rounded-2xl bg-white shadow-sm border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:shadow-md transition-all"
          >
            ❓ Guide &amp; FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}
