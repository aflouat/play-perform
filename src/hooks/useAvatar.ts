'use client';

import { useState, useCallback } from 'react';
import type { Avatar, AvatarId } from '@/types';
import { AVATARS, getAvatarById, getUnlockedAvatars } from '@/lib/avatars';

const STORAGE_KEY = (userId: string) => `avatar:${userId}`;

function loadFromStorage(userId: string): AvatarId | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY(userId));
    return raw as AvatarId | null;
  } catch {
    return null;
  }
}

interface UseAvatarReturn {
  avatarId: AvatarId | null;
  avatar: Avatar | null;
  allAvatars: Avatar[];
  unlockedAvatars: Avatar[];
  selectAvatar: (id: AvatarId) => void;
}

/**
 * Gestion de l'avatar choisi par l'utilisateur.
 * Bloque la sélection si l'avatar est verrouillé (XP insuffisant).
 */
export function useAvatar(userId: string, currentXp = 0): UseAvatarReturn {
  const [avatarId, setAvatarId] = useState<AvatarId | null>(() => loadFromStorage(userId));

  const selectAvatar = useCallback(
    (id: AvatarId) => {
      const avatarDef = getAvatarById(id);
      if (!avatarDef) return;
      if (avatarDef.unlockXp > currentXp) return;

      setAvatarId(id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY(userId), id);
      }
    },
    [userId, currentXp],
  );

  return {
    avatarId,
    avatar: avatarId ? (getAvatarById(avatarId) ?? null) : null,
    allAvatars: AVATARS,
    unlockedAvatars: getUnlockedAvatars(currentXp),
    selectAvatar,
  };
}
