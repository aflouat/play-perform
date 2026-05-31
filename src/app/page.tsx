'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { PROFILES, setActiveProfileId, getActiveProfileId, clearActiveProfile, getHomeRouteForProfile } from '@/lib/profiles';
import { fetchStudents, insertStudent } from '@/lib/db';
import type { DbStudent } from '@/lib/db';
import { useScore } from '@/hooks/useScore';

interface DisplayProfile {
  id: string;
  name: string;
  emoji: string;
  gradient: string;
  tagline: string;
  homeRoute: string;
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  );
}

const DEFAULT_PARENT_EMAIL = 'aflouat@gmail.com';

const DEFAULT_STUDENTS_SEED = [
  { name: 'Omar',    emoji: '🧑‍🎓', gradient: 'from-sky-400 to-blue-500',     grade: '6ème',      tagline: 'Objectif : brevet',      age: 12 },
  { name: 'Esma',   emoji: '🌸',   gradient: 'from-pink-400 to-rose-500',    grade: 'CP adapté', tagline: 'Mots & phrases',          age: 9  },
  { name: 'Mohamed',emoji: '🚀',   gradient: 'from-emerald-400 to-teal-500', grade: 'CP',        tagline: 'Apprends le clavier !',   age: 6  },
] as const;

function getHomeRouteForStudent(s: DbStudent): string {
  if ((s.age ?? 10) <= 7) return '/keyboard';
  if (s.grade?.toLowerCase().includes('cp')) return '/esma';
  return '/home';
}

function toDisplayProfile(s: DbStudent): DisplayProfile {
  return {
    id: s.id ?? s.name,
    name: s.name,
    emoji: s.emoji,
    gradient: s.gradient,
    tagline: `${s.grade} · ${s.age} ans`,
    homeRoute: getHomeRouteForStudent(s),
  };
}

function ProfileCard({ profile, onSelect }: { profile: DisplayProfile; onSelect: () => void }) {
  const { score } = useScore(profile.id);
  return (
    <button onClick={onSelect}
      className="group w-full flex items-center gap-4 rounded-2xl p-5 bg-white shadow-md hover:shadow-xl active:scale-[0.97] transition-all duration-200"
      aria-label={`Jouer en tant que ${profile.name}`}>
      <div className={`w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br ${profile.gradient} flex items-center justify-center text-3xl shadow group-hover:scale-110 transition-transform duration-200`}>
        {profile.emoji}
      </div>
      <div className="text-left flex-1">
        <div className="text-[#1a1a2e] font-black text-lg">{profile.name}</div>
        <div className="text-slate-500 text-sm">{profile.tagline}</div>
        <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 border border-amber-200">
          <span className="text-amber-600 text-xs font-bold">⭐ Niv.{score.level}</span>
          <span className="text-amber-400 text-xs">· {score.xp} XP</span>
        </div>
      </div>
      <span className="text-slate-300 text-lg">→</span>
    </button>
  );
}

export default function WelcomePage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<DisplayProfile[]>([]);
  const [parentLogged, setParentLogged] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      const { data } = await getSupabase().auth.getSession();
      let resolvedProfiles: DisplayProfile[];
      if (data.session) {
        setParentLogged(true);
        let students = await fetchStudents();

        // Auto-seed default profiles for the default parent account
        if (students.length === 0 && data.session.user.email === DEFAULT_PARENT_EMAIL) {
          await Promise.all(
            DEFAULT_STUDENTS_SEED.map((s) => insertStudent(s, data.session!.user.id)),
          );
          students = await fetchStudents();
        }

        if (students.length > 0) {
          resolvedProfiles = students.map(toDisplayProfile);
          setProfiles(resolvedProfiles);
          const ids = new Set(resolvedProfiles.map((p) => p.id));
          const stale = getActiveProfileId();
          if (stale && !ids.has(stale)) clearActiveProfile();
          setReady(true);
          return;
        }
      }
      // Fallback: hardcoded profiles
      resolvedProfiles = PROFILES.map((p) => ({
        id: p.id, name: p.name, emoji: p.emoji,
        gradient: p.gradient, tagline: p.tagline,
        homeRoute: getHomeRouteForProfile(p),
      }));
      const ids = new Set(resolvedProfiles.map((p) => p.id));
      const stale = getActiveProfileId();
      if (stale && !ids.has(stale)) clearActiveProfile();
      setProfiles(resolvedProfiles);
      setReady(true);
    }
    init();
  }, []);

  function handleSelect(profile: DisplayProfile) {
    setActiveProfileId(profile.id);
    router.push(profile.homeRoute);
  }

  if (!ready) return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Chargement…</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="text-5xl mb-3">✨</div>
          <h1 className="text-3xl font-black text-[#1a1a2e] tracking-tight">Bonjour !</h1>
          <p className="text-slate-500 text-base">Qui joue aujourd'hui ?</p>
        </div>

        <div className="space-y-3">
          {profiles.map((p) => (
            <ProfileCard key={p.id} profile={p} onSelect={() => handleSelect(p)} />
          ))}
          {parentLogged && (
            <Link href="/parent"
              className="w-full flex items-center gap-4 rounded-2xl p-5 border-2 border-dashed border-violet-200 hover:border-violet-400 transition-colors">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-violet-50 flex items-center justify-center text-2xl">+</div>
              <div className="text-left">
                <div className="text-violet-600 font-bold">Gérer les élèves</div>
                <div className="text-slate-400 text-sm">Ajouter ou supprimer</div>
              </div>
            </Link>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 pt-2">
          <Link href={parentLogged ? '/parent' : '/auth'}
            className="inline-flex items-center gap-2 rounded-2xl bg-violet-50 border border-violet-200 px-5 py-2.5 text-sm font-semibold text-violet-600 hover:bg-violet-100 transition-all">
            👤 {parentLogged ? 'Mon espace parent' : 'Espace parent'}
          </Link>
          <div className="flex gap-3">
            <Link href="/faq" className="inline-flex items-center gap-1.5 rounded-xl bg-white shadow-sm border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:shadow-md transition-all">
              ❓ FAQ
            </Link>
            <Link href="/releases" className="inline-flex items-center gap-1.5 rounded-xl bg-white shadow-sm border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:shadow-md transition-all">
              📋 Versions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
