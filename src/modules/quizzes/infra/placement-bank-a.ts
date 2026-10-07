import { q } from './placement-question';

/** Placement questions — maths, français, histoire, SVT. Index of the right option is the last argument. */
export const PLACEMENT_BANK_A = [
  q('maths-fractions', 1, 'Combien font 1/2 + 1/2 ?', ['1/4', '2/4', '1', '2'], 2),
  q('maths-fractions', 2, 'Quelle fraction est égale à 3/4 ?', ['6/8', '4/3', '3/8', '9/16'], 0),
  q('maths-fractions', 3, 'Combien font 2/3 + 1/6 ?', ['3/9', '1/2', '3/6', '5/6'], 3),
  q('maths-fractions', 4, 'Un article à 80 € est soldé de 25 %. Quel est son nouveau prix ?', ['55 €', '60 €', '64 €', '75 €'], 1),
  q('maths-fractions', 5, 'Dans une classe de 30 élèves, 3/5 sont des filles et 2/3 des filles font du sport. Combien de filles font du sport ?',
    ['10', '18', '20', '12'], 3),

  q('francais-accords', 1, 'Quel est le pluriel de « un cheval » ?', ['des chevals', 'des chevaux', 'des chevauxs', 'des chevales'], 1),
  q('francais-accords', 2, 'Complète : « Hier soir, nous ___ au cinéma. »', ['sommes allés', 'avons allé', 'allons', 'irons'], 0),
  q('francais-accords', 3, 'Quelle phrase est correctement accordée ?', [
    'Les fleurs que j’ai cueilli sont belles.', 'Les fleurs que j’ai cueillis sont belles.',
    'Les fleurs que j’ai cueillies sont belles.', 'Les fleurs que j’ai cueillie sont belles.'], 2),
  q('francais-accords', 4, 'Dans « Il faut que tu viennes », à quel mode est le verbe « venir » ?',
    ['Indicatif', 'Conditionnel', 'Impératif', 'Subjonctif'], 3),
  q('francais-accords', 5, 'Dans « Elle s’est permis quelques remarques », pourquoi « permis » ne s’accorde-t-il pas ?', [
    'Le complément d’objet direct est placé après le verbe', 'Un verbe pronominal ne s’accorde jamais',
    '« Permis » est ici un nom', 'Le sujet est au féminin'], 0),

  q('histoire-reperes', 1, 'En quelle année a eu lieu la prise de la Bastille ?', ['1492', '1789', '1815', '1914'], 1),
  q('histoire-reperes', 2, 'Qui est sacré empereur des Français en 1804 ?', ['Louis XVI', 'Charlemagne', 'Napoléon Bonaparte', 'Louis XIV'], 2),
  q('histoire-reperes', 3, 'Quel traité, signé en 1919, met fin à la Première Guerre mondiale avec l’Allemagne ?',
    ['Le traité de Versailles', 'Le traité de Rome', 'Le traité de Maastricht', 'Le traité de Westphalie'], 0),
  q('histoire-reperes', 4, 'Qu’appelle-t-on la « guerre froide » (1947-1991) ?', [
    'Une guerre en Russie pendant l’hiver', 'Une guerre ouverte entre la France et l’Allemagne',
    'Un conflit limité à la Corée', 'Un affrontement indirect entre les États-Unis et l’URSS'], 3),
  q('histoire-reperes', 5, 'Que décide l’ordonnance de Villers-Cotterêts (1539) ?', [
    'L’abolition du servage', 'L’usage du français dans les actes officiels',
    'La création de l’école obligatoire', 'La séparation des Églises et de l’État'], 1),

  q('svt-vivant', 1, 'Quel organe pompe le sang dans tout le corps ?', ['Les poumons', 'Le foie', 'Le cœur', 'L’estomac'], 2),
  q('svt-vivant', 2, 'De quoi une plante verte a-t-elle besoin pour réaliser la photosynthèse ?', [
    'De lumière, d’eau et de dioxyde de carbone', 'Uniquement d’eau', 'D’oxygène et de sucre', 'Uniquement de terre'], 0),
  q('svt-vivant', 3, 'Où se trouve principalement l’information génétique (ADN) d’une cellule ?',
    ['Dans la membrane', 'Dans le noyau', 'Dans les globules rouges', 'Dans la paroi'], 1),
  q('svt-vivant', 4, 'Combien de chromosomes contient une cellule humaine (hors cellules reproductrices) ?', ['23', '44', '92', '46'], 3),
  q('svt-vivant', 5, 'Quel est le rôle des lymphocytes B ?', [
    'Transporter le dioxygène', 'Faire coaguler le sang', 'Produire des anticorps', 'Digérer les graisses'], 2),
];
