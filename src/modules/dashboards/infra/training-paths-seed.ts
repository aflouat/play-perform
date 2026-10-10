import type { TrainingPath } from '../domain/training-path';

/**
 * Built-in training paths: the content of the `training_paths` table at its creation (migration 20261022000000),
 * and the fallback when the database is unreachable. The parent company edits the catalogue in /admin/formations.
 */
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
      { title: 'Sécurité : pictogrammes, EPI et bons gestes', skillId: 'labo-securite', targetLevel: 2 },
      { title: 'Organiser son poste et tenir son cahier de laboratoire', skillId: 'labo-qualite', targetLevel: 1 },
      { title: 'Unités, conversions et proportions', skillId: 'maths-fractions', targetLevel: 2 },
    ] },
    bases: { weeks: 4, chapters: [
      { title: 'Préparer une solution et calculer une concentration', skillId: 'labo-solutions', targetLevel: 2, requires: { skillId: 'maths-fractions', level: 2 } },
      { title: 'Verrerie, pesée et mesure de volume', skillId: 'labo-mesures', targetLevel: 2, requires: { skillId: 'labo-securite', level: 2 } },
      { title: 'La cellule et les micro-organismes', skillId: 'svt-vivant', targetLevel: 2 },
    ] },
    consolidation: { weeks: 5, chapters: [
      { title: 'Dilutions et gammes d’étalonnage', skillId: 'labo-solutions', targetLevel: 3, requires: { skillId: 'labo-mesures', level: 2 } },
      { title: 'Incertitudes et expression d’un résultat', skillId: 'labo-mesures', targetLevel: 3, requires: { skillId: 'maths-fractions', level: 3 } },
      { title: 'Traçabilité et bonnes pratiques de laboratoire', skillId: 'labo-qualite', targetLevel: 3 },
      { title: 'Lire une fiche technique en anglais', skillId: 'anglais-comprendre', targetLevel: 2 },
    ] },
    approfondissement: { weeks: 6, chapters: [
      { title: 'Dosages et titrages', skillId: 'labo-solutions', targetLevel: 4, requires: { skillId: 'labo-mesures', level: 3 } },
      { title: 'Contrôle qualité : cartes de contrôle et non-conformités', skillId: 'labo-qualite', targetLevel: 4, requires: { skillId: 'labo-mesures', level: 3 } },
      { title: 'Risques chimiques et biologiques : analyse de poste', skillId: 'labo-securite', targetLevel: 4 },
      { title: 'Rédiger un compte rendu d’analyse', skillId: 'francais-accords', targetLevel: 3 },
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
