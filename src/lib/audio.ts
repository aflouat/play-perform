'use client';

type SoundType = 'correct' | 'wrong' | 'levelup' | 'click' | 'complete';

function createContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try { return new AudioContext(); } catch { return null; }
}

function playTone(ctx: AudioContext, freq: number, dur: number, type: OscillatorType = 'sine', t = 0) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + t);
  gain.gain.setValueAtTime(0.25, ctx.currentTime + t);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + dur);
  osc.start(ctx.currentTime + t);
  osc.stop(ctx.currentTime + t + dur);
}

const SOUNDS: Record<SoundType, Array<{ freq: number; dur: number; delay: number }>> = {
  correct: [
    { freq: 523, dur: 0.08, delay: 0 },
    { freq: 659, dur: 0.08, delay: 0.09 },
    { freq: 784, dur: 0.18, delay: 0.18 },
  ],
  wrong: [
    { freq: 330, dur: 0.12, delay: 0 },
    { freq: 260, dur: 0.20, delay: 0.14 },
  ],
  levelup: [
    { freq: 523, dur: 0.08, delay: 0 },
    { freq: 659, dur: 0.08, delay: 0.09 },
    { freq: 784, dur: 0.08, delay: 0.18 },
    { freq: 1047, dur: 0.35, delay: 0.27 },
  ],
  click: [{ freq: 650, dur: 0.04, delay: 0 }],
  complete: [
    { freq: 784, dur: 0.08, delay: 0 },
    { freq: 880, dur: 0.08, delay: 0.09 },
    { freq: 988, dur: 0.08, delay: 0.18 },
    { freq: 1175, dur: 0.35, delay: 0.27 },
  ],
};

export function playSound(type: SoundType): void {
  const ctx = createContext();
  if (!ctx) return;
  SOUNDS[type].forEach(({ freq, dur, delay }) => playTone(ctx, freq, dur, 'sine', delay));
}

// ── Speech synthesis ──────────────────────────────────────────────────────

const ENTHUSIASM_FR = ['Super !', 'Bravo !', 'Génial !', 'Excellent !', 'Fantastique !'];
const ENTHUSIASM_EN = ['Great!', 'Brilliant!', 'Well done!', 'Amazing!'];
const ENTHUSIASM_ES = ['¡Muy bien!', '¡Genial!', '¡Estupendo!', '¡Bravo!'];

function pickEnthusiasm(lang: string): string {
  const pool = lang.startsWith('en') ? ENTHUSIASM_EN : lang.startsWith('es') ? ENTHUSIASM_ES : ENTHUSIASM_FR;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getBestVoice(lang: string): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const langCode = lang.split('-')[0];
  // Prefer premium/enhanced voices, then any matching language
  const match = voices.find(v => v.lang.startsWith(langCode) && v.localService) ??
                voices.find(v => v.lang.startsWith(langCode)) ??
                null;
  return match;
}

export function speakText(text: string, lang = 'fr-FR'): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.95;
  utterance.pitch = 1.2;
  utterance.volume = 1;
  const voice = getBestVoice(lang);
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export function speakEnthusiastic(word: string, lang = 'fr-FR'): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const praise = new SpeechSynthesisUtterance(pickEnthusiasm(lang));
  praise.lang = lang;
  praise.rate = 1.1;
  praise.pitch = 1.3;
  praise.volume = 1;
  const voice = getBestVoice(lang);
  if (voice) praise.voice = voice;

  const wordUtt = new SpeechSynthesisUtterance(word);
  wordUtt.lang = lang;
  wordUtt.rate = 0.9;
  wordUtt.pitch = 1.1;
  if (voice) wordUtt.voice = voice;

  window.speechSynthesis.speak(praise);
  window.speechSynthesis.speak(wordUtt);
}

export function speakInstruction(text: string, lang = 'fr-FR'): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.9;
  u.pitch = 1.15;
  const voice = getBestVoice(lang);
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}
