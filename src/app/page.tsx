'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { setActiveProfileId, getActiveProfileId, clearActiveProfile } from '@/lib/profiles';
import type { DbStudent } from '@/lib/db';
import { useScore } from '@/hooks/useScore';
import { saveMode, type LearningMode, STUDENT_MODE_LABELS } from '@/lib/learning-mode';
import { apiFetchStudents, apiInsertStudent } from '@/lib/students-api';

interface DisplayProfile {
  id: string; name: string; emoji: string; gradient: string;
  tagline: string; homeRoute: string; learningMode: LearningMode;
  availableModes: string[]; // all routes available for this profile
}

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');
}

const DEFAULT_PARENT_EMAIL = 'aflouat@gmail.com';
const DEFAULT_STUDENTS_SEED = [
  { name: 'Omar',    emoji: '🧑‍🎓', gradient: 'from-sky-400 to-blue-500',     grade: '6ème',      tagline: 'Objectif : brevet',      age: 12, mode: 'quiz'     as const, learning_mode: 'advanced' as const },
  { name: 'Esma',   emoji: '🌸',   gradient: 'from-pink-400 to-rose-500',    grade: 'CP adapté', tagline: 'Mots & phrases',          age: 9,  mode: 'words'    as const, learning_mode: 'assisted' as const },
  { name: 'Mohamed',emoji: '🚀',   gradient: 'from-emerald-400 to-teal-500', grade: 'CP',        tagline: 'Apprends le clavier !',   age: 6,  mode: 'keyboard' as const, learning_mode: 'advanced' as const },
];

function toDisplayProfile(s: DbStudent): DisplayProfile {
  const modeKey = s.mode ?? 'quiz';
  return {
    id: s.id ?? s.name, name: s.name, emoji: s.emoji, gradient: s.gradient,
    tagline: `${s.grade} · ${s.age} ans`,
    homeRoute: STUDENT_MODE_LABELS[modeKey]?.route ?? '/home',
    learningMode: (s.learning_mode ?? 'advanced') as LearningMode,
    availableModes: Object.keys(STUDENT_MODE_LABELS),
  };
}

// Mode selector shown when profile is clicked — session only, not persisted to profile
function ModeSheet({ profile, onSelect, onClose }: {
  profile: DisplayProfile; onSelect: (route: string) => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-t-3xl p-6 pb-8 space-y-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${profile.gradient} flex items-center justify-center text-2xl shadow`}>{profile.emoji}</div>
          <div><div className="font-black text-[#1a1a2e]">{profile.name}</div><div className="text-xs text-slate-400">Que veux-tu faire ?</div></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(STUDENT_MODE_LABELS).map(([key, meta]) => {
            const isDefault = STUDENT_MODE_LABELS[profile.homeRoute.replace('/','')]?.route === meta.route
              || meta.route === profile.homeRoute;
            return (
              <button key={key} onClick={() => onSelect(meta.route)}
                className={`rounded-2xl p-4 text-center transition-all border-2 ${isDefault ? 'border-violet-500 bg-violet-50' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}>
                <div className="text-2xl mb-1">{meta.emoji}</div>
                <div className="text-xs font-bold text-slate-700">{meta.label}</div>
              </button>
            );
          })}
        </div>
        <button onClick={onClose} className="w-full py-2 text-sm text-slate-400 hover:text-slate-600">Annuler</button>
      </div>
    </div>
  );
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
          <span className="text-xs text-slate-400">{profile.learningMode === 'assisted' ? '🤝' : '🚀'}</span>
        </div>
      </div>
      <span className="text-slate-300 text-lg">→</span>
    </button>
  );
}

function LandingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12 bg-gradient-to-b from-violet-50 to-white">
      <div className="w-full max-w-sm text-center space-y-8">
        <div><div className="text-6xl mb-4">✨</div><h1 className="text-3xl font-black text-[#1a1a2e] tracking-tight">SYNTH.EDU</h1><p className="text-slate-500 mt-2 text-base leading-relaxed">La plateforme d'apprentissage ludique pour tous les enfants.</p></div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {Object.values(STUDENT_MODE_LABELS).map((meta) => (
            <div key={meta.label} className="rounded-2xl bg-white shadow-sm border border-slate-100 p-3">
              <div className="text-2xl mb-1">{meta.emoji}</div>
              <div className="text-xs font-bold text-[#1a1a2e]">{meta.label}</div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <Link href="/auth" className="block w-full py-4 rounded-2xl bg-violet-600 text-white font-black text-base hover:bg-violet-700 transition-colors shadow-lg">👤 Connexion parent</Link>
          <Link href="/auth?signup=1" className="block w-full py-3 rounded-2xl bg-violet-50 border border-violet-200 text-violet-700 font-bold text-sm hover:bg-violet-100 transition-colors">Créer un compte gratuit</Link>
        </div>
        <div className="flex justify-center gap-4">
          <Link href="/faq" className="text-xs text-slate-400 hover:text-slate-600">❓ FAQ</Link>
          <Link href="/releases" className="text-xs text-slate-400 hover:text-slate-600">📋 Versions</Link>
        </div>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<DisplayProfile[]>([]);
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<DisplayProfile | null>(null);

  useEffect(() => {
    async function init() {
      const { data } = await getSupabase().auth.getSession();
      if (!data.session) { setReady(true); return; }
      setAuthed(true);

      let students = await apiFetchStudents();
      if (students.length === 0 && data.session.user.email === DEFAULT_PARENT_EMAIL) {
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
    setActiveProfileId(profile.id);
    // Only set default mode if not previously configured — don't override in-session choices
    const stored = typeof window !== 'undefined' ? localStorage.getItem(`mode:${profile.id}`) : null;
    if (!stored) saveMode(profile.id, profile.learningMode);
    setSelectedProfile(null);
    router.push(route);
  }

  if (!ready) return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Chargement…</div>;
  if (!authed) return <LandingScreen />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12">
      {selectedProfile && (
        <ModeSheet profile={selectedProfile}
          onSelect={(route) => startSession(selectedProfile, route)}
          onClose={() => setSelectedProfile(null)} />
      )}
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="text-5xl mb-3">✨</div>
          <h1 className="text-3xl font-black text-[#1a1a2e] tracking-tight">Qui joue aujourd'hui ?</h1>
          <p className="text-xs text-slate-400">Choisissez l'activité après avoir sélectionné le joueur.</p>
        </div>
        <div className="space-y-3">
          {profiles.map((p) => <ProfileCard key={p.id} profile={p} onSelect={() => setSelectedProfile(p)} />)}
          {profiles.length === 0 && <div className="text-center py-8 text-slate-400 text-sm"><p>Aucun élève configuré.</p><Link href="/parent" className="text-violet-600 font-semibold mt-2 block">Ajouter des élèves →</Link></div>}
          <Link href="/parent" className="w-full flex items-center gap-4 rounded-2xl p-5 border-2 border-dashed border-violet-200 hover:border-violet-400 transition-colors">
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-violet-50 flex items-center justify-center text-2xl">+</div>
            <div className="text-left"><div className="text-violet-600 font-bold">Gérer les élèves</div><div className="text-slate-400 text-sm">Ajouter, modifier ou supprimer</div></div>
          </Link>
        </div>
        <div className="flex justify-center gap-4">
          <Link href="/faq" className="text-xs text-slate-400 hover:text-slate-600">❓ FAQ</Link>
          <Link href="/releases" className="text-xs text-slate-400 hover:text-slate-600">📋 Versions</Link>
          <Link href="/parent" className="text-xs text-slate-400 hover:text-slate-600">👤 Espace parent</Link>
        </div>
      </div>
    </div>
  );
}
