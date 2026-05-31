import type { Badge, BadgeId } from '@/types';

export const ALL_BADGES: Badge[] = [
  { id: 'first-quiz', name: 'Premier Quiz', emoji: '🎯', description: 'Tu as complété ton premier quiz !', unlockedAt: null },
  { id: 'streak-3', name: '3 jours de suite', emoji: '🔥', description: '3 jours d\'affilée sur la plateforme', unlockedAt: null },
  { id: 'streak-7', name: 'Une semaine !', emoji: '⚡', description: '7 jours consécutifs de travail', unlockedAt: null },
  { id: 'perfect-quiz', name: 'Quiz parfait', emoji: '⭐', description: 'Score parfait sur un quiz', unlockedAt: null },
  { id: 'fast-learner', name: 'Rapide !', emoji: '💨', description: 'Quiz complété en moins de 2 minutes', unlockedAt: null },
  { id: 'knowledge-seeker', name: 'Chercheur·euse', emoji: '🔍', description: '500 XP gagnés au total', unlockedAt: null },
];

export function unlockBadge(badges: Badge[], id: BadgeId): Badge[] {
  if (badges.some((b) => b.id === id && b.unlockedAt)) return badges;
  const template = ALL_BADGES.find((b) => b.id === id);
  if (!template) return badges;
  const existing = badges.find((b) => b.id === id);
  if (existing) {
    return badges.map((b) => (b.id === id ? { ...b, unlockedAt: new Date() } : b));
  }
  return [...badges, { ...template, unlockedAt: new Date() }];
}
