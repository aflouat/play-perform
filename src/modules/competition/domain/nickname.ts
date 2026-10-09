import { hash32 } from './seed';

export type NicknameResult = { ok: true; value: string } | { ok: false; error: string };
export type NameResult = { ok: true; value: string } | { ok: false; error: string };

/** Real names, kept for the diploma only: letters, spaces, hyphens, apostrophes. */
export function validatePersonName(input: unknown): NameResult {
  const value = typeof input === 'string' ? input.trim().replace(/\s+/g, ' ') : '';
  if (!/^[\p{L}][\p{L} '’-]{0,39}$/u.test(value)) return { ok: false, error: 'Nom ou prénom invalide : lettres uniquement (40 caractères maximum).' };
  return { ok: true, value };
}

/** Lower case without accents, to compare a pseudonym with a real name. */
const fold = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export interface RealNames { firstName?: string | null; lastName?: string | null }

/**
 * Pseudonyms replace names in rankings and in the community: 3-20 letters, digits, "_" or "-" (no spaces: no "first name last name").
 * With the real names, a pseudonym that contains one of them (3 letters or more) is refused.
 */
export function validateNickname(input: unknown, real: RealNames = {}): NicknameResult {
  const value = typeof input === 'string' ? input.trim() : '';
  if (!/^[\p{L}\p{N}_-]{3,20}$/u.test(value)) return { ok: false, error: 'Le pseudo comporte 3 à 20 caractères : lettres, chiffres, « _ » ou « - », sans espace.' };
  const folded = fold(value);
  const reveals = [real.firstName, real.lastName].some((name) => {
    const part = name ? fold(name).replace(/[^a-z]/g, '') : '';
    return part.length >= 3 && folded.includes(part);
  });
  if (reveals) return { ok: false, error: 'Ton pseudo ne doit pas contenir ton prénom ni ton nom : les autres élèves ne voient que le pseudo.' };
  return { ok: true, value };
}

const ADJECTIVES = ['Rapide', 'Malin', 'Brave', 'Joyeux', 'Curieux', 'Agile', 'Futé', 'Solaire', 'Bleu', 'Vaillant', 'Zen', 'Épique'];
const ANIMALS = ['Renard', 'Lynx', 'Panda', 'Dauphin', 'Hibou', 'Tigre', 'Koala', 'Faucon', 'Loutre', 'Lama', 'Phénix', 'Ours'];

/** A friendly pseudonym derived from a seed (e.g. the student id): same seed, same pseudonym. */
export function generateNickname(seed: string): string {
  const h = hash32(seed);
  return `${ANIMALS[h % ANIMALS.length]}${ADJECTIVES[Math.floor(h / ANIMALS.length) % ADJECTIVES.length]}${h % 100}`;
}
