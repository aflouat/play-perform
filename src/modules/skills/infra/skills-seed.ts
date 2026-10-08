import type { Skill } from '../domain/skill';

/** Local seed for the POC (no backend yet). */
export const SKILLS_SEED: readonly Skill[] = [
  { id: 'maths-fractions', name: 'Fractions et proportions', domain: 'Mathématiques', emoji: '🧮',
    description: 'Calculer avec les fractions, les pourcentages et les proportions.' },
  { id: 'francais-accords', name: 'Accords et conjugaison', domain: 'Français', emoji: '✍️',
    description: 'Accorder, conjuguer et écrire sans faute.' },
  { id: 'histoire-reperes', name: 'Repères historiques', domain: 'Histoire-géo', emoji: '🏛️',
    description: 'Situer les grands événements dans le temps.' },
  { id: 'svt-vivant', name: 'Le vivant et le corps humain', domain: 'SVT', emoji: '🔬',
    description: 'Comprendre le fonctionnement du corps et du vivant.' },
  { id: 'physique-energie', name: 'Matière et énergie', domain: 'Physique-chimie', emoji: '⚡',
    description: 'Mesurer, calculer et expliquer les phénomènes physiques.' },
  { id: 'anglais-comprendre', name: "Comprendre l'anglais", domain: 'Anglais', emoji: '🇬🇧',
    description: 'Lire et construire des phrases en anglais.' },
  { id: 'logique', name: 'Logique et raisonnement', domain: 'Logique', emoji: '🧩',
    description: 'Repérer des suites, déduire et argumenter.' },
  { id: 'methode', name: 'Méthode de travail', domain: 'Méthode', emoji: '🗂️',
    description: 'Apprendre, réviser et s’organiser efficacement.' },
  { id: 'claude-platform-docs', name: 'Claude Platform (docs)', domain: 'IA et développement', emoji: '🤖',
    description: "Utiliser l'API Claude : messages, outils, cache de prompt, limites et bonnes pratiques." },
];
