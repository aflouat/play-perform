import type { ReadingLevel, ReadingWord } from '@/types';
import { getWordsForLevel } from './reading-words';

export interface ReadingChallenge {
  target: ReadingWord;
  /** 3 images proposées (dont la bonne), dans un ordre aléatoire */
  options: ReadingWord[];
}

export const READING_SESSION_LENGTH = 6;

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Tire `length` mots distincts du niveau, chacun avec 2 intrus du même niveau. */
export function buildReadingSession(
  level: ReadingLevel,
  length: number = READING_SESSION_LENGTH,
  random: () => number = Math.random,
): ReadingChallenge[] {
  const pool = getWordsForLevel(level);
  return shuffle(pool, random).slice(0, length).map((target) => {
    const distractors = shuffle(pool.filter((w) => w.id !== target.id), random).slice(0, 2);
    return { target, options: shuffle([target, ...distractors], random) };
  });
}
