export interface ScienceQuestion {
  id: string;
  question: string;
  emoji: string;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
  explanation: string;
  fact: string;
}

export const SCIENCE_QUESTIONS: ScienceQuestion[] = [
  {
    id: 'sc-1',
    question: 'L\'eau coule vers le bas ou vers le haut ?',
    emoji: '💧',
    options: ['Vers le bas', 'Vers le haut', 'Elle reste immobile'],
    correctIndex: 0,
    explanation: 'La gravité attire tout vers la Terre !',
    fact: '🌍 La gravité, c\'est la force invisible qui nous colle au sol.',
  },
  {
    id: 'sc-2',
    question: 'De quelle couleur est le ciel en plein jour ?',
    emoji: '☀️',
    options: ['Rouge', 'Vert', 'Bleu'],
    correctIndex: 2,
    explanation: 'L\'air diffuse la lumière bleue du soleil !',
    fact: '🌈 La lumière blanche contient toutes les couleurs de l\'arc-en-ciel.',
  },
  {
    id: 'sc-3',
    question: 'Les plantes mangent quoi pour grandir ?',
    emoji: '🌱',
    options: ['De la pizza', 'De la lumière', 'Du chocolat'],
    correctIndex: 1,
    explanation: 'Les plantes transforment la lumière en nourriture !',
    fact: '🌿 C\'est la photosynthèse : lumière + eau + air = nourriture !',
  },
  {
    id: 'sc-4',
    question: 'Quel animal pond des œufs ?',
    emoji: '🥚',
    options: ['Le lion', 'La poule', 'Le chien'],
    correctIndex: 1,
    explanation: 'Les oiseaux et les reptiles pondent des œufs !',
    fact: '🐣 Un œuf de poule met 21 jours à éclore.',
  },
  {
    id: 'sc-5',
    question: 'Comment les poissons respirent-ils sous l\'eau ?',
    emoji: '🐟',
    options: ['Avec leur nez', 'Avec leurs branchies', 'Ils ne respirent pas'],
    correctIndex: 1,
    explanation: 'Les branchies filtrent l\'oxygène dans l\'eau !',
    fact: '🌊 L\'eau contient de l\'air dissous que les poissons respirent.',
  },
  {
    id: 'sc-6',
    question: 'Pourquoi il fait froid en hiver ?',
    emoji: '❄️',
    options: ['La Terre est plus loin du soleil', 'Le soleil est moins fort', 'Le ciel est plus épais'],
    correctIndex: 1,
    explanation: 'En hiver, les rayons du soleil arrivent moins droits et réchauffent moins !',
    fact: '🌍 La Terre est inclinée, ce qui crée les saisons.',
  },
  {
    id: 'sc-7',
    question: 'L\'arc-en-ciel, combien de couleurs a-t-il ?',
    emoji: '🌈',
    options: ['3 couleurs', '5 couleurs', '7 couleurs'],
    correctIndex: 2,
    explanation: 'Rouge, orange, jaune, vert, bleu, indigo, violet : 7 couleurs !',
    fact: '💧 La pluie transforme la lumière du soleil en arc-en-ciel.',
  },
  {
    id: 'sc-8',
    question: 'Quel sens permet de sentir les odeurs ?',
    emoji: '👃',
    options: ['La vue', 'L\'odorat', 'L\'ouïe'],
    correctIndex: 1,
    explanation: 'Le nez capte les molécules dans l\'air !',
    fact: '🐕 Un chien sent 1000 fois mieux qu\'un humain.',
  },
];

export function getScienceQuestions(count = 5): ScienceQuestion[] {
  return [...SCIENCE_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, count);
}
