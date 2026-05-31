'use client';

import React from 'react';

const ZONE_COLORS: Record<string, string> = {
  lab: 'bg-sky-400',
  clubs: 'bg-purple-500',
  hub: 'bg-emerald-400',
};

interface BrickGaugeProps {
  zone: 'lab' | 'clubs' | 'hub';
  current: number;
  max: number;
  label: string;
}

export function BrickGauge({ zone, current, max, label }: BrickGaugeProps) {
  const pct = Math.min(100, Math.round((current / (max || 1)) * 100));
  const barColor = ZONE_COLORS[zone] ?? 'bg-slate-400';

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span>
        <span>{current} / {max}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
