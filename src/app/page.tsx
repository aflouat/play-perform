'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { setActiveProfile, getActiveProfileId, clearActiveProfile } from '@/lib/profiles';
import type { DbStudent } from '@/lib/db';
import { useScore } from '@/hooks/useScore';
import { saveMode, type LearningMode, STUDENT_MODE_LABELS } from '@/lib/learning-mode';
import { apiFetchStudents, apiInsertStudent } from '@/lib/students-api';
import { LandingScreen } from '@/components/shared/LandingScreen';

interface DisplayProfile {
  id: string; name: string; emoji: string; gradient: string;
  tagline: string; homeRoute: string; learningMode: LearningMode;
}

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');
}

const DEFAULT_STUDENTS_SEED = [
  { name: 'Omar',    emoji: '🧑‍🎓', gradient: 'from-sky-400 to-blue-500',     grade: '6ème',      tagline: 'Objectif : brevet',      age: 12, mode: 'quiz'     as const, learning_mode: 'advanced' as const },
  { name: 'Esma',   emoji: '🌸',   gradient: 'from-pink-400 to-rose-500',    grade: 'CP adapté', tagline: 'Mots & phrases (assisté)', age: 9,  mode: 'words'    as const, learning_mode: 'assisted' as const },
  { name: 'Mohamed',emoji: '🚀',   gradient: 'from-emerald-400 to-teal-500', grade: 'CP',        tagline: 'Clavier, mots, sciences',  age: 6,  mode: 'keyboard' as const, learning_mode: 'advanced' as const },
];

function toDisplayProfile(s: DbStudent): DisplayProfile {
  const modeKey = s.mode ?? 'quiz';
  return {
    id: s.id ?? s.name, name: s.name, emoji: s.emoji, gradient: s.gradient,
    tagline: `${s.grade} · ${s.age} ans`,
    homeRoute: STUDENT_MODE_LABELS[modeKey]?.route ?? '/home',
    learningMode: (s.learning_mode ?? 'advanced') as LearningMode,
  };
}

function ProfileCard({ profile, onSelect }: { profile: DisplayProfile; onSelect: () => void }) {
  const { score } = useScore(profile.id);
  return (
    <button onClick={onSelect}
      className="group w-full flex items-center gap-4 rounded-2xl p-5 bg-white shadow-md hover:shadow-xl active:scale-[0.97] transition-all duration-200"
      aria-label={`Jouer en tant que ${profile.name}`}>
      <div className={`w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br ${profile.gradient} flex items-center justify-center text-3xl shadow group-hover:scale-110 transition-transform duration-200`}>{profile.emoji}</div>
      <div className="text-left flex-1">
        <div className="text-[#1a1a2e] font-black text-lg">{profile.name}</div>
        <div className="text-slate-500 text-sm">{profile.tagline}</div>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 border border-amber-200">
            <span className="text-amber-600 text-xs font-bold">⭐ Niv.{score.level}</span>
            <span className="text-amber-400 text-xs">· {score.xp} XP</span>
          </div>
          <span className="text-xs text-slate-400">{profile.learningMode === 'assisted' ? '🤝 Assisté' : '🚀 Avancé'}</span>
        </div>
      </div>
      <span className="text-slate-300 text-lg">→</span>
    </button>
  );
}

export default function WelcomePage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<DisplayProfile[]>([]);
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    async function init() {
      const { data } = await getSupabase().auth.getSession();
      if (!data.session) { setReady(true); return; }
      setAuthed(true);
      let students = await apiFetchStudents();
      if (students.length === 0) {
        await Promise.all(DEFAULT_STUDENTS_SEED.map((s) => apiInsertStudent(s)));
        students = await apiFetchStudents();
      }
      const resolved = students.map(toDisplayProfile);
      const ids = new Set(resolved.map((p) => p.id));
      const stale = getActiveProfileId();
      if (stale && !ids.has(stale)) clearActiveProfile();
      setProfiles(resolved);
      setReady(true);
    }
    init();
  }, []);

  function startSession(profile: DisplayProfile, route: string) {
    setActiveProfile(profile.id, { name: profile.name, emoji: profile.emoji, gradient: profile.gradient });
    const stored = typeof window !== 'undefined' ? localStorage.getItem(`mode:${profile.id}`) : null;
    if (!stored) saveMode(profile.id, profile.learningMode);
    router.push(route);
  }

  if (!ready) return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Chargement…</div>;
  if (!authed) return <LandingScreen />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="text-5xl mb-3">✨</div>
          <h1 className="text-3xl font-black text-[#1a1a2e] tracking-tight">Qui joue aujourd&apos;hui ?</h1>
        </div>
        <div className="space-y-3">
          {profiles.map((p) => <ProfileCard key={p.id} profile={p} onSelect={() => startSession(p, p.homeRoute)} />)}
          {profiles.length === 0 && <p className="text-center py-8 text-slate-400 text-sm">Aucun élève — <Link href="/parent" className="text-violet-600 font-semibold">en ajouter →</Link></p>}
          <Link href="/parent" className="w-full flex items-center gap-4 rounded-2xl p-5 border-2 border-dashed border-violet-200 hover:border-violet-400 transition-colors">
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-violet-50 flex items-center justify-center text-2xl">+</div>
            <div className="text-left"><div className="text-violet-600 font-bold">Gérer les élèves</div><div className="text-slate-400 text-sm">Ajouter, modifier ou supprimer</div></div>
          </Link>
        </div>
        <div className="flex justify-center gap-4 text-xs text-slate-400">
          <Link href="/faq" className="hover:text-slate-600">❓ FAQ</Link>
          <Link href="/releases" className="hover:text-slate-600">📋 Versions</Link>
          <Link href="/parent" className="hover:text-slate-600">👤 Espace parent</Link>
        </div>
      </div>
    </div>
  );
}
