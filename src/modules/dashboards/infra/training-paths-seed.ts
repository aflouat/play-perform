import type { TrainingPath } from '../domain/training-path';

/** Training paths (POC: local seed, common to every centre like the skills catalogue). Same 4 phases, different chapters. */
const PATHS: readonly TrainingPath[] = [
  { id: 'college', name: 'Réussir au collège', emoji: '🎒', description: 'Les fondamentaux du collège jusqu’au brevet.', phases: {
    fondations: { weeks: 3, chapters: [
      { title: 'Apprendre à apprendre', skillId: 'methode', targetLevel: 2 },
      { title: 'Repérer et déduire', skillId: 'logique', targetLevel: 1 },
    ] },
    bases: { weeks: 4, chapters: [
      { title: 'Fractions et proportions', skillId: 'maths-fractions', targetLevel: 2, requires: { skillId: 'logique', level: 2 } },
      { title: 'Accorder et conjuguer', skillId: 'francais-accords', targetLevel: 2, requires: { skillId: 'methode', level: 2 } },
      { title: 'Les grands repères', skillId: 'histoire-reperes', targetLevel: 2 },
    ] },
    consolidation: { weeks: 5, chapters: [
      { title: 'Pourcentages et calculs', skillId: 'maths-fractions', targetLevel: 3, requires: { skillId: 'logique', level: 3 } },
      { title: 'Matière et énergie', skillId: 'physique-energie', targetLevel: 2, requires: { skillId: 'maths-fractions', level: 2 } },
      { title: 'Comprendre un texte en anglais', skillId: 'anglais-comprendre', targetLevel: 3 },
    ] },
    approfondissement: { weeks: 6, chapters: [
      { title: 'Argumenter et justifier', skillId: 'logique', targetLevel: 4 },
      { title: 'Problèmes niveau brevet', skillId: 'maths-fractions', targetLevel: 4, requires: { skillId: 'logique', level: 4 } },
      { title: 'Le corps humain', skillId: 'svt-vivant', targetLevel: 3 },
    ] },
  } },
  { id: 'technicien-laboratoire', name: 'Technicien(ne) de laboratoire', emoji: '🧪', description: 'Mesurer, préparer et analyser des échantillons en sécurité.', phases: {
    fondations: { weeks: 3, chapters: [
      { title: 'Organiser son poste et tenir son cahier de laboratoire', skillId: 'methode', targetLevel: 2 },
      { title: 'Sécurité, pictogrammes et unités de mesure', skillId: 'physique-energie', targetLevel: 1 },
    ] },
    bases: { weeks: 4, chapters: [
      { title: 'Proportions, dilutions et concentrations', skillId: 'maths-fractions', targetLevel: 2, requires: { skillId: 'methode', level: 2 } },
      { title: 'Matière, mélanges et solutions', skillId: 'physique-energie', targetLevel: 2, requires: { skillId: 'maths-fractions', level: 1 } },
      { title: 'La cellule et les micro-organismes', skillId: 'svt-vivant', targetLevel: 2 },
    ] },
    consolidation: { weeks: 5, chapters: [
      { title: 'Mesures, incertitudes et protocoles', skillId: 'physique-energie', targetLevel: 3, requires: { skillId: 'maths-fractions', level: 2 } },
      { title: 'Analyses biologiques et échantillons', skillId: 'svt-vivant', targetLevel: 3 },
      { title: 'Lire une fiche technique en anglais', skillId: 'anglais-comprendre', targetLevel: 2 },
    ] },
    approfondissement: { weeks: 6, chapters: [
      { title: 'Rédiger un compte rendu d’analyse', skillId: 'francais-accords', targetLevel: 3, requires: { skillId: 'methode', level: 2 } },
      { title: 'Contrôle qualité : détecter une anomalie', skillId: 'logique', targetLevel: 3 },
      { title: 'Réactions chimiques et énergie', skillId: 'physique-energie', targetLevel: 4, requires: { skillId: 'maths-fractions', level: 3 } },
    ] },
  } },
  { id: 'mathematiques', name: 'Mathématiques', emoji: '📐', description: 'Raisonner, calculer et démontrer.', phases: {
    fondations: { weeks: 3, chapters: [
      { title: 'Vocabulaire et logique mathématique', skillId: 'logique', targetLevel: 2 },
      { title: 'Chercher, essayer, vérifier', skillId: 'methode', targetLevel: 1 },
    ] },
    bases: { weeks: 4, chapters: [
      { title: 'Fractions et nombres rationnels', skillId: 'maths-fractions', targetLevel: 2, requires: { skillId: 'logique', level: 2 } },
      { title: 'Démontrer pas à pas', skillId: 'logique', targetLevel: 3 },
    ] },
    consolidation: { weeks: 5, chapters: [
      { title: 'Proportionnalité et pourcentages', skillId: 'maths-fractions', targetLevel: 3, requires: { skillId: 'logique', level: 3 } },
      { title: 'Modéliser un phénomène physique', skillId: 'physique-energie', targetLevel: 2, requires: { skillId: 'maths-fractions', level: 2 } },
    ] },
    approfondissement: { weeks: 6, chapters: [
      { title: 'Raisonnement par l’absurde et contre-exemples', skillId: 'logique', targetLevel: 4 },
      { title: 'Calcul avancé et problèmes ouverts', skillId: 'maths-fractions', targetLevel: 4, requires: { skillId: 'logique', level: 4 } },
      { title: 'Rédiger une démonstration', skillId: 'francais-accords', targetLevel: 3 },
    ] },
  } },
];

export function getTrainingPaths(): readonly TrainingPath[] {
  return PATHS;
}

export function getTrainingPath(id: string | null): TrainingPath | null {
  return PATHS.find((p) => p.id === id) ?? null;
}
