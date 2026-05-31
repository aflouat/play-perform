import React from 'react';
import Link from 'next/link';
import { STUDENT_MODE_LABELS } from '@/lib/learning-mode';

export function LandingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12 bg-gradient-to-b from-violet-50 to-white">
      <div className="w-full max-w-sm text-center space-y-8">
        <div>
          <div className="text-6xl mb-4">✨</div>
          <h1 className="text-3xl font-black text-[#1a1a2e] tracking-tight"> Play Perform</h1>
          <p className="text-slate-500 mt-2 text-base leading-relaxed">
            La plateforme d&apos;apprentissage ludique pour tous les enfants.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {Object.values(STUDENT_MODE_LABELS).map((meta) => (
            <div key={meta.label} className="rounded-2xl bg-white shadow-sm border border-slate-100 p-3">
              <div className="text-2xl mb-1">{meta.emoji}</div>
              <div className="text-xs font-bold text-[#1a1a2e]">{meta.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{meta.description.split(',')[0]}</div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <Link href="/auth"
            className="block w-full py-4 rounded-2xl bg-violet-600 text-white font-black text-base hover:bg-violet-700 transition-colors shadow-lg">
            👤 Connexion parent
          </Link>
          <Link href="/auth?signup=1"
            className="block w-full py-3 rounded-2xl bg-violet-50 border border-violet-200 text-violet-700 font-bold text-sm hover:bg-violet-100 transition-colors">
            Créer un compte gratuit
          </Link>
        </div>
        <div className="flex justify-center gap-4">
          <Link href="/faq" className="text-xs text-slate-400 hover:text-slate-600">❓ FAQ</Link>
          <Link href="/releases" className="text-xs text-slate-400 hover:text-slate-600">📋 Versions</Link>
        </div>
      </div>
    </div>
  );
}
