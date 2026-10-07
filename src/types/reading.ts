/** Types du module Lecture syllabique. */

export type ReadingLevel = 1 | 2 | 3 | 4;

/** Mot annoté à la main : `-` sépare les syllabes, `()` entoure les lettres muettes. */
export interface ReadingWord {
  id: string;
  /** Notation syllabique, ex. 'É-co-le', 'blan(c)', 'pa-ren(ts)' */
  text: string;
  emoji: string;
  level: ReadingLevel;
  /** Prononciation TTS par syllabe si la voix lit mal la syllabe isolée */
  say?: string[];
  imageUrl?: string;
}

export interface SyllableSegment {
  text: string;
  silent: boolean;
}

export interface Syllable {
  segments: SyllableSegment[];
  /** Texte envoyé à la synthèse vocale */
  spoken: string;
  /** 0 / 1 : alternance des couleurs (syllabes prononcées uniquement) */
  colorIndex: 0 | 1;
}

export interface ParsedWord {
  /** Mot sans notation, ex. 'blanc' */
  word: string;
  syllables: Syllable[];
}

export type ReadingActivity = 'discover' | 'read-choose';
