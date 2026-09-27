import type { ParsedWord, Syllable, SyllableSegment } from '@/types';

/**
 * Découpe une notation syllabique en syllabes colorables.
 *   'É-co-le'    → É | co | le
 *   'blan(c)'    → blan + c (muet)
 *   'pa-ren(ts)' → pa | ren + ts (muet)
 * `say` remplace le texte prononcé de chaque syllabe (même longueur que les syllabes).
 * Lève une erreur si la notation est invalide : les mots sont écrits à la main, on veut
 * le savoir dès les tests plutôt qu'à l'écran d'un enfant.
 */
export function parseSyllables(notation: string, say?: string[]): ParsedWord {
  const parts = notation.split('-');
  if (parts.some((p) => p.length === 0)) throw new Error(`Notation invalide : « ${notation} »`);
  if (say && say.length !== parts.length) {
    throw new Error(`« ${notation} » : ${parts.length} syllabes mais ${say.length} prononciations`);
  }

  let colorCounter = 0;
  const syllables: Syllable[] = parts.map((part, i) => {
    const segments = parseSegments(part, notation);
    const spokenText = segments.filter((s) => !s.silent).map((s) => s.text).join('');
    if (!spokenText) throw new Error(`« ${notation} » : syllabe entièrement muette`);
    const colorIndex = (colorCounter++ % 2) as 0 | 1;
    return { segments, spoken: say?.[i] ?? spokenText, colorIndex };
  });

  const word = syllables.flatMap((s) => s.segments.map((seg) => seg.text)).join('');
  return { word, syllables };
}

function parseSegments(part: string, notation: string): SyllableSegment[] {
  const segments: SyllableSegment[] = [];
  let buffer = '';
  let silent = false;

  const flush = () => {
    if (buffer) segments.push({ text: buffer, silent });
    buffer = '';
  };

  for (const char of part) {
    if (char === '(') {
      if (silent) throw new Error(`« ${notation} » : parenthèses imbriquées`);
      flush();
      silent = true;
    } else if (char === ')') {
      if (!silent || !buffer) throw new Error(`« ${notation} » : parenthèse fermante invalide`);
      flush();
      silent = false;
    } else {
      buffer += char;
    }
  }
  if (silent) throw new Error(`« ${notation} » : parenthèse non fermée`);
  flush();
  return segments;
}
