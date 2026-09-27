import type { ReadingLevel, ReadingWord } from '@/types';

/**
 * Mots de lecture annotés à la main (voir parseSyllables).
 * Niveau 1 : 2 syllabes simples · 2 : 3 syllabes simples · 3 : sons complexes (ou, on, oi, ch…)
 * 4 : lettres muettes. `say` corrige la synthèse vocale quand une syllabe isolée est mal lue.
 */
export const READING_WORDS: ReadingWord[] = [
  // ── Niveau 1 ──
  { id: 'moto', text: 'mo-to', emoji: '🏍️', level: 1 },
  { id: 'velo', text: 'vé-lo', emoji: '🚲', level: 1 },
  { id: 'lama', text: 'la-ma', emoji: '🦙', level: 1 },
  { id: 'papa', text: 'pa-pa', emoji: '👨', level: 1 },
  { id: 'cafe', text: 'ca-fé', emoji: '☕', level: 1 },
  { id: 'sofa', text: 'so-fa', emoji: '🛋️', level: 1 },
  { id: 'kiwi', text: 'ki-wi', emoji: '🥝', level: 1, say: ['ki', 'oui'] },
  { id: 'judo', text: 'ju-do', emoji: '🥋', level: 1 },
  { id: 'lune', text: 'lu-ne', emoji: '🌙', level: 1 },
  { id: 'rose', text: 'ro-se', emoji: '🌹', level: 1, say: ['ro', 'ze'] },
  // ── Niveau 2 ──
  { id: 'ecole', text: 'É-co-le', emoji: '🏫', level: 2 },
  { id: 'tomate', text: 'to-ma-te', emoji: '🍅', level: 2 },
  { id: 'banane', text: 'ba-na-ne', emoji: '🍌', level: 2 },
  { id: 'tulipe', text: 'tu-li-pe', emoji: '🌷', level: 2 },
  { id: 'radio', text: 'ra-di-o', emoji: '📻', level: 2 },
  { id: 'pirate', text: 'pi-ra-te', emoji: '🏴‍☠️', level: 2 },
  { id: 'salade', text: 'sa-la-de', emoji: '🥗', level: 2 },
  { id: 'piano', text: 'pi-a-no', emoji: '🎹', level: 2 },
  { id: 'camera', text: 'ca-mé-ra', emoji: '📷', level: 2 },
  { id: 'canari', text: 'ca-na-ri', emoji: '🐤', level: 2 },
  // ── Niveau 3 ──
  { id: 'mouton', text: 'mou-ton', emoji: '🐑', level: 3 },
  { id: 'oiseau', text: 'oi-seau', emoji: '🐦', level: 3, say: ['oi', 'zo'] },
  { id: 'maison', text: 'mai-son', emoji: '🏠', level: 3, say: ['mè', 'zon'] },
  { id: 'cadeau', text: 'ca-deau', emoji: '🎁', level: 3, say: ['ca', 'do'] },
  { id: 'poule', text: 'pou-le', emoji: '🐔', level: 3 },
  { id: 'lion', text: 'li-on', emoji: '🦁', level: 3 },
  { id: 'chameau', text: 'cha-meau', emoji: '🐫', level: 3, say: ['cha', 'mo'] },
  { id: 'bougie', text: 'bou-gie', emoji: '🕯️', level: 3, say: ['bou', 'ji'] },
  { id: 'ballon', text: 'bal-lon', emoji: '🎈', level: 3 },
  { id: 'dauphin', text: 'dau-phin', emoji: '🐬', level: 3, say: ['do', 'fin'] },
  // ── Niveau 4 : lettres muettes ──
  { id: 'chat', text: 'cha(t)', emoji: '🐱', level: 4 },
  { id: 'blanc', text: 'blan(c)', emoji: '🤍', level: 4 },
  { id: 'lit', text: 'li(t)', emoji: '🛏️', level: 4 },
  { id: 'robot', text: 'ro-bo(t)', emoji: '🤖', level: 4 },
  { id: 'souris', text: 'sou-ri(s)', emoji: '🐭', level: 4 },
  { id: 'riz', text: 'ri(z)', emoji: '🍚', level: 4 },
  { id: 'loup', text: 'lou(p)', emoji: '🐺', level: 4 },
  { id: 'chocolat', text: 'cho-co-la(t)', emoji: '🍫', level: 4 },
  { id: 'hiver', text: '(h)i-ver', emoji: '❄️', level: 4 },
  { id: 'leopard', text: 'lé-o-par(d)', emoji: '🐆', level: 4 },
];

export const READING_LEVELS: { level: ReadingLevel; label: string }[] = [
  { level: 1, label: '2 syllabes' },
  { level: 2, label: '3 syllabes' },
  { level: 3, label: 'Sons ou, on, oi…' },
  { level: 4, label: 'Lettres muettes' },
];

export function getWordsForLevel(level: ReadingLevel): ReadingWord[] {
  return READING_WORDS.filter((w) => w.level === level);
}
