'use client';

import React from 'react';
import type { Avatar, AvatarId } from '@/types';
import { AvatarCard } from '@/components/ui/AvatarCard';

interface AvatarPickerProps {
  allAvatars: Avatar[];
  currentXp: number;
  selectedId: AvatarId | null;
  onSelect: (id: AvatarId) => void;
}

export function AvatarPicker({ allAvatars, currentXp, selectedId, onSelect }: AvatarPickerProps) {
  return (
    <div>
      <h2 className="text-base font-black text-[#1a1a2e] mb-1">Ton personnage</h2>
      <p className="text-slate-400 text-xs mb-4">
        Gagne de l&apos;XP pour débloquer de nouveaux avatars
      </p>

      <div
        className="grid grid-cols-3 gap-2"
        role="group"
        aria-label="Sélecteur d'avatar"
      >
        {allAvatars.map((avatar) => (
          <AvatarCard
            key={avatar.id}
            avatar={avatar}
            isSelected={selectedId === avatar.id}
            isLocked={avatar.unlockXp > currentXp}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
