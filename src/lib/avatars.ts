import type { Avatar } from '@/types';

export const AVATARS: Avatar[] = [
  {
    id: 'astronaut',
    name: 'Astronaute',
    emoji: '🧑‍🚀',
    color: 'from-sky-500 to-blue-600',
    unlockXp: 0,
    description: "Explorateur de l'univers et des savoirs",
  },
  {
    id: 'scientist',
    name: 'Scientifique',
    emoji: '🧪',
    color: 'from-emerald-500 to-teal-600',
    unlockXp: 0,
    description: 'Curieux·se des sciences et de la nature',
  },
  {
    id: 'ninja',
    name: 'Ninja',
    emoji: '🥷',
    color: 'from-slate-500 to-slate-700',
    unlockXp: 0,
    description: 'Rapide, discret·e, toujours concentré·e',
  },
  {
    id: 'explorer',
    name: 'Explorateur·ice',
    emoji: '🗺️',
    color: 'from-amber-500 to-orange-600',
    unlockXp: 100,
    description: 'Découvreur·euse de nouveaux horizons',
  },
  {
    id: 'wizard',
    name: 'Sorcier·ère',
    emoji: '🧙',
    color: 'from-purple-500 to-violet-700',
    unlockXp: 250,
    description: 'Maître·sse des formules et des mystères',
  },
  {
    id: 'robot',
    name: 'Robot',
    emoji: '🤖',
    color: 'from-rose-500 to-pink-700',
    unlockXp: 500,
    description: 'Cerveau logique, mémoire infaillible',
  },
];

export function getAvatarById(id: string): Avatar | undefined {
  return AVATARS.find((a) => a.id === id);
}

export function getUnlockedAvatars(xp: number): Avatar[] {
  return AVATARS.filter((a) => a.unlockXp <= xp);
}
