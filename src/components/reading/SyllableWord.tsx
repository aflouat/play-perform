'use client';

import React, { useMemo } from 'react';
import { parseSyllables } from '@/lib/reading/syllable-notation';
import { readingFont } from '@/lib/reading/reading-font';
import { SYLLABLE_TEXT, SYLLABLE_ARC, SILENT_TEXT, ACTIVE_SYLLABLE } from '@/lib/reading/reading-colors';
import type { ReadingWord, Syllable } from '@/types';

interface Props {
  word: ReadingWord;
  /** Syllabe surlignée (karaoké) ; -1 = mot entier ; null = aucune */
  activeIndex?: number | null;
  onSyllableTap?: (index: number, syllable: Syllable) => void;
  size?: 'lg' | 'xl';
  colored?: boolean;
  showArcs?: boolean;
}

/**
 * Mot découpé en syllabes : couleurs alternées, lettres muettes en gris,
 * arc sous chaque syllabe prononcée (repère indépendant de la couleur).
 */
export function SyllableWord({ word, activeIndex = null, onSyllableTap, size = 'xl', colored = true, showArcs = true }: Props) {
  const parsed = useMemo(() => parseSyllables(word.text, word.say), [word.text, word.say]);
  const textSize = size === 'xl' ? 'text-6xl' : 'text-5xl';

  return (
    <div role="group" aria-label={parsed.word}
      className={`${readingFont.className} ${textSize} font-bold tracking-wide flex flex-wrap items-end justify-center gap-x-1`}>
      {parsed.syllables.map((syllable, i) => {
        const active = activeIndex === i || activeIndex === -1;
        const written = syllable.segments.map((s) => s.text).join('');
        const className = `inline-flex items-end px-1 py-1 transition-colors duration-150 ${active ? ACTIVE_SYLLABLE : ''}`;
        const content = syllable.segments.map((segment, j) => (
          <span key={j} className="inline-flex flex-col items-center">
            <span data-silent={segment.silent || undefined}
              className={segment.silent ? SILENT_TEXT : colored ? SYLLABLE_TEXT[syllable.colorIndex] : 'text-slate-800'}>
              {segment.text}
            </span>
            <span aria-hidden="true" className={`block h-3 w-full rounded-b-full border-x-[3px] border-b-[3px] ${
              !segment.silent && showArcs ? (colored ? SYLLABLE_ARC[syllable.colorIndex] : 'border-slate-300') : 'border-transparent'}`} />
          </span>
        ));

        return onSyllableTap ? (
          <button key={i} type="button" aria-label={`Syllabe ${written}`} onClick={() => onSyllableTap(i, syllable)}
            className={`${className} hover:bg-slate-100 rounded-xl active:scale-95`}>
            {content}
          </button>
        ) : (
          <span key={i} className={className}>{content}</span>
        );
      })}
    </div>
  );
}
