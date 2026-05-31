export type LearningMode = 'assisted' | 'advanced';

const STORAGE_KEY = (profileId: string) => `mode:${profileId}`;

// Default mode per profile — Esma starts in assisté, others in avancé
export const DEFAULT_MODE: Record<string, LearningMode> = {
  esma: 'assisted',
  omar: 'advanced',
  mohamed: 'advanced',
};

export function loadMode(profileId: string): LearningMode {
  if (typeof window === 'undefined') return DEFAULT_MODE[profileId] ?? 'advanced';
  const stored = localStorage.getItem(STORAGE_KEY(profileId));
  if (stored === 'assisted' || stored === 'advanced') return stored;
  return DEFAULT_MODE[profileId] ?? 'advanced';
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
