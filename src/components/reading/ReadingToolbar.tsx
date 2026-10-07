'use client';

import React from 'react';
import { READING_LEVELS } from '@/lib/reading/reading-words';
import type { ReadingActivity, ReadingLevel } from '@/types';

const ACTIVITIES: { id: ReadingActivity; label: string; emoji: string }[] = [
  { id: 'discover', label: 'Découvrir', emoji: '👀' },
  { id: 'read-choose', label: 'Lire et choisir', emoji: '📖' },
];

interface Props {
  activity: ReadingActivity;
  level: ReadingLevel;
  currentIdx: number;
  sessionLength: number;
  onActivityChange: (a: ReadingActivity) => void;
  onLevelChange: (l: ReadingLevel) => void;
}

/** Onglets d'activité, choix du niveau et barre de progression de la session. */
export function ReadingToolbar({ activity, level, currentIdx, sessionLength, onActivityChange, onLevelChange }: Props) {
  const levelLabel = READING_LEVELS.find((l) => l.level === level)?.label ?? '';
  return (
    <div className="space-y-3 mb-5">
      <div className="flex gap-2">
        {ACTIVITIES.map((a) => (
          <button key={a.id} onClick={() => onActivityChange(a.id)}
            className={`flex-1 rounded-2xl py-2.5 text-sm font-bold transition-colors ${
              activity === a.id ? 'bg-violet-600 text-white shadow' : 'bg-white text-slate-500 shadow-sm'}`}>
            {a.emoji} {a.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5" role="radiogroup" aria-label="Niveau">
          {READING_LEVELS.map((l) => (
            <button key={l.level} role="radio" aria-checked={level === l.level} aria-label={`Niveau ${l.level} : ${l.label}`}
              onClick={() => onLevelChange(l.level)}
              className={`w-9 h-9 rounded-xl text-sm font-black transition-colors ${
                level === l.level ? 'bg-amber-400 text-white shadow' : 'bg-white text-slate-400 shadow-sm'}`}>
              {l.level}
            </button>
          ))}
        </div>
        <span className="text-xs font-semibold text-slate-400">{levelLabel}</span>
      </div>

      <div className="flex gap-1.5">
        {Array.from({ length: sessionLength }, (_, i) => (
          <div key={i} className={`flex-1 h-2 rounded-full ${
            i < currentIdx ? 'bg-violet-500' : i === currentIdx ? 'bg-violet-200' : 'bg-slate-200'}`} />
        ))}
      </div>
    </div>
  );
}
