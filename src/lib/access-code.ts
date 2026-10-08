import { randomInt } from 'node:crypto';

/** No 0/O/1/I/L: codes are typed by children from a sheet of paper. */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const LENGTH = 8;

export function generateAccessCode(): string {
  return Array.from({ length: LENGTH }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
}

/** Upper-case, without spaces or dashes. */
export function normalizeAccessCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export { formatAccessCode } from './access-code-format';
