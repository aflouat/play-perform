import type { QuizDifficulty, QuizQuestion, QuizOptionId } from '@/types';
import { DIFFICULTY_META } from '@/types';

const IDS: QuizOptionId[] = ['A', 'B', 'C', 'D'];

/** Compact builder: the right answer is given by index. Facts come from platform.claude.com/docs. */
function mk(n: number, difficulty: QuizDifficulty, question: string, options: [string, string, string, string],
  correct: number, explanation: string): QuizQuestion {
  return {
    id: `claude-${String(n).padStart(2, '0')}`, subject: 'informatique', emoji: '🤖', question,
    options: options.map((text, i) => ({ id: IDS[i], text })) as QuizQuestion['options'],
    correctOptionId: IDS[correct], explanation, difficulty, xpReward: DIFFICULTY_META[difficulty].xpBase,
  };
}

/** Questions for the "Claude Platform" skill (stored under the closest existing subject: informatique). */
export const CLAUDE_PLATFORM_BANK: QuizQuestion[] = [
  mk(1, 1, 'Quelle requête HTTP permet d’envoyer des messages à Claude avec l’API Messages ?',
    ['GET /v1/chat', 'POST /v1/messages', 'PUT /v1/completions', 'POST /v1/generate'], 1,
    'L’API Messages s’appelle avec POST /v1/messages, sur https://api.anthropic.com.'),
  mk(2, 1, 'Où crée-t-on une clé d’API pour utiliser Claude ?',
    ['Dans la Claude Console (platform.claude.com)', 'Dans un fichier .env généré automatiquement', 'Sur GitHub', 'Elle est identique pour tout le monde'], 0,
    'Les clés se créent dans la Console, dans les paramètres du compte ; on peut les répartir par workspace.'),
  mk(3, 1, 'À quoi servent les SDK officiels (Python, TypeScript, Go…) ?',
    ['À entraîner un modèle', 'À simplifier les appels : en-têtes, réessais, streaming, types',
      'À remplacer la clé d’API', 'À héberger les modèles chez soi'], 1,
    'Les SDK gèrent l’authentification, la version, le format des requêtes, les réessais et le streaming.'),
  mk(4, 2, 'Quel en-tête obligatoire indique la version de l’API (par exemple 2023-06-01) ?',
    ['x-api-version', 'anthropic-version', 'accept-version', 'content-version'], 1,
    'Chaque requête doit contenir anthropic-version, avec content-type: application/json et la clé (Authorization ou x-api-key).'),
  mk(5, 2, 'Pour traiter un grand nombre de requêtes sans attendre la réponse, que choisir ?',
    ['L’API Message Batches (asynchrone, 50 % moins cher)', 'Augmenter max_tokens', 'Utiliser plusieurs clés d’API', 'Désactiver le streaming'], 0,
    'L’API Message Batches traite les requêtes de façon asynchrone avec 50 % de réduction de coût.'),
  mk(6, 2, 'Quel point d’entrée compte les tokens d’un message avant de l’envoyer ?',
    ['POST /v1/messages/count_tokens', 'GET /v1/tokens', 'POST /v1/models', 'GET /v1/usage'], 0,
    'L’API Token Counting (POST /v1/messages/count_tokens) aide à maîtriser les coûts et les limites de débit.'),
  mk(7, 3, 'Que signifie stop_reason = "max_tokens" ?',
    ['La réponse est terminée normalement', 'La réponse a atteint la limite max_tokens et peut être tronquée',
      'Le modèle a refusé de répondre', 'La clé a dépassé son quota'], 1,
    'La génération s’est arrêtée à la limite fixée : augmenter max_tokens ou demander la suite.'),
  mk(8, 3, 'Quand stop_reason vaut "tool_use", que doit faire votre code ?',
    ['Rien : la réponse est finale', 'Exécuter l’outil demandé puis renvoyer son résultat à Claude',
      'Relancer la même requête', 'Changer de modèle'], 1,
    'Claude demande d’appeler un outil : on l’exécute, puis on renvoie un tool_result dans le message suivant.'),
  mk(9, 3, 'stop_reason est présent dans…',
    ['Les seules erreurs HTTP 4xx', 'Les réponses réussies (HTTP 200)', 'Les en-têtes de réponse uniquement', 'Les logs de la Console'], 1,
    'stop_reason fait partie d’une réponse réussie ; en streaming il arrive dans l’événement message_delta.'),
  mk(10, 3, 'Quelle erreur reçoit-on si une requête Messages dépasse la taille maximale (32 Mo) ?',
    ['429 rate_limit_error', '401 authentication_error', '413 request_too_large', '500 api_error'], 2,
    'Dépasser la limite de taille renvoie une erreur 413 request_too_large.'),
  mk(11, 4, 'Combien coûte la lecture d’un cache de prompt (TTL de 5 min) par rapport au prix d’entrée de base ?',
    ['Environ 10 %', '100 %', '125 %', '200 %'], 0,
    'Les lectures de cache coûtent 0,1× le prix d’entrée ; l’écriture 5 min coûte 1,25× et l’écriture 1 h 2×.'),
  mk(12, 4, 'Dans quel ordre le cache de prompt considère-t-il le contenu ?',
    ['messages → system → tools', 'tools → system → messages', 'system → messages → tools', 'Dans l’ordre alphabétique'], 1,
    'Le préfixe suit tools → system → messages : un changement à un niveau invalide ce niveau et les suivants.'),
  mk(13, 4, 'Comment demander un cache de prompt d’une heure au lieu de 5 minutes ?',
    ['cache_control: {"type":"ephemeral","ttl":"1h"}', 'max_tokens: 3600', 'anthropic-version: 1h', 'Impossible'], 0,
    'On ajoute ttl: "1h" au cache_control ; l’écriture coûte alors 2× le prix d’entrée de base.'),
  mk(14, 4, 'stop_reason = "pause_turn" signale…',
    ['Que l’utilisateur a mis la conversation en pause', 'Que la boucle d’outils serveur a atteint sa limite d’itérations : renvoyer le contenu pour continuer',
      'Un dépassement de quota', 'Une erreur de réseau'], 1,
    'pause_turn : la boucle d’outils côté serveur est arrivée à sa limite (10 par défaut) ; on renvoie le contenu assistant pour poursuivre.'),
];
