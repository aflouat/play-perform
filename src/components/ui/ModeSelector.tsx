'use client';

import React from 'react';
import type { LearningMode } from '@/lib/learning-mode';
import { MODE_LABELS } from '@/lib/learning-mode';

interface ModeSelectorProps {
  mode: LearningMode;
  onChange: (m: LearningMode) => void;
  compact?: boolean;
}

export function ModeSelector({ mode, onChange, compact = false }: ModeSelectorProps) {
  if (compact) {
    const current = MODE_LABELS[mode];
    return (
      <button
        onClick={() => onChange(mode === 'assisted' ? 'advanced' : 'assisted')}
        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
          mode === 'assisted'
            ? 'bg-violet-100 text-violet-600 border border-violet-200'
            : 'bg-slate-100 text-slate-500 border border-slate-200'
        }`}
        title={current.description}
        aria-label={`Mode ${current.label} — cliquer pour changer`}
      >
        <span>{current.emoji}</span>
        <span>{current.label}</span>
      </button>
    );
  }

  return (
    <div className="rounded-2xl bg-white shadow-md p-4">
      <p className="text-xs text-slate-400 font-medium mb-3 text-center">Mode d&apos;apprentissage</p>
      <div className="flex gap-2">
        {(['assisted', 'advanced'] as LearningMode[]).map((m) => {
          const meta = MODE_LABELS[m];
          const isActive = mode === m;
          return (
            <button
              key={m}
              onClick={() => onChange(m)}
              className={`flex-1 flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 font-bold text-xs transition-all duration-200 ${
                isActive
                  ? m === 'assisted'
                    ? 'bg-violet-500 text-white shadow-lg scale-105'
                    : 'bg-sky-500 text-white shadow-lg scale-105'
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
              aria-pressed={isActive}
            >
              <span className="text-xl">{meta.emoji}</span>
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-400 text-center mt-2">
        {MODE_LABELS[mode].description}
      </p>
    </div>
  );
}
