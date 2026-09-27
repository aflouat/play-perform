import { getBestVoice } from '@/lib/audio';

interface SpeakSyllablesOptions {
  lang?: string;
  /** Appelé au début de chaque syllabe (index), puis avec -1 quand le mot entier est lu */
  onSyllable?: (index: number) => void;
  onEnd?: () => void;
}

/**
 * Lecture « karaoké » : chaque syllabe lentement, puis le mot entier.
 * Les énoncés sont mis en file d'attente ; onstart permet de surligner la syllabe prononcée.
 */
export function speakSyllables(syllables: string[], word: string, options: SpeakSyllablesOptions = {}): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) { options.onEnd?.(); return; }
  const { lang = 'fr-FR', onSyllable, onEnd } = options;
  window.speechSynthesis.cancel();
  const voice = getBestVoice(lang);

  const make = (text: string, rate: number): SpeechSynthesisUtterance => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    u.pitch = 1.1;
    if (voice) u.voice = voice;
    return u;
  };

  syllables.forEach((syllable, i) => {
    const u = make(syllable, 0.7);
    u.onstart = () => onSyllable?.(i);
    window.speechSynthesis.speak(u);
  });

  const whole = make(word, 0.85);
  whole.onstart = () => onSyllable?.(-1);
  whole.onend = () => onEnd?.();
  window.speechSynthesis.speak(whole);
}

/** Coupe la lecture en cours (changement de mot, sortie de l'écran). */
export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}
