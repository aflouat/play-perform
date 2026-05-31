export interface KeyboardChallenge {
  id: string;
  letter: string;
  key: string;
  emoji: string;
  word: string;
  color: string;
}

export type KeyboardLevel = 1 | 2 | 3 | 4;

const LETTER_META: Record<string, { emoji: string; word: string; color: string }> = {
  a: { emoji: '🍍', word: 'Ananas', color: 'bg-yellow-500' },
  b: { emoji: '🍌', word: 'Banane', color: 'bg-yellow-400' },
  c: { emoji: '🐱', word: 'Chat', color: 'bg-orange-400' },
  d: { emoji: '🐬', word: 'Dauphin', color: 'bg-blue-400' },
  e: { emoji: '⭐', word: 'Étoile', color: 'bg-amber-400' },
  f: { emoji: '🌸', word: 'Fleur', color: 'bg-pink-400' },
  g: { emoji: '🦒', word: 'Girafe', color: 'bg-yellow-500' },
  h: { emoji: '🏠', word: 'Maison', color: 'bg-sky-400' },
  i: { emoji: '🌈', word: 'Arc-en-ciel', color: 'bg-violet-400' },
  j: { emoji: '🐆', word: 'Jaguar', color: 'bg-orange-500' },
  k: { emoji: '🥝', word: 'Kiwi', color: 'bg-lime-500' },
  l: { emoji: '🦁', word: 'Lion', color: 'bg-amber-500' },
  m: { emoji: '🌙', word: 'Lune', color: 'bg-indigo-400' },
  n: { emoji: '☁️', word: 'Nuage', color: 'bg-slate-400' },
  o: { emoji: '🍊', word: 'Orange', color: 'bg-orange-400' },
  p: { emoji: '🐧', word: 'Pingouin', color: 'bg-slate-500' },
  q: { emoji: '🦆', word: 'Canard', color: 'bg-yellow-400' },
  r: { emoji: '🌹', word: 'Rose', color: 'bg-red-500' },
  s: { emoji: '☀️', word: 'Soleil', color: 'bg-yellow-400' },
  t: { emoji: '🐢', word: 'Tortue', color: 'bg-green-500' },
  u: { emoji: '🦄', word: 'Licorne', color: 'bg-pink-500' },
  v: { emoji: '🚀', word: 'Fusée', color: 'bg-blue-500' },
  w: { emoji: '🐺', word: 'Loup', color: 'bg-gray-500' },
  x: { emoji: '🎸', word: 'Guitare', color: 'bg-rose-500' },
  y: { emoji: '🎈', word: 'Ballon', color: 'bg-red-400' },
  z: { emoji: '🦓', word: 'Zèbre', color: 'bg-gray-800' },
};

function makeChallenge(letter: string): KeyboardChallenge {
  const meta = LETTER_META[letter] ?? { emoji: '❓', word: letter.toUpperCase(), color: 'bg-slate-400' };
  return {
    id: letter,
    letter: letter.toUpperCase(),
    key: letter,
    emoji: meta.emoji,
    word: meta.word,
    color: meta.color,
  };
}

export const KEYBOARD_LEVELS: Record<KeyboardLevel, KeyboardChallenge[]> = {
  1: ['a', 's', 'd', 'f', 'j', 'k', 'l'].map(makeChallenge),
  2: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map(makeChallenge),
  3: ['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(makeChallenge),
  4: Object.keys(LETTER_META).map(makeChallenge),
};

export function getChallengesForLevel(level: KeyboardLevel, count = 8): KeyboardChallenge[] {
  const pool = [...KEYBOARD_LEVELS[level]].sort(() => Math.random() - 0.5);
  return pool.slice(0, Math.min(count, pool.length));
}

export function getLevelLabel(level: KeyboardLevel): string {
  const labels: Record<KeyboardLevel, string> = {
    1: 'Rangée du milieu',
    2: 'Rangée du haut',
    3: 'Rangée du bas',
    4: 'Toutes les lettres',
  };
  return labels[level];
}
