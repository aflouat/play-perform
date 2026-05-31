export type WordLang = 'fr' | 'en' | 'es';

export interface WordCard {
  id: string;
  word: string;
  emoji: string;
  lang: WordLang;
  audio?: string;
}

export interface WordChallenge {
  target: WordCard;
  options: [WordCard, WordCard, WordCard];
}

const FR_WORDS: WordCard[] = [
  { id: 'fr-chat', word: 'Chat', emoji: '🐱', lang: 'fr' },
  { id: 'fr-chien', word: 'Chien', emoji: '🐶', lang: 'fr' },
  { id: 'fr-maison', word: 'Maison', emoji: '🏠', lang: 'fr' },
  { id: 'fr-soleil', word: 'Soleil', emoji: '☀️', lang: 'fr' },
  { id: 'fr-fleur', word: 'Fleur', emoji: '🌸', lang: 'fr' },
  { id: 'fr-oiseau', word: 'Oiseau', emoji: '🐦', lang: 'fr' },
  { id: 'fr-pomme', word: 'Pomme', emoji: '🍎', lang: 'fr' },
  { id: 'fr-arbre', word: 'Arbre', emoji: '🌳', lang: 'fr' },
];

const EN_WORDS: WordCard[] = [
  { id: 'en-cat', word: 'Cat', emoji: '🐱', lang: 'en' },
  { id: 'en-dog', word: 'Dog', emoji: '🐶', lang: 'en' },
  { id: 'en-sun', word: 'Sun', emoji: '☀️', lang: 'en' },
  { id: 'en-flower', word: 'Flower', emoji: '🌸', lang: 'en' },
  { id: 'en-star', word: 'Star', emoji: '⭐', lang: 'en' },
  { id: 'en-bird', word: 'Bird', emoji: '🐦', lang: 'en' },
  { id: 'en-apple', word: 'Apple', emoji: '🍎', lang: 'en' },
  { id: 'en-tree', word: 'Tree', emoji: '🌳', lang: 'en' },
];

const ES_WORDS: WordCard[] = [
  { id: 'es-gato', word: 'Gato', emoji: '🐱', lang: 'es' },
  { id: 'es-perro', word: 'Perro', emoji: '🐶', lang: 'es' },
  { id: 'es-sol', word: 'Sol', emoji: '☀️', lang: 'es' },
  { id: 'es-flor', word: 'Flor', emoji: '🌸', lang: 'es' },
  { id: 'es-estrella', word: 'Estrella', emoji: '⭐', lang: 'es' },
  { id: 'es-pajaro', word: 'Pájaro', emoji: '🐦', lang: 'es' },
  { id: 'es-manzana', word: 'Manzana', emoji: '🍎', lang: 'es' },
  { id: 'es-arbol', word: 'Árbol', emoji: '🌳', lang: 'es' },
];

export const ALL_WORDS: Record<WordLang, WordCard[]> = {
  fr: FR_WORDS,
  en: EN_WORDS,
  es: ES_WORDS,
};

export function buildWordChallenge(lang: WordLang): WordChallenge {
  const pool = [...ALL_WORDS[lang]].sort(() => Math.random() - 0.5);
  const target = pool[0];
  const others = pool.slice(1, 3) as [WordCard, WordCard];
  const options = shuffle([target, ...others]) as [WordCard, WordCard, WordCard];
  return { target, options };
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export const LANG_LABELS: Record<WordLang, string> = {
  fr: '🇫🇷 Français',
  en: '🇬🇧 English',
  es: '🇪🇸 Español',
};
