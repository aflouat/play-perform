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

export const HINTS_HISTOIRE: QuizQuestion[] = [
  {
    id: 'hh-01', subject: 'histoire', emoji: '🏛️', difficulty: 1, xpReward: 10,
    question: 'En quelle année Napoléon Bonaparte a-t-il été sacré Empereur des Français ?',
    hint: 'C\'était quelques années après la Révolution française (1789), au début du 19ème siècle.',
    options: [{ id: 'A', text: '1789' }, { id: 'B', text: '1800' }, { id: 'C', text: '1804' }, { id: 'D', text: '1815' }],
    correctOptionId: 'C', explanation: 'Napoléon est sacré Empereur le 2 décembre 1804 à Notre-Dame de Paris, par le pape Pie VII.',
  },
  {
    id: 'hh-02', subject: 'histoire', emoji: '⚓', difficulty: 2, xpReward: 15,
    question: 'Quel explorateur a réalisé le premier tour du monde (1519-1522) ?',
    hint: 'Il est Portugais, son expédition fut financée par l\'Espagne. Il meurt en cours de route.',
    options: [{ id: 'A', text: 'Christophe Colomb' }, { id: 'B', text: 'Vasco de Gama' }, { id: 'C', text: 'Fernand Magellan' }, { id: 'D', text: 'Francis Drake' }],
    correctOptionId: 'C', explanation: 'Fernand Magellan (Português) a initié le premier circumnavigation. Il meurt aux Philippines en 1521 ; Elcano ramène le navire en Espagne.',
  },
  {
    id: 'hh-03', subject: 'histoire', emoji: '🗡️', difficulty: 1, xpReward: 10,
    question: 'En quelle année la Seconde Guerre mondiale a-t-elle pris fin en Europe ?',
    hint: 'L\'Allemagne a capitulé au printemps, quelques mois avant la fin du conflit en Asie.',
    options: [{ id: 'A', text: '1943' }, { id: 'B', text: '1944' }, { id: 'C', text: '1945' }, { id: 'D', text: '1946' }],
    correctOptionId: 'C', explanation: 'L\'Allemagne nazie capitule le 8 mai 1945 : c\'est le Jour de la Victoire (V-E Day).',
  },
  {
    id: 'hh-04', subject: 'histoire', emoji: '🌍', difficulty: 2, xpReward: 15,
    question: 'Quel traité a mis fin à la Première Guerre mondiale ?',
    hint: 'Signé dans un château près de Paris, en juin 1919.',
    options: [{ id: 'A', text: 'Traité de Paris' }, { id: 'B', text: 'Traité de Versailles' }, { id: 'C', text: 'Traité de Rome' }, { id: 'D', text: 'Traité de Berlin' }],
    correctOptionId: 'B', explanation: 'Le Traité de Versailles, signé le 28 juin 1919 dans la Galerie des Glaces du château de Versailles.',
  },
  {
    id: 'hh-05', subject: 'histoire', emoji: '🕊️', difficulty: 1, xpReward: 10,
    question: 'Qui était le président américain lors de la Déclaration d\'indépendance des États-Unis ?',
    hint: 'À cette époque (1776), les États-Unis n\'avaient pas encore de président — le premier sera élu en 1789.',
    options: [{ id: 'A', text: 'George Washington' }, { id: 'B', text: 'Thomas Jefferson' }, { id: 'C', text: 'Benjamin Franklin' }, { id: 'D', text: 'Il n\'y en avait pas encore' }],
    correctOptionId: 'D', explanation: 'En 1776, les États-Unis n\'avaient pas de président. George Washington devint le 1er président en 1789.',
  },
];

export const HINTS_SVT: QuizQuestion[] = [
  {
    id: 'hs-01', subject: 'svt', emoji: '🌿', difficulty: 1, xpReward: 10,
    question: 'Quelle partie de la plante absorbe l\'eau et les sels minéraux ?',
    hint: 'Cette partie est sous la terre et peut être très longue.',
    options: [{ id: 'A', text: 'Les feuilles' }, { id: 'B', text: 'La tige' }, { id: 'C', text: 'Les racines' }, { id: 'D', text: 'Les fleurs' }],
    correctOptionId: 'C', explanation: 'Les racines absorbent l\'eau et les sels minéraux du sol. Les feuilles font la photosynthèse.',
  },
  {
    id: 'hs-02', subject: 'svt', emoji: '🫁', difficulty: 2, xpReward: 15,
    question: 'Quel gaz échangeons-nous principalement lors de la respiration ?',
    hint: 'On inhale ce que les plantes produisent, et on exhale ce que les plantes consomment.',
    options: [{ id: 'A', text: 'Azote et hydrogène' }, { id: 'B', text: 'Oxygène et CO₂' }, { id: 'C', text: 'Vapeur d\'eau et azote' }, { id: 'D', text: 'Hélium et oxygène' }],
    correctOptionId: 'B', explanation: 'On inhale O₂ (oxygène) et on exhale CO₂ (dioxyde de carbone). Les plantes font l\'inverse lors de la photosynthèse.',
  },
  {
    id: 'hs-03', subject: 'svt', emoji: '🦴', difficulty: 2, xpReward: 15,
    question: 'Combien d\'os compte le corps humain adulte ?',
    hint: 'Ce nombre est plus grand que 100 mais plus petit que 250.',
    options: [{ id: 'A', text: '106' }, { id: 'B', text: '156' }, { id: 'C', text: '206' }, { id: 'D', text: '256' }],
    correctOptionId: 'C', explanation: 'Le corps humain adulte compte 206 os. Un bébé en a environ 270-300, certains fusionnent avec la croissance.',
  },
  {
    id: 'hs-04', subject: 'svt', emoji: '🧠', difficulty: 2, xpReward: 15,
    question: 'Quel est le rôle des globules rouges dans le sang ?',
    hint: 'Pense à ce que les muscles ont besoin pour fonctionner : c\'est un gaz.',
    options: [{ id: 'A', text: 'Défendre contre les microbes' }, { id: 'B', text: 'Transporter l\'oxygène' }, { id: 'C', text: 'Coaguler les plaies' }, { id: 'D', text: 'Produire des hormones' }],
    correctOptionId: 'B', explanation: 'Les globules rouges (hématies) transportent l\'oxygène grâce à l\'hémoglobine. Les globules blancs défendent l\'organisme.',
  },
  {
    id: 'hs-05', subject: 'svt', emoji: '🌍', difficulty: 1, xpReward: 10,
    question: 'Qu\'est-ce que la biodiversité ?',
    hint: 'Le mot "bio" = vie, "diversité" = variété. Pense à tous les êtres vivants qui existent.',
    options: [
      { id: 'A', text: 'La diversité des paysages' },
      { id: 'B', text: 'La variété des espèces vivantes' },
      { id: 'C', text: 'Les aliments biologiques' },
      { id: 'D', text: 'Les changements climatiques' },
    ],
    correctOptionId: 'B', explanation: 'La biodiversité désigne la variété des espèces vivantes (animaux, plantes, champignons, bactéries…) sur Terre.',
  },
];
