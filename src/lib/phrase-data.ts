export interface TypingWord {
  id: string;
  text: string;
  emoji: string;
  hint: string;
}

const WORDS_LEVEL1: TypingWord[] = [
  { id: 'w-chat', text: 'CHAT', emoji: '🐱', hint: 'Il dit miaou !' },
  { id: 'w-chien', text: 'CHIEN', emoji: '🐶', hint: 'Il dit ouaf !' },
  { id: 'w-lune', text: 'LUNE', emoji: '🌙', hint: 'Elle brille la nuit' },
  { id: 'w-soleil', text: 'SOLEIL', emoji: '☀️', hint: 'Il brille le jour' },
  { id: 'w-fleur', text: 'FLEUR', emoji: '🌸', hint: 'Elle sent bon' },
  { id: 'w-arbre', text: 'ARBRE', emoji: '🌳', hint: 'Il a des feuilles' },
  { id: 'w-maison', text: 'MAISON', emoji: '🏠', hint: 'On y habite' },
];

const WORDS_LEVEL2: TypingWord[] = [
  { id: 'w-ballon', text: 'BALLON', emoji: '🎈', hint: 'Il monte en l\'air' },
  { id: 'w-gateau', text: 'GATEAU', emoji: '🎂', hint: 'On le mange à l\'anniversaire' },
  { id: 'w-etoile', text: 'ETOILE', emoji: '⭐', hint: 'Elle est dans le ciel' },
  { id: 'w-poisson', text: 'POISSON', emoji: '🐟', hint: 'Il nage dans l\'eau' },
  { id: 'w-lapin', text: 'LAPIN', emoji: '🐰', hint: 'Il a de grandes oreilles' },
  { id: 'w-nuage', text: 'NUAGE', emoji: '☁️', hint: 'Il est dans le ciel' },
];

export const TYPING_LEVELS: Record<1 | 2, TypingWord[]> = {
  1: WORDS_LEVEL1,
  2: WORDS_LEVEL2,
};

export function getTypingWords(level: 1 | 2, count = 5): TypingWord[] {
  const pool = [...TYPING_LEVELS[level]].sort(() => Math.random() - 0.5);
  return pool.slice(0, count);
}
