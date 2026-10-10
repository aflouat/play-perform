import type { QuizQuestion } from '@/types';

export const HINTS_MATHS: QuizQuestion[] = [
  {
    id: 'hm-01', subject: 'maths', emoji: '📐', difficulty: 1, xpReward: 10,
    question: 'Quelle est l\'aire d\'un rectangle de longueur 8 cm et de largeur 5 cm ?',
    hint: 'Aire rectangle = longueur × largeur',
    options: [{ id: 'A', text: '13 cm²' }, { id: 'B', text: '26 cm²' }, { id: 'C', text: '40 cm²' }, { id: 'D', text: '80 cm²' }],
    correctOptionId: 'C', explanation: '8 × 5 = 40 cm². L\'aire se calcule en multipliant les deux dimensions.',
  },
  {
    id: 'hm-02', subject: 'maths', emoji: '🔢', difficulty: 1, xpReward: 10,
    question: 'Combien font 3/4 + 1/4 ?',
    hint: 'Quand les dénominateurs sont identiques, on additionne seulement les numérateurs.',
    options: [{ id: 'A', text: '4/8' }, { id: 'B', text: '1' }, { id: 'C', text: '3/8' }, { id: 'D', text: '2' }],
    correctOptionId: 'B', explanation: '3/4 + 1/4 = 4/4 = 1. Les dénominateurs sont égaux, on additionne 3+1=4.',
  },
  {
    id: 'hm-03', subject: 'maths', emoji: '📊', difficulty: 2, xpReward: 15,
    question: 'Un article coûte 80 €. Après une réduction de 15%, quel est le nouveau prix ?',
    hint: '15% de réduction = multiplier par (1 − 0,15) = 0,85',
    options: [{ id: 'A', text: '65 €' }, { id: 'B', text: '68 €' }, { id: 'C', text: '70 €' }, { id: 'D', text: '72 €' }],
    correctOptionId: 'B', explanation: '80 × 0,85 = 68 €. On peut aussi faire : 80 − (80 × 0,15) = 80 − 12 = 68.',
  },
  {
    id: 'hm-04', subject: 'maths', emoji: '⚖️', difficulty: 2, xpReward: 15,
    question: 'Résoudre : 3x + 6 = 21. Quelle est la valeur de x ?',
    hint: 'Isole x : commence par soustraire 6 des deux côtés, puis divise par 3.',
    options: [{ id: 'A', text: '3' }, { id: 'B', text: '4' }, { id: 'C', text: '5' }, { id: 'D', text: '9' }],
    correctOptionId: 'C', explanation: '3x = 21 − 6 = 15. Donc x = 15 ÷ 3 = 5.',
  },
  {
    id: 'hm-05', subject: 'maths', emoji: '📐', difficulty: 2, xpReward: 15,
    question: 'Dans un triangle rectangle, les deux cathètes mesurent 6 et 8. Quelle est l\'hypoténuse ?',
    hint: 'Théorème de Pythagore : c² = a² + b²',
    options: [{ id: 'A', text: '10' }, { id: 'B', text: '12' }, { id: 'C', text: '14' }, { id: 'D', text: '100' }],
    correctOptionId: 'A', explanation: '√(6² + 8²) = √(36 + 64) = √100 = 10. C\'est le célèbre triangle 6-8-10.',
  },
];

export const HINTS_FRANCAIS: QuizQuestion[] = [
  {
    id: 'hf-01', subject: 'francais', emoji: '📝', difficulty: 1, xpReward: 10,
    question: 'Quel est le synonyme de "courageux" ?',
    hint: 'Pense à quelqu\'un qui n\'a pas peur d\'affronter le danger.',
    options: [{ id: 'A', text: 'Timide' }, { id: 'B', text: 'Intrépide' }, { id: 'C', text: 'Paresseux' }, { id: 'D', text: 'Prudent' }],
    correctOptionId: 'B', explanation: '"Intrépide" signifie qui ne ressent pas la peur — c\'est un synonyme de courageux.',
  },
  {
    id: 'hf-02', subject: 'francais', emoji: '📚', difficulty: 2, xpReward: 15,
    question: 'Quelle est la nature du groupe de mots souligné : "Je marche __lentement__" ?',
    hint: 'Les mots qui précisent "comment" on fait l\'action se terminent souvent par -ment.',
    options: [{ id: 'A', text: 'Adjectif' }, { id: 'B', text: 'Nom' }, { id: 'C', text: 'Adverbe' }, { id: 'D', text: 'Verbe' }],
    correctOptionId: 'C', explanation: '"Lentement" est un adverbe de manière. Il répond à la question "comment ?".',
  },
  {
    id: 'hf-03', subject: 'francais', emoji: '✍️', difficulty: 2, xpReward: 15,
    question: 'Conjuguez "aller" au futur simple, à la 1ère personne du pluriel.',
    hint: 'Le verbe "aller" est irrégulier au futur : son radical est "ir-".',
    options: [{ id: 'A', text: 'nous allons' }, { id: 'B', text: 'nous irons' }, { id: 'C', text: 'nous allrons' }, { id: 'D', text: 'nous irons' }],
    correctOptionId: 'B', explanation: 'Futur de "aller" : j\'irai, tu iras, il ira, nous irons, vous irez, ils iront.',
  },
  {
    id: 'hf-04', subject: 'francais', emoji: '🖊️', difficulty: 1, xpReward: 10,
    question: 'Quel est l\'antonyme (contraire) de "généreux" ?',
    hint: 'Quelqu\'un qui refuse de partager et garde tout pour lui.',
    options: [{ id: 'A', text: 'Avare' }, { id: 'B', text: 'Aimable' }, { id: 'C', text: 'Patient' }, { id: 'D', text: 'Créatif' }],
    correctOptionId: 'A', explanation: '"Avare" est le contraire de "généreux". Un avare ne veut pas dépenser ni donner.',
  },
  {
    id: 'hf-05', subject: 'francais', emoji: '📖', difficulty: 2, xpReward: 15,
    question: 'Identifie la figure de style : "Ses yeux sont des étoiles."',
    hint: 'Deux éléments sont comparés SANS utiliser "comme" ou "tel".',
    options: [{ id: 'A', text: 'Comparaison' }, { id: 'B', text: 'Métaphore' }, { id: 'C', text: 'Hyperbole' }, { id: 'D', text: 'Personnification' }],
    correctOptionId: 'B', explanation: 'C\'est une métaphore : on dit que les yeux SONT des étoiles (sans "comme"). Une comparaison dirait "comme des étoiles".',
  },
];
