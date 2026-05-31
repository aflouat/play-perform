import type { QuizQuestion, Subject } from '@/types';

// Legacy subjects (from quiz-data.ts)
const MATHS: QuizQuestion[] = [
  { id: 'math-001', subject: 'maths', emoji: '➗', question: 'Quel est le résultat de 7 × 8 ?', options: [{ id: 'A', text: '54' }, { id: 'B', text: '56' }, { id: 'C', text: '64' }, { id: 'D', text: '48' }], correctOptionId: 'B', explanation: '7 × 8 = 56.', difficulty: 1, xpReward: 10 },
  { id: 'math-002', subject: 'maths', emoji: '√', question: 'Quelle est la valeur de √144 ?', options: [{ id: 'A', text: '11' }, { id: 'B', text: '12' }, { id: 'C', text: '13' }, { id: 'D', text: '14' }], correctOptionId: 'B', explanation: '√144 = 12 car 12 × 12 = 144.', difficulty: 2, xpReward: 15 },
  { id: 'math-003', subject: 'maths', emoji: '📐', question: 'Périmètre d\'un carré de côté 6 cm ?', options: [{ id: 'A', text: '12 cm' }, { id: 'B', text: '24 cm' }, { id: 'C', text: '36 cm' }, { id: 'D', text: '18 cm' }], correctOptionId: 'B', explanation: '4 × 6 = 24 cm.', difficulty: 1, xpReward: 10 },
  { id: 'math-004', subject: 'maths', emoji: '📐', question: 'Triangle rectangle : côtés 3 et 4, hypoténuse ?', options: [{ id: 'A', text: '5' }, { id: 'B', text: '6' }, { id: 'C', text: '7' }, { id: 'D', text: '25' }], correctOptionId: 'A', explanation: 'Pythagore : √(9+16) = √25 = 5.', difficulty: 2, xpReward: 20 },
  { id: 'math-005', subject: 'maths', emoji: '📊', question: 'Quelle est la médiane de : 3, 7, 2, 9, 5 ?', options: [{ id: 'A', text: '3' }, { id: 'B', text: '5' }, { id: 'C', text: '7' }, { id: 'D', text: '9' }], correctOptionId: 'B', explanation: 'Trié : 2, 3, 5, 7, 9. La valeur du milieu est 5.', difficulty: 2, xpReward: 15 },
  { id: 'math-006', subject: 'maths', emoji: '🔢', question: '25% de 200 = ?', options: [{ id: 'A', text: '25' }, { id: 'B', text: '50' }, { id: 'C', text: '75' }, { id: 'D', text: '100' }], correctOptionId: 'B', explanation: '25% = 1/4. 200 ÷ 4 = 50.', difficulty: 1, xpReward: 10 },
  { id: 'math-007', subject: 'maths', emoji: '🔵', question: 'L\'aire d\'un cercle de rayon 5 ? (π ≈ 3,14)', options: [{ id: 'A', text: '15,7 cm²' }, { id: 'B', text: '31,4 cm²' }, { id: 'C', text: '78,5 cm²' }, { id: 'D', text: '157 cm²' }], correctOptionId: 'C', explanation: 'A = π × r² = 3,14 × 25 = 78,5 cm².', difficulty: 2, xpReward: 15 },
  { id: 'math-008', subject: 'maths', emoji: '🔢', question: 'Quel est le PGCD de 12 et 18 ?', options: [{ id: 'A', text: '2' }, { id: 'B', text: '3' }, { id: 'C', text: '6' }, { id: 'D', text: '9' }], correctOptionId: 'C', explanation: 'Diviseurs de 12 : 1,2,3,4,6,12. Diviseurs de 18 : 1,2,3,6,9,18. PGCD = 6.', difficulty: 2, xpReward: 15 },
];

const FRANCAIS: QuizQuestion[] = [
  { id: 'fr-001', subject: 'francais', emoji: '📚', question: 'Pluriel de "bal" ?', options: [{ id: 'A', text: 'baux' }, { id: 'B', text: 'bals' }, { id: 'C', text: 'balles' }, { id: 'D', text: 'bales' }], correctOptionId: 'B', explanation: '"Bal" → "bals" (exception : al → aux ne s\'applique pas).', difficulty: 2, xpReward: 15 },
  { id: 'fr-002', subject: 'francais', emoji: '✍️', question: 'Nature du mot "rapidement" ?', options: [{ id: 'A', text: 'Adjectif' }, { id: 'B', text: 'Nom' }, { id: 'C', text: 'Adverbe' }, { id: 'D', text: 'Verbe' }], correctOptionId: 'C', explanation: '"Rapidement" est un adverbe de manière.', difficulty: 1, xpReward: 10 },
  { id: 'fr-003', subject: 'francais', emoji: '📖', question: '"Le chien que j\'ai vu" — fonction de "que" ?', options: [{ id: 'A', text: 'Sujet' }, { id: 'B', text: 'COD' }, { id: 'C', text: 'COI' }, { id: 'D', text: 'Complément du nom' }], correctOptionId: 'B', explanation: '"que" est COD du verbe "vu".', difficulty: 2, xpReward: 20 },
  { id: 'fr-004', subject: 'francais', emoji: '🖊️', question: 'Quelle figure de style est "Le soleil rit" ?', options: [{ id: 'A', text: 'Métaphore' }, { id: 'B', text: 'Comparaison' }, { id: 'C', text: 'Personnification' }, { id: 'D', text: 'Hyperbole' }], correctOptionId: 'C', explanation: 'On attribue une action humaine (rire) à une chose : c\'est une personnification.', difficulty: 2, xpReward: 15 },
  { id: 'fr-005', subject: 'francais', emoji: '📝', question: 'Accord du participe passé : "Elle est partie avec..." ?', options: [{ id: 'A', text: 'partis' }, { id: 'B', text: 'partie' }, { id: 'C', text: 'parti' }, { id: 'D', text: 'parties' }], correctOptionId: 'B', explanation: 'Avec "être", le PP s\'accorde avec le sujet (elle → partie).', difficulty: 2, xpReward: 15 },
];

const SVT: QuizQuestion[] = [
  { id: 'svt-001', subject: 'svt', emoji: '🫀', question: 'Quel organe produit l\'insuline ?', options: [{ id: 'A', text: 'Le foie' }, { id: 'B', text: 'Le pancréas' }, { id: 'C', text: 'Les reins' }, { id: 'D', text: 'L\'estomac' }], correctOptionId: 'B', explanation: 'L\'insuline est produite par les îlots de Langerhans du pancréas.', difficulty: 2, xpReward: 15 },
  { id: 'svt-002', subject: 'svt', emoji: '🧬', question: 'Combien de chromosomes dans une cellule humaine ?', options: [{ id: 'A', text: '23' }, { id: 'B', text: '44' }, { id: 'C', text: '46' }, { id: 'D', text: '48' }], correctOptionId: 'C', explanation: '46 chromosomes = 23 paires.', difficulty: 1, xpReward: 10 },
  { id: 'svt-003', subject: 'svt', emoji: '🌿', question: 'Les plantes produisent de l\'oxygène par quel processus ?', options: [{ id: 'A', text: 'Respiration' }, { id: 'B', text: 'Fermentation' }, { id: 'C', text: 'Photosynthèse' }, { id: 'D', text: 'Transpiration' }], correctOptionId: 'C', explanation: 'La photosynthèse : CO₂ + eau + lumière → glucose + O₂.', difficulty: 1, xpReward: 10 },
  { id: 'svt-004', subject: 'svt', emoji: '🩸', question: 'Quel groupe sanguin est donneur universel ?', options: [{ id: 'A', text: 'A' }, { id: 'B', text: 'B' }, { id: 'C', text: 'AB' }, { id: 'D', text: 'O' }], correctOptionId: 'D', explanation: 'O- est le donneur universel car compatible avec tous les groupes.', difficulty: 2, xpReward: 15 },
];

const HISTOIRE: QuizQuestion[] = [
  { id: 'hist-001', subject: 'histoire', emoji: '🏰', question: 'En quelle année la Révolution française ?', options: [{ id: 'A', text: '1789' }, { id: 'B', text: '1799' }, { id: 'C', text: '1776' }, { id: 'D', text: '1815' }], correctOptionId: 'A', explanation: 'Prise de la Bastille : 14 juillet 1789.', difficulty: 1, xpReward: 10 },
  { id: 'hist-002', subject: 'histoire', emoji: '👑', question: 'Roi de France lors de la Révolution ?', options: [{ id: 'A', text: 'Louis XIV' }, { id: 'B', text: 'Louis XV' }, { id: 'C', text: 'Louis XVI' }, { id: 'D', text: 'Napoléon' }], correctOptionId: 'C', explanation: 'Louis XVI fut guillotiné le 21 janvier 1793.', difficulty: 1, xpReward: 10 },
  { id: 'hist-003', subject: 'histoire', emoji: '⚔️', question: 'Début de la Première Guerre mondiale ?', options: [{ id: 'A', text: '1910' }, { id: 'B', text: '1914' }, { id: 'C', text: '1918' }, { id: 'D', text: '1920' }], correctOptionId: 'B', explanation: 'La WW1 commence en août 1914 et se termine en novembre 1918.', difficulty: 1, xpReward: 10 },
  { id: 'hist-004', subject: 'histoire', emoji: '🗽', question: 'En quelle année les États-Unis ont-ils déclaré leur indépendance ?', options: [{ id: 'A', text: '1765' }, { id: 'B', text: '1776' }, { id: 'C', text: '1789' }, { id: 'D', text: '1800' }], correctOptionId: 'B', explanation: 'Déclaration d\'indépendance américaine : 4 juillet 1776.', difficulty: 2, xpReward: 15 },
];

const PHYSIQUE: QuizQuestion[] = [
  { id: 'phys-001', subject: 'physique', emoji: '⚡', question: 'Unité de mesure de la résistance électrique ?', options: [{ id: 'A', text: 'Volt' }, { id: 'B', text: 'Ampère' }, { id: 'C', text: 'Ohm' }, { id: 'D', text: 'Watt' }], correctOptionId: 'C', explanation: 'La résistance se mesure en Ohm (Ω).', difficulty: 1, xpReward: 10 },
  { id: 'phys-002', subject: 'physique', emoji: '🔌', question: 'Loi d\'Ohm : formule ?', options: [{ id: 'A', text: 'U = R / I' }, { id: 'B', text: 'U = R × I' }, { id: 'C', text: 'R = U × I' }, { id: 'D', text: 'I = U × R' }], correctOptionId: 'B', explanation: 'U = R × I (tension = résistance × intensité).', difficulty: 2, xpReward: 15 },
  { id: 'phys-003', subject: 'physique', emoji: '💡', question: 'Unité de la puissance électrique ?', options: [{ id: 'A', text: 'Joule' }, { id: 'B', text: 'Volt' }, { id: 'C', text: 'Watt' }, { id: 'D', text: 'Hertz' }], correctOptionId: 'C', explanation: 'La puissance se mesure en Watt (W). P = U × I.', difficulty: 1, xpReward: 10 },
  { id: 'phys-004', subject: 'physique', emoji: '🌊', question: 'Vitesse de la lumière dans le vide ?', options: [{ id: 'A', text: '300 km/s' }, { id: 'B', text: '3 000 km/s' }, { id: 'C', text: '300 000 km/s' }, { id: 'D', text: '3 000 000 km/s' }], correctOptionId: 'C', explanation: 'c ≈ 300 000 km/s = 3×10⁸ m/s. Rien ne va plus vite.', difficulty: 2, xpReward: 15 },
];

import ESPACE from './espace';
import METEO from './meteo';
import CHIMIE from './chimie';
import GEO from './geo';
import ANGLAIS_ORIGINAL from './anglais';
import ESPAGNOL_ORIGINAL from './espagnol';
import INFORMATIQUE from './informatique';
import MECANIQUE from './mecanique';
import TELECOM from './telecom';
import {
  MATHS_BREVET,
  FRANCAIS_BREVET,
  HISTOIRE_BREVET,
  SVT_BREVET,
  PHYSIQUE_BREVET,
  ANGLAIS_BREVET,
  ESPAGNOL_BREVET,
} from './brevet_questions';

export const ALL_QUESTIONS: Record<Subject, QuizQuestion[]> = {
  maths: [...MATHS, ...MATHS_BREVET],
  francais: [...FRANCAIS, ...FRANCAIS_BREVET],
  svt: [...SVT, ...SVT_BREVET],
  histoire: [...HISTOIRE, ...HISTOIRE_BREVET],
  physique: [...PHYSIQUE, ...PHYSIQUE_BREVET],
  it: [],
  culture: [],
  espace: ESPACE,
  meteo: METEO,
  chimie: CHIMIE,
  mecanique: MECANIQUE,
  geo: GEO,
  anglais: [...ANGLAIS_ORIGINAL, ...ANGLAIS_BREVET],
  espagnol: [...ESPAGNOL_ORIGINAL, ...ESPAGNOL_BREVET],
  informatique: INFORMATIQUE,
  telecom: TELECOM,
};

export function getQuestions(subject: Subject): QuizQuestion[] {
  return ALL_QUESTIONS[subject] ?? [];
}
