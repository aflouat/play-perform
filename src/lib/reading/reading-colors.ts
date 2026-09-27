/**
 * Couleurs de lecture : deux teintes contrastées alternées (contraste ≥ 4.5:1 sur blanc),
 * gris clair pour les lettres muettes. Les arcs donnent un repère qui ne dépend pas de la couleur.
 */
export const SYLLABLE_TEXT = ['text-blue-700', 'text-red-600'] as const;
export const SYLLABLE_ARC = ['border-blue-700', 'border-red-600'] as const;
export const SILENT_TEXT = 'text-slate-400';
/** Surlignage de la syllabe en cours de lecture (karaoké) */
export const ACTIVE_SYLLABLE = 'bg-amber-100 rounded-xl';
