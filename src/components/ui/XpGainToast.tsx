'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface ToastItem {
  id: number;
  amount: number;
}

interface XpGainToastProps {
  gain: number | null;
}

/**
 * Affiche un badge "+N XP" flottant animé à chaque gain d'XP.
 * Passe `gain` (nombre > 0) pour déclencher une nouvelle animation.
 */
export function XpGainToast({ gain }: XpGainToastProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = React.useRef(0);

  useEffect(() => {
    if (!gain || gain <= 0) return;
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, amount: gain }]);
    const t = setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 1500);
    return () => clearTimeout(t);
  }, [gain]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 flex items-end justify-center pb-32 z-50">
      {toasts.map((toast) => (
        <span
          key={toast.id}
          className="xp-float absolute bottom-32 text-amber-500 font-black text-2xl drop-shadow-lg"
        >
          +{toast.amount} XP
        </span>
      ))}
    </div>
  );
}

/**
 * Hook pour déclencher XpGainToast et animer le score.
 */
export function useXpGain() {
  const [lastGain, setLastGain] = useState<number | null>(null);
  const [popKey, setPopKey] = useState(0);

  const triggerGain = useCallback((amount: number) => {
    setLastGain(amount);
    setPopKey((k) => k + 1);
    // Reset so the same gain can trigger again
    setTimeout(() => setLastGain(null), 100);
  }, []);

  return { lastGain, popKey, triggerGain };
}
