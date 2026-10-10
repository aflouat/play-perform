import type { QuizQuestion } from '@/types';

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
