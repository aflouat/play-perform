import { q } from './placement-question';

/** Placement questions — Claude Platform (docs). Index of the right option is the last argument. */
export const PLACEMENT_BANK_C = [
  q('claude-platform-docs', 1, 'Quelle requête permet d’envoyer un message à Claude avec l’API Messages ?',
    ['GET /v1/chat', 'POST /v1/messages', 'PUT /v1/completions', 'POST /v1/generate'], 1),
  q('claude-platform-docs', 2, 'Quel en-tête obligatoire indique la version de l’API ?',
    ['x-api-version', 'accept-version', 'anthropic-version', 'content-version'], 2),
  q('claude-platform-docs', 3, 'Que signifie stop_reason = "max_tokens" ?',
    ['Le modèle a fini normalement', 'La réponse a atteint la limite fixée et peut être tronquée', 'La clé est invalide', 'Le modèle a refusé de répondre'], 1),
  q('claude-platform-docs', 4, 'Combien coûte une lecture de cache de prompt (TTL 5 min) par rapport au prix d’entrée de base ?',
    ['Environ 10 %', '100 %', '125 %', '200 %'], 0),
  q('claude-platform-docs', 5, 'Une application renvoie toujours le même long contexte. Quel agencement maximise les hits de cache ?', [
    'Placer le contexte statique en tête, le point de cache après lui, et le contenu variable à la fin',
    'Mettre le contenu variable en premier pour qu’il soit mis en cache',
    'Désactiver le cache pour éviter les erreurs', 'Changer de clé d’API à chaque requête'], 0),
];
