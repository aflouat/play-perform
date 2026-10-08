import type { SkillLevelNumber } from '../domain/skill';

/** Open questions by skill, level 1 → 5. The examiner reads the answer and decides. */
const PROMPTS: Record<string, readonly string[]> = {
  'maths-fractions': [
    'Explique avec tes mots ce que veut dire la fraction 3/4 et dessine-la en la décrivant.',
    'Montre comment tu additionnes 1/2 et 1/3. Détaille chaque étape.',
    'Comment compares-tu 5/8 et 2/3 ? Explique ta méthode et donne la réponse.',
    'Un article à 120 € est soldé de 35 %. Explique comment calculer le prix final de deux façons différentes.',
    'Explique pourquoi diviser par une fraction revient à multiplier par son inverse, avec un exemple concret.',
  ],
  'francais-accords': [
    'Écris trois phrases où tu accordes correctement un adjectif avec un nom féminin pluriel, puis explique la règle.',
    'Conjugue « finir » au présent et à l’imparfait avec « nous », et explique la différence d’emploi.',
    'Explique quand le participe passé s’accorde avec l’auxiliaire avoir, avec deux exemples.',
    'Explique la différence entre indicatif et subjonctif et écris deux phrases qui les illustrent.',
    'Réécris un court paragraphe de ton choix au passé simple puis justifie les accords du participe passé.',
  ],
  'histoire-reperes': [
    'Cite trois événements de l’histoire de France et place-les dans l’ordre chronologique.',
    'Explique en quelques phrases pourquoi la Révolution française a commencé en 1789.',
    'Compare la vie d’un paysan au Moyen Âge et celle d’un ouvrier au XIXᵉ siècle.',
    'Explique les causes de la Première Guerre mondiale en les classant par importance.',
    'Argumente : la Seconde Guerre mondiale est-elle la conséquence directe de la Première ? Appuie-toi sur des faits.',
  ],
  'svt-vivant': [
    'Décris le trajet d’un aliment dans le corps, de la bouche à l’intestin.',
    'Explique le rôle du cœur et des poumons quand on fait du sport.',
    'Explique comment une plante fabrique sa matière avec la lumière (photosynthèse).',
    'Explique comment la sélection naturelle fait évoluer une population, avec un exemple.',
    'Compare reproduction sexuée et asexuée : avantages et limites pour une espèce.',
  ],
  'physique-energie': [
    'Cite trois formes d’énergie et un objet du quotidien qui les utilise.',
    'Explique la différence entre masse et poids avec un exemple.',
    'Un objet de 2 kg tombe d’une hauteur de 5 m : explique les transformations d’énergie.',
    'Explique la loi d’Ohm et calcule l’intensité dans une résistance de 100 Ω sous 12 V.',
    'Explique pourquoi une réaction chimique conserve la masse et illustre avec un exemple.',
  ],
  'anglais-comprendre': [
    'Write three simple sentences about your day (in English) using the present simple.',
    'Write a short message to a friend telling what you did last weekend (past simple).',
    'Explain in English the difference between « I have been » and « I went ».',
    'Write a short paragraph (5 sentences) giving your opinion on school uniforms, with reasons.',
    'Write a formal email asking for information about a summer course, using polite expressions.',
  ],
  logique: [
    'Complète la suite 2, 4, 8, 16, … et explique la règle que tu as trouvée.',
    'Trois amis ont chacun un animal différent (chat, chien, poisson). Décris une façon de retrouver qui a quoi avec deux indices.',
    'Explique la différence entre une condition nécessaire et une condition suffisante, avec un exemple.',
    'Voici une affirmation : « Tous les élèves de la classe aiment les maths ». Comment montrer qu’elle est fausse ?',
    'Construis un raisonnement par l’absurde pour montrer qu’il n’existe pas de plus grand nombre entier.',
  ],
  'claude-platform-docs': [
    'Explique avec tes mots ce qu’est une clé d’API et où on la crée pour utiliser Claude.',
    'Décris les éléments d’une requête vers l’API Messages : l’endpoint, les en-têtes obligatoires et les paramètres principaux.',
    'Explique à quoi servent le champ stop_reason et deux de ses valeurs, et ce que ton code doit faire pour chacune.',
    'Explique comment fonctionne une boucle d’appel d’outil (tool use) : qui fait quoi, et dans quel ordre.',
    'Tu dois réduire le coût d’un assistant qui renvoie toujours le même long contexte. Explique le cache de prompt : où placer le point de cache, le TTL, les coûts, et ce qui l’invalide.',
  ],
  methode: [
    'Décris comment tu prépares ton sac et ton bureau pour faire tes devoirs.',
    'Explique comment tu organises ta semaine pour réviser un contrôle dans cinq jours.',
    'Décris deux méthodes pour mémoriser une leçon et dis laquelle te convient le mieux, pourquoi.',
    'Explique comment tu fais pour te concentrer quand tu es distrait et ce que tu changerais.',
    'Fais le bilan d’un travail récent : ce qui a marché, ce qui a manqué, ce que tu feras la prochaine fois.',
  ],
};

export function getEvaluationPrompt(skillId: string, level: SkillLevelNumber): string {
  return PROMPTS[skillId]?.[level - 1] ?? '';
}
