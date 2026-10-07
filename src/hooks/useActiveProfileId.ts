'use client';

import { useSyncExternalStore } from 'react';
import { getActiveProfileId, getActiveProfileMeta } from '@/lib/profiles';

const NONE = '__none__';
/** Valeur pendant le SSR et l'hydratation : profil pas encore lu (ne pas rediriger). */
const LOADING = '__loading__';

/** Vrai quand l'id désigne un vrai profil (ni absent, ni en cours de lecture). */
export function isProfileReady(profileId: string): boolean {
  return profileId !== NONE && profileId !== LOADING;
}

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): string {
  return getActiveProfileId() ?? NONE;
}

function getServerSnapshot(): string {
  return LOADING;
}

/**
 * Lit l'identifiant du profil actif depuis localStorage de façon SSR-safe,
 * sans effet ni setState (pas de cascade de rendus).
 * Retourne '__loading__' pendant le SSR / l'hydratation, puis '__none__' si aucun profil
 * n'est sélectionné (→ redirection), sinon l'id.
 */
export function useActiveProfileId(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function getNameSnapshot(): string | null {
  return getActiveProfileMeta()?.name ?? null;
}

/** Prénom du profil actif (élève Supabase), null si inconnu. SSR-safe. */
export function useActiveProfileName(): string | null {
  return useSyncExternalStore(subscribe, getNameSnapshot, () => null);
}
