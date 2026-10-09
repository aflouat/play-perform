import { hash32 } from './seed';

export type NicknameResult = { ok: true; value: string } | { ok: false; error: string };

/** Pseudonyms replace names in rankings: 3-20 letters, digits, "_" or "-" (no spaces: no "first name last name"). */
export function validateNickname(input: unknown): NicknameResult {
  const value = typeof input === 'string' ? input.trim() : '';
  if (!/^[\p{L}\p{N}_-]{3,20}$/u.test(value)) return { ok: false, error: 'Le pseudo comporte 3 à 20 caractères : lettres, chiffres, « _ » ou « - », sans espace.' };
  return { ok: true, value };
}

const ADJECTIVES = ['Rapide', 'Malin', 'Brave', 'Joyeux', 'Curieux', 'Agile', 'Futé', 'Solaire', 'Bleu', 'Vaillant', 'Zen', 'Épique'];
const ANIMALS = ['Renard', 'Lynx', 'Panda', 'Dauphin', 'Hibou', 'Tigre', 'Koala', 'Faucon', 'Loutre', 'Lama', 'Phénix', 'Ours'];

/** A friendly pseudonym derived from a seed (e.g. the student id): same seed, same pseudonym. */
export function generateNickname(seed: string): string {
  const h = hash32(seed);
  return `${ANIMALS[h % ANIMALS.length]}${ADJECTIVES[Math.floor(h / ANIMALS.length) % ADJECTIVES.length]}${h % 100}`;
}
