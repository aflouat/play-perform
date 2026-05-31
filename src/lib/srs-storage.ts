import type { QuestionProgress } from '@/types';

const STORAGE_KEY = (profileId: string, subject: string) =>
  `srs:${profileId}:${subject}`;

export function loadProgressMap(
  profileId: string,
  subject: string,
): Record<string, QuestionProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY(profileId, subject));
    return raw ? (JSON.parse(raw) as Record<string, QuestionProgress>) : {};
  } catch { return {}; }
}

export function saveProgressMap(
  profileId: string,
  subject: string,
  map: Record<string, QuestionProgress>,
): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY(profileId, subject), JSON.stringify(map));
}
