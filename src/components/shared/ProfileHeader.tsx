'use client';

import React from 'react';
import type { LearningMode } from '@/lib/learning-mode';
import { ModeSelector } from '@/components/ui/ModeSelector';
import type { Score } from '@/types';

interface ProfileHeaderProps {
  name: string;
  avatarEmoji: string;
  score: Score;
  xpToNextLevel: number;
  mode: LearningMode;
  onModeChange: (m: LearningMode) => void;
  onBack: () => void;
  accentColor?: string;
}

const XP_PER_LEVEL = 100;

export function ProfileHeader({
  name,
  avatarEmoji,
  score,
  xpToNextLevel,
  mode,
  onModeChange,
  onBack,
  accentColor = 'bg-sky-500',
}: ProfileHeaderProps) {
  const xpInLevel = XP_PER_LEVEL - xpToNextLevel;
  const xpPct = Math.round((xpInLevel / XP_PER_LEVEL) * 100);

  return (
    <div className="mb-6">
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-white shadow flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Retour à l'accueil"
        >
          ←
        </button>

        <div className="flex items-center gap-3">
          <div className="text-3xl">{avatarEmoji}</div>
          <div>
            <div className="font-black text-[#1a1a2e] text-base leading-tight">{name}</div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-500 text-xs font-bold">Niv.{score.level}</span>
              <span className="text-slate-400 text-xs">· {score.xp} XP</span>
            </div>
          </div>
        </div>

        <ModeSelector mode={mode} onChange={onModeChange} compact />
      </div>

      {/* XP bar */}
      <div className="h-2 w-full rounded-full bg-white shadow-inner overflow-hidden">
        <div
          className={`h-full ${accentColor} rounded-full transition-all duration-700`}
          style={{ width: `${xpPct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-slate-400">Niveau {score.level}</span>
        <span className="text-xs text-slate-400">{xpToNextLevel} XP → niv.{score.level + 1}</span>
      </div>
    </div>
  );
}
