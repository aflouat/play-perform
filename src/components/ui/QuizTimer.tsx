'use client';

import React, { useEffect, useRef, useState } from 'react';

interface QuizTimerProps {
  duration: number; // seconds
  onTimeout: () => void;
}

export function QuizTimer({ duration, onTimeout }: QuizTimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const callbackRef = useRef(onTimeout);
  useEffect(() => { callbackRef.current = onTimeout; });

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          callbackRef.current();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []); // mount once; keyed on question.id by parent to reset

  const fraction = remaining / duration;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const dash = fraction * circumference;
  const stroke = fraction > 0.5 ? '#10b981' : fraction > 0.25 ? '#f59e0b' : '#ef4444';
  const textColor = fraction > 0.5 ? 'text-emerald-600' : fraction > 0.25 ? 'text-amber-500' : 'text-rose-600';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-10 h-10">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="4" />
          <circle
            cx="22" cy="22" r={radius} fill="none"
            stroke={stroke} strokeWidth="4"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.9s linear, stroke 0.4s' }}
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center font-black text-xs ${textColor}`}>
          {remaining}
        </div>
      </div>
    </div>
  );
}
