'use client';

import React from 'react';
import type { Avatar } from '@/types';
import clsx from 'clsx';

interface AvatarCardProps {
  avatar: Avatar;
  isSelected: boolean;
  isLocked: boolean;
  onSelect: (id: Avatar['id']) => void;
}

export function AvatarCard({ avatar, isSelected, isLocked, onSelect }: AvatarCardProps) {
  return (
    <button
      onClick={() => !isLocked && onSelect(avatar.id)}
      disabled={isLocked}
      aria-pressed={isSelected}
      aria-label={`${isLocked ? 'Verrouillé — ' : ''}Choisir l'avatar ${avatar.name}`}
      className={clsx(
        'relative flex flex-col items-center gap-2 rounded-2xl p-3 transition-all duration-200',
        isSelected && 'bg-amber-50 ring-2 ring-amber-400 scale-105',
        !isSelected && !isLocked && 'bg-slate-50 hover:bg-white hover:shadow-md active:scale-95',
        isLocked && 'bg-slate-50 opacity-50 cursor-not-allowed',
      )}
    >
      <div
        className={clsx(
          'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl shadow',
          avatar.color,
          isLocked && 'grayscale',
        )}
        role="img"
        aria-label={avatar.emoji}
      >
        {isLocked ? '🔒' : avatar.emoji}
      </div>

      <span className="text-xs font-bold text-[#1a1a2e] leading-tight text-center">
        {avatar.name}
      </span>

      {isLocked && (
        <span className="text-xs text-amber-500 font-semibold leading-none">
          {avatar.unlockXp} XP
        </span>
      )}

      {isSelected && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-white text-xs font-black shadow">
          ✓
        </span>
      )}
    </button>
  );
}
