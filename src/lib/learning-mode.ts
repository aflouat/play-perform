export type LearningMode = 'assisted' | 'advanced';

const STORAGE_KEY = (profileId: string) => `mode:${profileId}`;

export function loadMode(profileId: string, defaultMode: LearningMode = 'advanced'): LearningMode {
  if (typeof window === 'undefined') return defaultMode;
  const stored = localStorage.getItem(STORAGE_KEY(profileId));
  if (stored === 'assisted' || stored === 'advanced') return stored;
  return defaultMode;
}

export function saveMode(profileId: string, mode: LearningMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY(profileId), mode);
}

export const MODE_LABELS: Record<LearningMode, { label: string; emoji: string; description: string }> = {
  assisted: {
    label: 'Assisté',
    emoji: '🤝',
    description: 'Sons, images, couleurs et indices disponibles',
  },
  advanced: {
    label: 'Avancé',
    emoji: '🚀',
    description: 'Travail autonome, sans aide automatique',
  },
};

export const STUDENT_MODE_LABELS: Record<string, { label: string; emoji: string; description: string; route: string }> = {
  quiz:     { label: 'Quiz',    emoji: '📚', description: 'Matières scolaires, brevet',        route: '/home'     },
  words:    { label: 'Mots',    emoji: '🌸', description: 'Mots illustrés FR/EN/ES, phrases',  route: '/esma'     },
  keyboard: { label: 'Clavier', emoji: '⌨️', description: 'Lettres, mots, sciences',            route: '/keyboard' },
};
