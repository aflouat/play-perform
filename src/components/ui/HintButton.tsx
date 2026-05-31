'use client';

import React from 'react';

interface HintButtonProps {
  onHint: () => void;
  used: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

/**
 * Bouton "💡 Indice" — visible uniquement en mode assisté.
 * Devient grisé après utilisation (1 indice par question).
 */
export function HintButton({ onHint, used, disabled = false, size = 'md' }: HintButtonProps) {
  const base = size === 'sm'
    ? 'rounded-xl px-3 py-1.5 text-xs font-bold'
    : 'rounded-2xl px-4 py-2.5 text-sm font-bold';

  return (
    <button
      onClick={onHint}
      disabled={used || disabled}
      aria-label={used ? 'Indice déjà utilisé' : 'Obtenir un indice'}
      className={`flex items-center gap-2 transition-all duration-200 shadow-sm ${base} ${
        used
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
          : 'bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100 active:scale-95'
      }`}
    >
      <span className="text-base">💡</span>
      <span>{used ? 'Indice utilisé' : 'Indice'}</span>
    </button>
  );
}
