'use client';

import React from 'react';
import Link from 'next/link';
import type { DbParcours } from '@/lib/db';

const SUBJECT_LABELS: Record<string, string> = {
  maths: 'Maths', francais: 'Français', svt: 'SVT', histoire: 'Histoire',
  physique: 'Physique', anglais: 'Anglais', espagnol: 'Espagnol',
  espace: 'Espace', chimie: 'Chimie', geo: 'Géo', informatique: 'Info',
  mecanique: 'Mécanique', meteo: 'Météo', telecom: 'Télécoms',
};

interface Props {
  parcours: DbParcours;
  completed?: boolean;
}

export function ParcoursCard({ parcours, completed = false }: Props) {
  const totalQ = parcours.subjects.length * parcours.questions_per_subject;

  return (
    <Link href={`/parcours/${parcours.id}`}
      className="group relative rounded-2xl bg-white shadow-md hover:shadow-lg active:scale-[0.97] transition-all duration-200 p-5 flex flex-col gap-3 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="flex items-center gap-3 relative">
        <span className="text-3xl">{parcours.emoji}</span>
        <div className="flex-1">
          <div className="font-black text-[#1a1a2e] text-sm leading-snug">{parcours.name}</div>
          {parcours.description && (
            <div className="text-slate-400 text-xs mt-0.5 line-clamp-1">{parcours.description}</div>
          )}
        </div>
        {completed && (
          <span className="shrink-0 text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded-lg">✓ Complété</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 relative">
        {parcours.subjects.map((s) => (
          <span key={s} className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full font-medium">
            {SUBJECT_LABELS[s] ?? s}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between relative">
        <span className="text-xs text-slate-400 font-medium">{totalQ} questions · {parcours.subjects.length} matière{parcours.subjects.length > 1 ? 's' : ''}</span>
        <span className="text-violet-500 font-bold text-sm group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </Link>
  );
}
