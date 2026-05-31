'use client';

import React from 'react';

const XP_PER_LEVEL = 100;

interface ScoreBadgeProps {
  xp: number;
  level: number;
  xpToNext: number;
  compact?: boolean;
}

export function ScoreBadge({ xp, level, xpToNext, compact = false }: ScoreBadgeProps) {
  const xpInLevel = XP_PER_LEVEL - xpToNext;
  const pct = Math.round((xpInLevel / XP_PER_LEVEL) * 100);

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 px-3 py-1.5">
        <span className="text-amber-500 font-bold text-sm">Niv.{level}</span>
        <span className="text-amber-400 text-sm">{xp} XP</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white shadow-md p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <div>
            <div className="text-lg font-bold text-amber-500">Niveau {level}</div>
            <div className="text-xs text-slate-400">{xp} XP total</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-[#1a1a2e] font-medium">{xpToNext} XP</div>
          <div className="text-xs text-slate-400">pour le niveau suivant</div>
        </div>
      </div>

      <div
        className="h-3 w-full rounded-full bg-slate-100 overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${pct}% du niveau ${level + 1}`}
      >
        <div
          className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-amber-400 to-yellow-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
