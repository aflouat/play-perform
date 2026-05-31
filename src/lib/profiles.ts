export type ProfileMode = 'quiz' | 'keyboard' | 'words';

export interface Profile {
  id: string;
  name: string;
  emoji: string;
  gradient: string;
  grade: string;
  tagline: string;
  mode: ProfileMode;
  age: number;
}

export const PROFILES: Profile[] = [
  {
    id: 'omar',
    name: 'Omar',
    emoji: '🧑‍🎓',
    gradient: 'from-sky-400 to-blue-500',
    grade: '6ème',
    tagline: 'Objectif : brevet',
    mode: 'quiz',
    age: 12,
  },
  {
    id: 'esma',
    name: 'Esma',
    emoji: '🌸',
    gradient: 'from-pink-400 to-rose-500',
    grade: 'CP adapté',
    tagline: 'Mots & phrases',
    mode: 'words',
    age: 9,
  },
  {
    id: 'mohamed',
    name: 'Mohamed',
    emoji: '🚀',
    gradient: 'from-emerald-400 to-teal-500',
    grade: 'CP',
    tagline: 'Apprends le clavier !',
    mode: 'keyboard',
    age: 6,
  },
];

const STORAGE_KEY = 'activeProfile';
const META_KEY = 'activeProfileMeta';

export interface ActiveProfileMeta {
  name: string;
  emoji: string;
  gradient: string;
}

export function getActiveProfileId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setActiveProfileId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, id);
}

export function setActiveProfile(id: string, meta: ActiveProfileMeta): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, id);
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function getActiveProfileMeta(): ActiveProfileMeta | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? (JSON.parse(raw) as ActiveProfileMeta) : null;
  } catch { return null; }
}

export function clearActiveProfile(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(META_KEY);
}

export function getProfileById(id: string): Profile | undefined {
  return PROFILES.find((p) => p.id === id);
}

export function getHomeRouteForProfile(profile: Profile): string {
  if (profile.mode === 'keyboard') return '/keyboard';
  if (profile.mode === 'words') return '/esma';
  return '/home';
}
