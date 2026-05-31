'use client';

import React from 'react';
import { STUDENT_MODE_LABELS } from '@/lib/learning-mode';

export interface SheetProfile {
  id: string;
  name: string;
  emoji: string;
  gradient: string;
  homeRoute: string;
}

interface ModeSheetProps {
  profile: SheetProfile;
  onSelect: (route: string) => void;
  onClose: () => void;
}

export function ModeSheet({ profile, onSelect, onClose }: ModeSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${profile.gradient} flex items-center justify-center text-2xl shadow`}>
            {profile.emoji}
          </div>
          <div>
            <div className="font-black text-[#1a1a2e]">{profile.name}</div>
            <div className="text-xs text-slate-400">Que veux-tu faire ?</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <div className="font-bold text-slate-900 mb-2">Moteur de questions</div>
          <p className="mb-2">Les exercices sont choisis selon le mode et ton niveau. Si une question n&apos;est pas encore maîtrisée, elle peut revenir plus souvent pour t&apos;aider à retenir.</p>
          <p className="text-xs text-slate-500">C&apos;est la répétition espacée : répéter les mêmes notions aide à mieux apprendre et évite d&apos;oublier trop vite.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {Object.entries(STUDENT_MODE_LABELS).map(([key, meta]) => (
            <button key={key} onClick={() => onSelect(meta.route)}
              className={`rounded-2xl p-4 text-center transition-all border-2 ${meta.route === profile.homeRoute ? 'border-violet-500 bg-violet-50' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}>
              <div className="text-2xl mb-1">{meta.emoji}</div>
              <div className="text-xs font-bold text-slate-700">{meta.label}</div>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-full py-2 text-sm text-slate-400 hover:text-slate-600">Annuler</button>
      </div>
    </div>
  );
}
