import type { QuizQuestion } from '@/types';

// ─────────────────────────────────────────────────────────────────
// MATHS — 15 questions (niveaux 2-4)
// ─────────────────────────────────────────────────────────────────

const MATHS_BREVET: QuizQuestion[] = [
  {
    id: 'math-brev-001', subject: 'maths', emoji: '➗',
    question: 'Développe (2x + 3)²',
    options: [
      { id: 'A', text: '4x² + 9' },
      { id: 'B', text: '4x² + 12x + 9' },
      { id: 'C', text: '2x² + 6x + 3' },
      { id: 'D', text: '4x + 6' },
    ],
    correctOptionId: 'B',
    explanation: '(2x + 3)² = (2x)² + 2·2x·3 + 3² = 4x² + 12x + 9',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'math-brev-002', subject: 'maths', emoji: '√',
    question: 'Simplifie √72',
    options: [
      { id: 'A', text: '8√9' },
      { id: 'B', text: '6√2' },
      { id: 'C', text: '36√2' },
      { id: 'D', text: '9√8' },
    ],
    correctOptionId: 'B',
    explanation: '√72 = √(36×2) = 6√2',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'math-brev-003', subject: 'maths', emoji: '📐',
    question: 'Résous 3x - 7 = 5x + 1',
    options: [
      { id: 'A', text: 'x = -4' },
      { id: 'B', text: 'x = 4' },
      { id: 'C', text: 'x = 2' },
      { id: 'D', text: 'x = -2' },
    ],
    correctOptionId: 'A',
    explanation: '3x - 7 = 5x + 1 → -2x = 8 → x = -4',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'math-brev-004', subject: 'maths', emoji: '🔢',
    question: 'Un triangle ABC rectangle en A. AB = 3, AC = 4. Calcule BC.',
    options: [
      { id: 'A', text: '5' },
      { id: 'B', text: '6' },
      { id: 'C', text: '7' },
      { id: 'D', text: '√7' },
    ],
    correctOptionId: 'A',
    explanation: 'BC² = AB² + AC² = 9 + 16 = 25 → BC = 5',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'math-brev-005', subject: 'maths', emoji: '📊',
    question: 'Factorise 6x² - 9x',
    options: [
      { id: 'A', text: '3x(2x - 3)' },
      { id: 'B', text: '6x(x - 1,5)' },
      { id: 'C', text: '3(2x² - 3x)' },
      { id: 'D', text: 'x(6x - 9)' },
    ],
    correctOptionId: 'A',
    explanation: '6x² - 9x = 3x(2x - 3)',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'math-brev-006', subject: 'maths', emoji: '🔵',
    question: 'La distance entre A(1, 2) et B(4, 6) ?',
    options: [
      { id: 'A', text: '5' },
      { id: 'B', text: '√34' },
      { id: 'C', text: '7' },
      { id: 'D', text: '√25' },
    ],
    correctOptionId: 'A',
    explanation: 'd = √((4-1)² + (6-2)²) = √(9 + 16) = √25 = 5',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'math-brev-007', subject: 'maths', emoji: 'π',
    question: 'Volume d\'un cube de côté 5 cm ?',
    options: [
      { id: 'A', text: '25 cm³' },
      { id: 'B', text: '125 cm³' },
      { id: 'C', text: '150 cm³' },
      { id: 'D', text: '75 cm³' },
    ],
    correctOptionId: 'B',
    explanation: 'V = côté³ = 5³ = 125 cm³',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'math-brev-008', subject: 'maths', emoji: '🔢',
    question: 'Résous x² - 9 = 0',
    options: [
      { id: 'A', text: 'x = 3' },
      { id: 'B', text: 'x = ±3' },
      { id: 'C', text: 'x = -3' },
      { id: 'D', text: 'Pas de solution' },
    ],
    correctOptionId: 'B',
    explanation: 'x² - 9 = (x-3)(x+3) = 0 → x = 3 ou x = -3',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'math-brev-009', subject: 'maths', emoji: '📐',
    question: 'Quel est l\'angle d\'un triangle équilatéral ?',
    options: [
      { id: 'A', text: '60°' },
      { id: 'B', text: '90°' },
      { id: 'C', text: '45°' },
      { id: 'D', text: '120°' },
    ],
    correctOptionId: 'A',
    explanation: 'Somme des angles = 180°. Triangle équilatéral → 180°/3 = 60°',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'math-brev-010', subject: 'maths', emoji: '🎲',
    question: 'Probabilité d\'obtenir un nombre pair avec un dé ?',
    options: [
      { id: 'A', text: '1/2' },
      { id: 'B', text: '1/3' },
      { id: 'C', text: '1/6' },
      { id: 'D', text: '2/3' },
    ],
    correctOptionId: 'A',
    explanation: 'Nombres pairs : 2, 4, 6 → 3/6 = 1/2',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'math-brev-011', subject: 'maths', emoji: '➗',
    question: 'Calcule (3/4) × (8/9)',
    options: [
      { id: 'A', text: '2/3' },
      { id: 'B', text: '24/36' },
      { id: 'C', text: '11/13' },
      { id: 'D', text: '1/3' },
    ],
    correctOptionId: 'A',
    explanation: '(3/4) × (8/9) = 24/36 = 2/3',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'math-brev-012', subject: 'maths', emoji: '📊',
    question: 'Pente d\'une droite passant par (0,0) et (2,4) ?',
    options: [
      { id: 'A', text: '1' },
      { id: 'B', text: '2' },
      { id: 'C', text: '1/2' },
      { id: 'D', text: '4' },
    ],
    correctOptionId: 'B',
    explanation: 'Pente = Δy/Δx = 4/2 = 2',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'math-brev-013', subject: 'maths', emoji: '⚖️',
    question: 'Volume d\'une pyramide : V = (1/3) × base × hauteur. Si base = 20 et h = 15 ?',
    options: [
      { id: 'A', text: '100' },
      { id: 'B', text: '150' },
      { id: 'C', text: '300' },
      { id: 'D', text: '200' },
    ],
    correctOptionId: 'A',
    explanation: 'V = (1/3) × 20 × 15 = (1/3) × 300 = 100',
    difficulty: 3, xpReward: 20
  },
  {
    id: 'math-brev-014', subject: 'maths', emoji: '🔢',
    question: 'Système : x + y = 5, x - y = 1. Trouve x.',
    options: [
      { id: 'A', text: '2' },
      { id: 'B', text: '3' },
      { id: 'C', text: '4' },
      { id: 'D', text: '1' },
    ],
    correctOptionId: 'B',
    explanation: 'Additionne : 2x = 6 → x = 3',
    difficulty: 3, xpReward: 20
  },
  {
    id: 'math-brev-015', subject: 'maths', emoji: '📈',
    question: 'Quelle fonction est linéaire ?',
    options: [
      { id: 'A', text: 'f(x) = 2x + 1' },
      { id: 'B', text: 'f(x) = 2x' },
      { id: 'C', text: 'f(x) = x²' },
      { id: 'D', text: 'f(x) = 1/x' },
    ],
    correctOptionId: 'B',
    explanation: 'Linéaire = sans constante. f(x) = 2x passe par (0,0).',
    difficulty: 2, xpReward: 15
  },
];

// ─────────────────────────────────────────────────────────────────
// FRANÇAIS — 15 questions
// ─────────────────────────────────────────────────────────────────

const FRANCAIS_BREVET: QuizQuestion[] = [
  {
    id: 'fr-brev-001', subject: 'francais', emoji: '📚',
    question: 'Quel est le temps dominant dans "Il regarda le ciel"?',
    options: [
      { id: 'A', text: 'Présent' },
      { id: 'B', text: 'Imparfait' },
      { id: 'C', text: 'Passé simple' },
      { id: 'D', text: 'Passé composé' },
    ],
    correctOptionId: 'C',
    explanation: '"Regarda" est au passé simple (temps du récit).',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'fr-brev-002', subject: 'francais', emoji: '✍️',
    question: 'Identifie la figure de style : "Ses cheveux sont des fils d\'or"',
    options: [
      { id: 'A', text: 'Allégorie' },
      { id: 'B', text: 'Métaphore' },
      { id: 'C', text: 'Métonymie' },
      { id: 'D', text: 'Hyperbole' },
    ],
    correctOptionId: 'B',
    explanation: 'Les cheveux sont comparés à de l\'or sans "comme".',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'fr-brev-003', subject: 'francais', emoji: '📖',
    question: 'Quel est le rôle du "que" dans "Le livre que j\'ai lu" ?',
    options: [
      { id: 'A', text: 'Complément d\'objet indirect' },
      { id: 'B', text: 'Complément d\'objet direct' },
      { id: 'C', text: 'Complément de lieu' },
      { id: 'D', text: 'Sujet' },
    ],
    correctOptionId: 'B',
    explanation: '"que" = COD du verbe "lire".',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'fr-brev-004', subject: 'francais', emoji: '🖊️',
    question: 'Accord du participe passé : "Ils sont partis rapidement."',
    options: [
      { id: 'A', text: 'Incorrect' },
      { id: 'B', text: 'Correct' },
      { id: 'C', text: '"Partie" aurait été mieux' },
      { id: 'D', text: 'Dépend du contexte' },
    ],
    correctOptionId: 'B',
    explanation: 'Avec "être", le PP s\'accorde avec le sujet (ils → partis).',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'fr-brev-005', subject: 'francais', emoji: '📝',
    question: 'Quel est le mode du verbe dans "Pourvu qu\'il réussisse" ?',
    options: [
      { id: 'A', text: 'Indicatif' },
      { id: 'B', text: 'Conditionnel' },
      { id: 'C', text: 'Subjonctif' },
      { id: 'D', text: 'Impératif' },
    ],
    correctOptionId: 'C',
    explanation: 'Après "pourvu que", on utilise le subjonctif.',
    difficulty: 3, xpReward: 20
  },
  {
    id: 'fr-brev-006', subject: 'francais', emoji: '🎭',
    question: 'Quel auteur a écrit "Les Misérables" ?',
    options: [
      { id: 'A', text: 'Alexandre Dumas' },
      { id: 'B', text: 'Victor Hugo' },
      { id: 'C', text: 'Gustave Flaubert' },
      { id: 'D', text: 'Balzac' },
    ],
    correctOptionId: 'B',
    explanation: 'Victor Hugo (1862). Roman socio-politique majeur.',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'fr-brev-007', subject: 'francais', emoji: '📚',
    question: 'La versification : quel est le nom du vers de 10 syllabes ?',
    options: [
      { id: 'A', text: 'Alexandrin' },
      { id: 'B', text: 'Décasyllabe' },
      { id: 'C', text: 'Octosyllabe' },
      { id: 'D', text: 'Dodécasyllabe' },
    ],
    correctOptionId: 'B',
    explanation: 'Un décasyllabe a 10 syllabes (décasyllabique = 10).',
    difficulty: 3, xpReward: 20
  },
  {
    id: 'fr-brev-008', subject: 'francais', emoji: '✍️',
    question: 'Dans la phrase "Elle finit par accepter", quel est le temps ?',
    options: [
      { id: 'A', text: 'Passé composé' },
      { id: 'B', text: 'Présent' },
      { id: 'C', text: 'Imparfait' },
      { id: 'D', text: 'Futur simple' },
    ],
    correctOptionId: 'B',
    explanation: '"Finit" = 3ᵉ pers. sing. présent de l\'indicatif.',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'fr-brev-009', subject: 'francais', emoji: '💬',
    question: 'Quelle est la fonction du "en" dans "En arrivant, il sourit" ?',
    options: [
      { id: 'A', text: 'Complément de lieu' },
      { id: 'B', text: 'Complément de temps' },
      { id: 'C', text: 'Préposition nominale' },
      { id: 'D', text: 'Complément de condition' },
    ],
    correctOptionId: 'C',
    explanation: '"En arrivant" = proposition participiale (circonstancielle).',
    difficulty: 3, xpReward: 20
  },
  {
    id: 'fr-brev-010', subject: 'francais', emoji: '📖',
    question: 'Quel est le thème du sonnet "Les Regrets" de Du Bellay ?',
    options: [
      { id: 'A', text: 'L\'amour courtois' },
      { id: 'B', text: 'La nostalgie de la patrie' },
      { id: 'C', text: 'La mort et l\'éternité' },
      { id: 'D', text: 'La nature et les saisons' },
    ],
    correctOptionId: 'B',
    explanation: 'Du Bellay exprime sa nostalgie d\'Angers exilé en Italie.',
    difficulty: 3, xpReward: 20
  },
  {
    id: 'fr-brev-011', subject: 'francais', emoji: '🖊️',
    question: 'Quelle est la différence entre "ce" et "se" ?',
    options: [
      { id: 'A', text: 'Aucune' },
      { id: 'B', text: '"ce" = pronom démonstratif ; "se" = réfléchi' },
      { id: 'C', text: '"ce" = verbe ; "se" = déterminant' },
      { id: 'D', text: '"ce" et "se" sont interchangeables' },
    ],
    correctOptionId: 'B',
    explanation: 'Ce chat / Il se lave.',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'fr-brev-012', subject: 'francais', emoji: '📚',
    question: 'Qui a écrit "Candide" ?',
    options: [
      { id: 'A', text: 'Montesquieu' },
      { id: 'B', text: 'Voltaire' },
      { id: 'C', text: 'Rousseau' },
      { id: 'D', text: 'Diderot' },
    ],
    correctOptionId: 'B',
    explanation: 'Voltaire (1759). Satire de l\'optimisme naïf.',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'fr-brev-013', subject: 'francais', emoji: '✍️',
    question: 'Fonction du complément "sur la table" dans "Le livre est sur la table" ?',
    options: [
      { id: 'A', text: 'COD' },
      { id: 'B', text: 'COI' },
      { id: 'C', text: 'Complément de lieu' },
      { id: 'D', text: 'Attribut du sujet' },
    ],
    correctOptionId: 'C',
    explanation: '"sur la table" indique OÙ est le livre.',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'fr-brev-014', subject: 'francais', emoji: '🎭',
    question: 'Quel mouvement littéraire représente le Romantisme ?',
    options: [
      { id: 'A', text: 'XIVe siècle' },
      { id: 'B', text: 'XVIIe siècle' },
      { id: 'C', text: 'XIXe siècle' },
      { id: 'D', text: 'XXe siècle' },
    ],
    correctOptionId: 'C',
    explanation: 'Romantisme = XIXe siècle (Hugo, Lamartine, Musset).',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'fr-brev-015', subject: 'francais', emoji: '📖',
    question: 'Quel est le temps du discours rapporté dans "Il dit qu\'il viendrait" ?',
    options: [
      { id: 'A', text: 'Discours direct' },
      { id: 'B', text: 'Discours indirect' },
      { id: 'C', text: 'Discours indirect libre' },
      { id: 'D', text: 'Narratif' },
    ],
    correctOptionId: 'B',
    explanation: 'Discours indirect = "que + verbe".',
    difficulty: 2, xpReward: 15
  },
];

// ─────────────────────────────────────────────────────────────────
// HISTOIRE-GÉOGRAPHIE — 15 questions
// ─────────────────────────────────────────────────────────────────

const HISTOIRE_BREVET: QuizQuestion[] = [
  {
    id: 'hist-brev-001', subject: 'histoire', emoji: '🏛️',
    question: 'En quelle année l\'Assemblée nationale a-t-elle voté la Déclaration des droits de l\'homme ?',
    options: [
      { id: 'A', text: '1789' },
      { id: 'B', text: '1791' },
      { id: 'C', text: '1793' },
      { id: 'D', text: '1795' },
    ],
    correctOptionId: 'A',
    explanation: '26 août 1789 : Déclaration des droits de l\'homme et du citoyen.',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'hist-brev-002', subject: 'histoire', emoji: '⚔️',
    question: 'Quelle bataille marque la fin de l\'occupation nazie en France ?',
    options: [
      { id: 'A', text: 'Normandie (D-Day)' },
      { id: 'B', text: 'Stalingrad' },
      { id: 'C', text: 'Verdun' },
      { id: 'D', text: 'Marne' },
    ],
    correctOptionId: 'A',
    explanation: 'D-Day : 6 juin 1944 en Normandie. Début de la libération.',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'hist-brev-003', subject: 'histoire', emoji: '👑',
    question: 'Quel roi a dit "L\'État, c\'est moi" ?',
    options: [
      { id: 'A', text: 'Louis XIII' },
      { id: 'B', text: 'Louis XIV' },
      { id: 'C', text: 'Louis XVI' },
      { id: 'D', text: 'Louis XV' },
    ],
    correctOptionId: 'B',
    explanation: 'Louis XIV, le Roi Soleil. Absolutisme français.',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'hist-brev-004', subject: 'histoire', emoji: '🌍',
    question: 'Quand le Mur de Berlin est-il tombé ?',
    options: [
      { id: 'A', text: '1961' },
      { id: 'B', text: '1989' },
      { id: 'C', text: '1975' },
      { id: 'D', text: '2001' },
    ],
    correctOptionId: 'B',
    explanation: '9 novembre 1989. Fin de la Guerre froide symboliquement.',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'hist-brev-005', subject: 'histoire', emoji: '📜',
    question: 'Quel est le premier article de la Constitution de 1958 ?',
    options: [
      { id: 'A', text: '"La France est une République"' },
      { id: 'B', text: '"La souveraineté nationale appartient au peuple"' },
      { id: 'C', text: '"Le Président est élu au suffrage universel"' },
      { id: 'D', text: '"La France est une démocratie"' },
    ],
    correctOptionId: 'A',
    explanation: 'Article 1 : La France est une République indivisible...',
    difficulty: 3, xpReward: 20
  },
  {
    id: 'hist-brev-006', subject: 'histoire', emoji: '⚡',
    question: 'Quelle révolution a lieu en 1789 en France ?',
    options: [
      { id: 'A', text: 'Révolution industrielle' },
      { id: 'B', text: 'Révolution scientifique' },
      { id: 'C', text: 'Révolution française' },
      { id: 'D', text: 'Révolution numérique' },
    ],
    correctOptionId: 'C',
    explanation: 'Prise de la Bastille : 14 juillet 1789.',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'hist-brev-007', subject: 'histoire', emoji: '🗽',
    question: 'Qui a déclaré l\'indépendance américaine en 1776 ?',
    options: [
      { id: 'A', text: 'George Washington' },
      { id: 'B', text: 'Thomas Jefferson' },
      { id: 'C', text: 'Benjamin Franklin' },
      { id: 'D', text: 'John Adams' },
    ],
    correctOptionId: 'B',
    explanation: 'Thomas Jefferson rédige la Déclaration d\'indépendance.',
    difficulty: 3, xpReward: 20
  },
  {
    id: 'hist-brev-008', subject: 'histoire', emoji: '🏭',
    question: 'La Révolution industrielle débute en quel siècle et quel pays ?',
    options: [
      { id: 'A', text: 'XVIIe siècle en France' },
      { id: 'B', text: 'XVIIIe siècle en Grande-Bretagne' },
      { id: 'C', text: 'XIXe siècle en Allemagne' },
      { id: 'D', text: 'XXe siècle aux USA' },
    ],
    correctOptionId: 'B',
    explanation: 'Fin XVIIIe siècle en Grande-Bretagne (machines à vapeur).',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'hist-brev-009', subject: 'histoire', emoji: '🇪🇺',
    question: 'Quelle est la capitale de la Suisse ?',
    options: [
      { id: 'A', text: 'Zurich' },
      { id: 'B', text: 'Genève' },
      { id: 'C', text: 'Berne' },
      { id: 'D', text: 'Lucerne' },
    ],
    correctOptionId: 'C',
    explanation: 'Berne est la capitale fédérale.',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'hist-brev-010', subject: 'histoire', emoji: '🌏',
    question: 'Le Traité de Versailles (1919) met fin à quelle guerre ?',
    options: [
      { id: 'A', text: 'Guerre de 100 ans' },
      { id: 'B', text: 'Première Guerre mondiale' },
      { id: 'C', text: 'Deuxième Guerre mondiale' },
      { id: 'D', text: 'Guerre de Succession d\'Espagne' },
    ],
    correctOptionId: 'B',
    explanation: 'Traité de Versailles : 28 juin 1919.',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'hist-brev-011', subject: 'histoire', emoji: '🗼',
    question: 'Quelle ville est la capitale de la France ?',
    options: [
      { id: 'A', text: 'Lyon' },
      { id: 'B', text: 'Marseille' },
      { id: 'C', text: 'Paris' },
      { id: 'D', text: 'Toulouse' },
    ],
    correctOptionId: 'C',
    explanation: 'Paris, capitale depuis l\'Île-de-France.',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'hist-brev-012', subject: 'histoire', emoji: '⚔️',
    question: 'Quand l\'Autriche-Hongrie déclare-t-elle la guerre à la Serbie ?',
    options: [
      { id: 'A', text: '28 juillet 1914' },
      { id: 'B', text: '1er août 1914' },
      { id: 'C', text: '4 août 1914' },
      { id: 'D', text: '28 juin 1914' },
    ],
    correctOptionId: 'A',
    explanation: '28 juillet 1914 : début de la Première Guerre mondiale.',
    difficulty: 3, xpReward: 20
  },
  {
    id: 'hist-brev-013', subject: 'histoire', emoji: '🇫🇷',
    question: 'Quel général français meurt à Colombey-les-Deux-Églises en 1970 ?',
    options: [
      { id: 'A', text: 'Georges Clemenceau' },
      { id: 'B', text: 'Charles de Gaulle' },
      { id: 'C', text: 'Marcel Pétain' },
      { id: 'D', text: 'Jean Leclerc' },
    ],
    correctOptionId: 'B',
    explanation: 'Charles de Gaulle (1890-1970).',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'hist-brev-014', subject: 'histoire', emoji: '📍',
    question: 'Le plus long fleuve d\'Europe est ?',
    options: [
      { id: 'A', text: 'Le Rhin' },
      { id: 'B', text: 'La Loire' },
      { id: 'C', text: 'Le Danube' },
      { id: 'D', text: 'La Volga' },
    ],
    correctOptionId: 'D',
    explanation: 'La Volga (3530 km) traverse la Russie.',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'hist-brev-015', subject: 'histoire', emoji: '🏔️',
    question: 'Quelle est la plus haute montagne d\'Europe ?',
    options: [
      { id: 'A', text: 'Les Alpes' },
      { id: 'B', text: 'L\'Elbrous' },
      { id: 'C', text: 'Le Mont-Blanc' },
      { id: 'D', text: 'Les Carpates' },
    ],
    correctOptionId: 'B',
    explanation: 'L\'Elbrous (5642m) dans le Caucase, Russie.',
    difficulty: 3, xpReward: 20
  },
];

// ─────────────────────────────────────────────────────────────────
// SVT (SCIENCES DE LA VIE ET DE LA TERRE) — 15 questions
// ─────────────────────────────────────────────────────────────────

const SVT_BREVET: QuizQuestion[] = [
  {
    id: 'svt-brev-001', subject: 'svt', emoji: '🧬',
    question: 'Le chromosome Y porte le gène ?',
    options: [
      { id: 'A', text: 'De la couleur des yeux' },
      { id: 'B', text: 'De la détermination du sexe male' },
      { id: 'C', text: 'Du groupe sanguin' },
      { id: 'D', text: 'De la taille' },
    ],
    correctOptionId: 'B',
    explanation: 'Le gène SRY du chromosome Y détermine le sexe male.',
    difficulty: 3, xpReward: 20
  },
  {
    id: 'svt-brev-002', subject: 'svt', emoji: '🦴',
    question: 'Combien de vertèbres cervicales (cou) avons-nous ?',
    options: [
      { id: 'A', text: '5' },
      { id: 'B', text: '7' },
      { id: 'C', text: '12' },
      { id: 'D', text: '10' },
    ],
    correctOptionId: 'B',
    explanation: '7 vertèbres cervicales (C1 à C7).',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'svt-brev-003', subject: 'svt', emoji: '🫁',
    question: 'Quel gaz respire la plante la nuit en photosynthèse ?',
    options: [
      { id: 'A', text: 'L\'oxygène' },
      { id: 'B', text: 'Le dioxyde de carbone (CO₂)' },
      { id: 'C', text: 'L\'azote' },
      { id: 'D', text: 'L\'argon' },
    ],
    correctOptionId: 'B',
    explanation: 'Photosynthèse : CO₂ + H₂O + lumière → glucose + O₂',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'svt-brev-004', subject: 'svt', emoji: '🔬',
    question: 'Quel scientifique découvre la pénicilline ?',
    options: [
      { id: 'A', text: 'Pasteur' },
      { id: 'B', text: 'Fleming' },
      { id: 'C', text: 'Watson & Crick' },
      { id: 'D', text: 'Darwin' },
    ],
    correctOptionId: 'B',
    explanation: 'Alexander Fleming découvre la pénicilline en 1928.',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'svt-brev-005', subject: 'svt', emoji: '💉',
    question: 'Quel organisme cause la malaria ?',
    options: [
      { id: 'A', text: 'Un virus' },
      { id: 'B', text: 'Une bactérie' },
      { id: 'C', text: 'Un protozoaire (Plasmodium)' },
      { id: 'D', text: 'Un champignon' },
    ],
    correctOptionId: 'C',
    explanation: 'Plasmodium sp. transmis par les moustiques (Anophèle).',
    difficulty: 3, xpReward: 20
  },
  {
    id: 'svt-brev-006', subject: 'svt', emoji: '🌿',
    question: 'Quel est le rôle principal des racines ?',
    options: [
      { id: 'A', text: 'Fabriquer le glucose' },
      { id: 'B', text: 'Absorber l\'eau et les minéraux' },
      { id: 'C', text: 'Produire de l\'oxygène' },
      { id: 'D', text: 'Stocker l\'amidon' },
    ],
    correctOptionId: 'B',
    explanation: 'Absorption de l\'eau et des sels minéraux du sol.',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'svt-brev-007', subject: 'svt', emoji: '🫀',
    question: 'Quel est le plus grand os du corps humain ?',
    options: [
      { id: 'A', text: 'L\'humérus' },
      { id: 'B', text: 'Le tibia' },
      { id: 'C', text: 'Le fémur' },
      { id: 'D', text: 'Le sternum' },
    ],
    correctOptionId: 'C',
    explanation: 'Le fémur (os de la cuisse) est le plus long et résistant.',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'svt-brev-008', subject: 'svt', emoji: '🧠',
    question: 'Quel est le rôle du cerveau ?',
    options: [
      { id: 'A', text: 'Digérer' },
      { id: 'B', text: 'Contrôler les fonctions et traiter les infos' },
      { id: 'C', text: 'Purifier le sang' },
      { id: 'D', text: 'Produire de l\'énergie' },
    ],
    correctOptionId: 'B',
    explanation: 'Centre nerveux principal. Contrôle les fonctions vitales.',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'svt-brev-009', subject: 'svt', emoji: '🦠',
    question: 'Quel est l\'ordre de grandeur d\'une bactérie ?',
    options: [
      { id: 'A', text: '1 mm' },
      { id: 'B', text: '1 μm' },
      { id: 'C', text: '1 nm' },
      { id: 'D', text: '1 cm' },
    ],
    correctOptionId: 'B',
    explanation: 'Bactéries : 1-10 μm de diamètre (micromètres).',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'svt-brev-010', subject: 'svt', emoji: '🧬',
    question: 'Quel scientifique propose la théorie de l\'évolution ?',
    options: [
      { id: 'A', text: 'Darwin' },
      { id: 'B', text: 'Mendel' },
      { id: 'C', text: 'Pasteur' },
      { id: 'D', text: 'Lamarck' },
    ],
    correctOptionId: 'A',
    explanation: 'Charles Darwin : "L\'Origine des espèces" (1859).',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'svt-brev-011', subject: 'svt', emoji: '❤️',
    question: 'Quel est le rôle du cœur ?',
    options: [
      { id: 'A', text: 'Penser et émouvoir' },
      { id: 'B', text: 'Pomper le sang dans tout le corps' },
      { id: 'C', text: 'Digérer' },
      { id: 'D', text: 'Produire des anticorps' },
    ],
    correctOptionId: 'B',
    explanation: 'Le cœur pompe le sang riche en oxygène.',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'svt-brev-012', subject: 'svt', emoji: '⛓️',
    question: 'Dans une chaîne alimentaire, qui produit l\'énergie initiale ?',
    options: [
      { id: 'A', text: 'Les carnivores' },
      { id: 'B', text: 'Les producteurs (plantes)' },
      { id: 'C', text: 'Les décomposeurs' },
      { id: 'D', text: 'Les herbivores' },
    ],
    correctOptionId: 'B',
    explanation: 'Les producteurs (autotrophes) utilisent la photosynthèse.',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'svt-brev-013', subject: 'svt', emoji: '🔄',
    question: 'Quel processus permet aux plantes de créer du glucose ?',
    options: [
      { id: 'A', text: 'Respiration cellulaire' },
      { id: 'B', text: 'Fermentation' },
      { id: 'C', text: 'Photosynthèse' },
      { id: 'D', text: 'Transpiration' },
    ],
    correctOptionId: 'C',
    explanation: 'Photosynthèse : transformation de CO₂ et H₂O en glucose.',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'svt-brev-014', subject: 'svt', emoji: '🧫',
    question: 'Combien d\'étapes dans la mitose ?',
    options: [
      { id: 'A', text: '2' },
      { id: 'B', text: '3' },
      { id: 'C', text: '4' },
      { id: 'D', text: '5' },
    ],
    correctOptionId: 'C',
    explanation: 'Prophase → Métaphase → Anaphase → Télophase.',
    difficulty: 3, xpReward: 20
  },
  {
    id: 'svt-brev-015', subject: 'svt', emoji: '🌍',
    question: 'Quel est l\'écosystème le plus riche en biodiversité ?',
    options: [
      { id: 'A', text: 'Savane' },
      { id: 'B', text: 'Désert' },
      { id: 'C', text: 'Forêt tropicale' },
      { id: 'D', text: 'Toundra' },
    ],
    correctOptionId: 'C',
    explanation: 'Forêt tropicale : climat chaud/humide, +biodiversité.',
    difficulty: 2, xpReward: 15
  },
];

// ─────────────────────────────────────────────────────────────────
// PHYSIQUE-CHIMIE — 15 questions
// ─────────────────────────────────────────────────────────────────

const PHYSIQUE_BREVET: QuizQuestion[] = [
  {
    id: 'phys-brev-001', subject: 'physique', emoji: '⚡',
    question: 'Quel est le symbole chimique de l\'hydrogène ?',
    options: [
      { id: 'A', text: 'He' },
      { id: 'B', text: 'H' },
      { id: 'C', text: 'Ho' },
      { id: 'D', text: 'H₂' },
    ],
    correctOptionId: 'B',
    explanation: 'H = hydrogène (1 proton). H₂ = molécule.',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'phys-brev-002', subject: 'physique', emoji: '🔬',
    question: 'Quel est le pH d\'une solution neutre ?',
    options: [
      { id: 'A', text: '0' },
      { id: 'B', text: '7' },
      { id: 'C', text: '14' },
      { id: 'D', text: '3.5' },
    ],
    correctOptionId: 'B',
    explanation: 'pH = 7 = neutre. < 7 = acide, > 7 = basique.',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'phys-brev-003', subject: 'physique', emoji: '⚗️',
    question: 'Quel type de réaction crée l\'eau ?',
    options: [
      { id: 'A', text: 'Synthèse' },
      { id: 'B', text: 'Décomposition' },
      { id: 'C', text: 'Combustion' },
      { id: 'D', text: 'Redox' },
    ],
    correctOptionId: 'C',
    explanation: 'H₂ + O₂ → 2H₂O (combustion).',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'phys-brev-004', subject: 'physique', emoji: '💨',
    question: 'Quel gaz constitue ~78% de l\'air ?',
    options: [
      { id: 'A', text: 'L\'oxygène' },
      { id: 'B', text: 'Le dioxyde de carbone' },
      { id: 'C', text: 'L\'azote' },
      { id: 'D', text: 'L\'argon' },
    ],
    correctOptionId: 'C',
    explanation: 'N₂ = 78%, O₂ = 21%, autres = 1%.',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'phys-brev-005', subject: 'physique', emoji: '🔌',
    question: 'Loi d\'Ohm : formule correcte ?',
    options: [
      { id: 'A', text: 'U = R/I' },
      { id: 'B', text: 'U = R × I' },
      { id: 'C', text: 'R = U/I' },
      { id: 'D', text: 'I = U/R - 1' },
    ],
    correctOptionId: 'B',
    explanation: 'U = R × I ou R = U/I (tension = résistance × intensité).',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'phys-brev-006', subject: 'physique', emoji: '⚡',
    question: 'Quel est le symbole de l\'intensité électrique ?',
    options: [
      { id: 'A', text: 'U' },
      { id: 'B', text: 'R' },
      { id: 'C', text: 'I' },
      { id: 'D', text: 'P' },
    ],
    correctOptionId: 'C',
    explanation: 'I = intensité (Ampères). U = tension (Volts).',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'phys-brev-007', subject: 'physique', emoji: '🔬',
    question: 'Qu\'est-ce qu\'une réaction exothermique ?',
    options: [
      { id: 'A', text: 'Qui absorbe de l\'énergie' },
      { id: 'B', text: 'Qui libère de l\'énergie' },
      { id: 'C', text: 'Qui ne change pas l\'énergie' },
      { id: 'D', text: 'Qui change de couleur' },
    ],
    correctOptionId: 'B',
    explanation: 'Exothermique = libère chaleur (combustion, explosion).',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'phys-brev-008', subject: 'physique', emoji: '🌊',
    question: 'Quel est le temps mis par la lumière pour venir du Soleil ?',
    options: [
      { id: 'A', text: '8 minutes' },
      { id: 'B', text: '8 secondes' },
      { id: 'C', text: '80 minutes' },
      { id: 'D', text: '8 heures' },
    ],
    correctOptionId: 'A',
    explanation: 'Distance Terre-Soleil ÷ vitesse lumière = ~8 min.',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'phys-brev-009', subject: 'physique', emoji: '⚖️',
    question: 'La formule de la puissance électrique est ?',
    options: [
      { id: 'A', text: 'P = U × I' },
      { id: 'B', text: 'P = U / I' },
      { id: 'C', text: 'P = I² × R' },
      { id: 'D', text: 'P = U² / R' },
    ],
    correctOptionId: 'A',
    explanation: 'P = U × I (Watts = Volts × Ampères). P = I²R aussi juste.',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'phys-brev-010', subject: 'physique', emoji: '🔋',
    question: 'En électricité, qu\'est-ce qu\'un circuit en série ?',
    options: [
      { id: 'A', text: 'Les composants sont branchés l\'un après l\'autre' },
      { id: 'B', text: 'Les composants sont branchés en parallèle' },
      { id: 'C', text: 'Il y a plusieurs sources' },
      { id: 'D', text: 'Il n\'y a pas de courant' },
    ],
    correctOptionId: 'A',
    explanation: 'Série : I constant. Parallèle : U constant.',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'phys-brev-011', subject: 'physique', emoji: '🌡️',
    question: 'Quelle est l\'échelle de température utilisée en sciences ?',
    options: [
      { id: 'A', text: 'Celsius' },
      { id: 'B', text: 'Fahrenheit' },
      { id: 'C', text: 'Kelvin' },
      { id: 'D', text: 'Réaumur' },
    ],
    correctOptionId: 'C',
    explanation: 'Kelvin (K) : 0 K = -273°C (zéro absolu).',
    difficulty: 3, xpReward: 20
  },
  {
    id: 'phys-brev-012', subject: 'physique', emoji: '⚛️',
    question: 'Quel est le numéro atomique du carbone ?',
    options: [
      { id: 'A', text: '6' },
      { id: 'B', text: '8' },
      { id: 'C', text: '12' },
      { id: 'D', text: '14' },
    ],
    correctOptionId: 'A',
    explanation: 'C : 6 protons, 6 électrons. Masse = ~12.',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'phys-brev-013', subject: 'physique', emoji: '🔬',
    question: 'Qu\'est-ce qu\'une liaison ionique ?',
    options: [
      { id: 'A', text: 'Transfert d\'électrons entre atomes' },
      { id: 'B', text: 'Partage d\'électrons' },
      { id: 'C', text: 'Fusion d\'atomes' },
      { id: 'D', text: 'Attraction magnétique' },
    ],
    correctOptionId: 'A',
    explanation: 'Ionique = électron transféré (NaCl : Na⁺ + Cl⁻).',
    difficulty: 3, xpReward: 20
  },
  {
    id: 'phys-brev-014', subject: 'physique', emoji: '📏',
    question: 'Quel est le symbole du mètre ?',
    options: [
      { id: 'A', text: 'm' },
      { id: 'B', text: 'M' },
      { id: 'C', text: 'mt' },
      { id: 'D', text: 'm²' },
    ],
    correctOptionId: 'A',
    explanation: 'm = unité SI de longueur. M = méga = 10⁶.',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'phys-brev-015', subject: 'physique', emoji: '🎯',
    question: 'Quel scientifique formule la loi d\'Ohm ?',
    options: [
      { id: 'A', text: 'Georg Ohm' },
      { id: 'B', text: 'Michael Faraday' },
      { id: 'C', text: 'James Joule' },
      { id: 'D', text: 'Alessandro Volta' },
    ],
    correctOptionId: 'A',
    explanation: 'Georg Ohm (1787-1854) physicien allemand.',
    difficulty: 2, xpReward: 15
  },
];

// ─────────────────────────────────────────────────────────────────
// ANGLAIS — 15 questions
// ─────────────────────────────────────────────────────────────────

const ANGLAIS_BREVET: QuizQuestion[] = [
  {
    id: 'ang-brev-001', subject: 'anglais', emoji: '🇬🇧',
    question: 'Traduction anglaise de "Je suis heureux"',
    options: [
      { id: 'A', text: 'I am happy' },
      { id: 'B', text: 'I have happy' },
      { id: 'C', text: 'I am happily' },
      { id: 'D', text: 'I happy am' },
    ],
    correctOptionId: 'A',
    explanation: '"I am" + adjectif. Be + adjective.',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'ang-brev-002', subject: 'anglais', emoji: '💬',
    question: 'Quel est le passé de "go" ?',
    options: [
      { id: 'A', text: 'goed' },
      { id: 'B', text: 'went' },
      { id: 'C', text: 'goes' },
      { id: 'D', text: 'going' },
    ],
    correctOptionId: 'B',
    explanation: 'Go → went (verbe irrégulier).',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'ang-brev-003', subject: 'anglais', emoji: '📚',
    question: 'Complète : "If I _____ you, I would help."',
    options: [
      { id: 'A', text: 'see' },
      { id: 'B', text: 'saw' },
      { id: 'C', text: 'had seen' },
      { id: 'D', text: 'would see' },
    ],
    correctOptionId: 'B',
    explanation: 'Irréel du présent : If + past → would + infinitive.',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'ang-brev-004', subject: 'anglais', emoji: '🗣️',
    question: 'Quel est le present perfect de "eat" ?',
    options: [
      { id: 'A', text: 'I am eating' },
      { id: 'B', text: 'I have eaten' },
      { id: 'C', text: 'I will eat' },
      { id: 'D', text: 'I ate' },
    ],
    correctOptionId: 'B',
    explanation: 'Present perfect = have/has + participe passé.',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'ang-brev-005', subject: 'anglais', emoji: '💭',
    question: 'Quel est le superlatif de "good" ?',
    options: [
      { id: 'A', text: 'gooder' },
      { id: 'B', text: 'more good' },
      { id: 'C', text: 'best' },
      { id: 'D', text: 'more better' },
    ],
    correctOptionId: 'C',
    explanation: 'Good → better → best (irrégulier).',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'ang-brev-006', subject: 'anglais', emoji: '🎯',
    question: 'Traduction : "Je dois aller à l\'école"',
    options: [
      { id: 'A', text: 'I must go to school' },
      { id: 'B', text: 'I should go to school' },
      { id: 'C', text: 'I have to go to school' },
      { id: 'D', text: 'Both A and C' },
    ],
    correctOptionId: 'D',
    explanation: 'Must ou have to (obligation).',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'ang-brev-007', subject: 'anglais', emoji: '📝',
    question: 'Complète : "There _____ many students in the class."',
    options: [
      { id: 'A', text: 'is' },
      { id: 'B', text: 'are' },
      { id: 'C', text: 'be' },
      { id: 'D', text: 'being' },
    ],
    correctOptionId: 'B',
    explanation: '"There are" + pluriel. "There is" + singulier.',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'ang-brev-008', subject: 'anglais', emoji: '🗨️',
    question: 'Quel est le participe passé de "break" ?',
    options: [
      { id: 'A', text: 'breaked' },
      { id: 'B', text: 'broken' },
      { id: 'C', text: 'brake' },
      { id: 'D', text: 'breaking' },
    ],
    correctOptionId: 'B',
    explanation: 'Break → broke → broken (irrégulier).',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'ang-brev-009', subject: 'anglais', emoji: '💬',
    question: 'Quel est le futur de "will not go" ?',
    options: [
      { id: 'A', text: 'won\'t go' },
      { id: 'B', text: 'will not goes' },
      { id: 'C', text: 'won\'t goes' },
      { id: 'D', text: 'willn\'t go' },
    ],
    correctOptionId: 'A',
    explanation: 'Will not → won\'t (contraction standard).',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'ang-brev-010', subject: 'anglais', emoji: '📚',
    question: 'Quel est le traducteur du mot "book" ?',
    options: [
      { id: 'A', text: 'Livre' },
      { id: 'B', text: 'Boîte' },
      { id: 'C', text: 'Bouche' },
      { id: 'D', text: 'Banque' },
    ],
    correctOptionId: 'A',
    explanation: 'Book = livre (ouvrage).',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'ang-brev-011', subject: 'anglais', emoji: '🗣️',
    question: 'Phrase correcte au passé ?',
    options: [
      { id: 'A', text: 'I go to the park yesterday' },
      { id: 'B', text: 'I went to the park yesterday' },
      { id: 'C', text: 'I was going to the park yesterday' },
      { id: 'D', text: 'I have been to the park yesterday' },
    ],
    correctOptionId: 'B',
    explanation: 'Yesterday = passé simple (went).',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'ang-brev-012', subject: 'anglais', emoji: '💭',
    question: 'Quel est le génitif possessif de "James" ?',
    options: [
      { id: 'A', text: 'James\' book' },
      { id: 'B', text: 'Jame\'s book' },
      { id: 'C', text: 'James book' },
      { id: 'D', text: 'James\'s book' },
    ],
    correctOptionId: 'A',
    explanation: 'S finissant : apostrophe après (James\' ou James\'s).',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'ang-brev-013', subject: 'anglais', emoji: '📖',
    question: 'Traduit "Je voudrais de l\'eau"',
    options: [
      { id: 'A', text: 'I want water' },
      { id: 'B', text: 'I would like some water' },
      { id: 'C', text: 'I like water' },
      { id: 'D', text: 'I wish water' },
    ],
    correctOptionId: 'B',
    explanation: '"Would like" = formel / poli. "Want" = direct.',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'ang-brev-014', subject: 'anglais', emoji: '🎯',
    question: 'Complète : "She doesn\'t _____ coffee."',
    options: [
      { id: 'A', text: 'like' },
      { id: 'B', text: 'likes' },
      { id: 'C', text: 'liking' },
      { id: 'D', text: 'to like' },
    ],
    correctOptionId: 'A',
    explanation: 'Does + verbe à l\'infinitif (sans "to").',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'ang-brev-015', subject: 'anglais', emoji: '🗨️',
    question: 'Quel est le pluriel de "child" ?',
    options: [
      { id: 'A', text: 'childs' },
      { id: 'B', text: 'childes' },
      { id: 'C', text: 'children' },
      { id: 'D', text: 'childrens' },
    ],
    correctOptionId: 'C',
    explanation: 'Child → children (pluriel irrégulier).',
    difficulty: 1, xpReward: 10
  },
];

// ─────────────────────────────────────────────────────────────────
// ESPAGNOL — 10 questions
// ─────────────────────────────────────────────────────────────────

const ESPAGNOL_BREVET: QuizQuestion[] = [
  {
    id: 'esp-brev-001', subject: 'espagnol', emoji: '🇪🇸',
    question: 'Traduction de "bonjour" en espagnol ?',
    options: [
      { id: 'A', text: 'Buenos días' },
      { id: 'B', text: 'Buenas noches' },
      { id: 'C', text: 'Buenas tardes' },
      { id: 'D', text: 'Hola' },
    ],
    correctOptionId: 'A',
    explanation: 'Buenos días = bonjour (matin). Hola = salut.',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'esp-brev-002', subject: 'espagnol', emoji: '💬',
    question: 'Quel est le passé de "ir" (aller) ?',
    options: [
      { id: 'A', text: 'irá' },
      { id: 'B', text: 'fue' },
      { id: 'C', text: 'voy' },
      { id: 'D', text: 'ido' },
    ],
    correctOptionId: 'B',
    explanation: 'Ir → fui (passé simple, irrégulier).',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'esp-brev-003', subject: 'espagnol', emoji: '📚',
    question: 'Traduit "Je m\'appelle Maria"',
    options: [
      { id: 'A', text: 'Yo soy María' },
      { id: 'B', text: 'Me llamo María' },
      { id: 'C', text: 'Yo llamo María' },
      { id: 'D', text: 'Llamome María' },
    ],
    correctOptionId: 'B',
    explanation: '"Me llamo" = je m\'appelle.',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'esp-brev-004', subject: 'espagnol', emoji: '🗣️',
    question: 'Quel est le futur de "hablar" ?',
    options: [
      { id: 'A', text: 'hablaba' },
      { id: 'B', text: 'hablaré' },
      { id: 'C', text: 'hablo' },
      { id: 'D', text: 'hablé' },
    ],
    correctOptionId: 'B',
    explanation: 'Hablar → hablaré (1ᵉ pers. sing. futur).',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'esp-brev-005', subject: 'espagnol', emoji: '💭',
    question: 'Quel est le pluriel de "chico" ?',
    options: [
      { id: 'A', text: 'chicos' },
      { id: 'B', text: 'chicoes' },
      { id: 'C', text: 'chicoss' },
      { id: 'D', text: 'chice' },
    ],
    correctOptionId: 'A',
    explanation: 'O → os (pluriel régulier).',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'esp-brev-006', subject: 'espagnol', emoji: '📖',
    question: 'Traduit "El libro es rojo"',
    options: [
      { id: 'A', text: 'Le livre est bleu' },
      { id: 'B', text: 'Le livre est rouge' },
      { id: 'C', text: 'Le livre est green' },
      { id: 'D', text: 'Le livre est noir' },
    ],
    correctOptionId: 'B',
    explanation: 'Rojo = rouge. El libro = le livre.',
    difficulty: 1, xpReward: 10
  },
  {
    id: 'esp-brev-007', subject: 'espagnol', emoji: '🎯',
    question: 'Complète : "¿Dónde _____ la estación?"',
    options: [
      { id: 'A', text: 'es' },
      { id: 'B', text: 'está' },
      { id: 'C', text: 'es está' },
      { id: 'D', text: 'son' },
    ],
    correctOptionId: 'B',
    explanation: 'Estar = lieu (Dónde está = où est). Ser = essence.',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'esp-brev-008', subject: 'espagnol', emoji: '💬',
    question: 'Quel est le gérondif de "hablar" ?',
    options: [
      { id: 'A', text: 'hablado' },
      { id: 'B', text: 'hablando' },
      { id: 'C', text: 'hablaré' },
      { id: 'D', text: 'hablante' },
    ],
    correctOptionId: 'B',
    explanation: 'Gérondif : ar → ando, er/ir → iendo.',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'esp-brev-009', subject: 'espagnol', emoji: '🗨️',
    question: 'Traduit "Je suis espagnol(e)"',
    options: [
      { id: 'A', text: 'Estoy española' },
      { id: 'B', text: 'Soy español(a)' },
      { id: 'C', text: 'Yo soy espańol' },
      { id: 'D', text: 'Tengo español' },
    ],
    correctOptionId: 'B',
    explanation: 'Ser = nationalité, nature. Estar = lieu, état.',
    difficulty: 2, xpReward: 15
  },
  {
    id: 'esp-brev-010', subject: 'espagnol', emoji: '📚',
    question: 'Quelle est la capitale de l\'Espagne ?',
    options: [
      { id: 'A', text: 'Barcelona' },
      { id: 'B', text: 'Madrid' },
      { id: 'C', text: 'Valencia' },
      { id: 'D', text: 'Sevilla' },
    ],
    correctOptionId: 'B',
    explanation: 'Madrid est la capitale et plus grande ville.',
    difficulty: 1, xpReward: 10
  },
];

export {
  MATHS_BREVET,
  FRANCAIS_BREVET,
  HISTOIRE_BREVET,
  SVT_BREVET,
  PHYSIQUE_BREVET,
  ANGLAIS_BREVET,
  ESPAGNOL_BREVET,
};
