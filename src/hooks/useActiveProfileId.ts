'use client';

import { useSyncExternalStore } from 'react';
import { getActiveProfileId } from '@/lib/profiles';

const NONE = '__none__';

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): string {
  return getActiveProfileId() ?? NONE;
}

function getServerSnapshot(): string {
  return NONE;
}

/**
 * Lit l'identifiant du profil actif depuis localStorage de façon SSR-safe,
 * sans effet ni setState (pas de cascade de rendus).
 * Retourne '__none__' tant qu'aucun profil n'est sélectionné.
 */
export function useActiveProfileId(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
