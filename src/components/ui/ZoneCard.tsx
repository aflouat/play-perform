'use client';

import React from 'react';
import { IconFlask, IconUsers, IconLeaf } from '@tabler/icons-react';

const ZONE_META: Record<
  string,
  { icon: React.ElementType; color: string; label: string; description: string }
> = {
  lab: {
    icon: IconFlask,
    color: 'text-sky-400 border-sky-400/30 hover:bg-sky-400/10',
    label: 'Zone 1 : Le Lab',
    description: 'Cours Data Scientist — Python, stats, visualisation',
  },
  clubs: {
    icon: IconUsers,
    color: 'text-purple-400 border-purple-400/30 hover:bg-purple-400/10',
    label: 'Zone 2 : Les Clubs',
    description: 'Projets collégiaux — sciences, débats, collaboration',
  },
  hub: {
    icon: IconLeaf,
    color: 'text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10',
    label: 'Zone 3 : Le Hub',
    description: 'Culture & orientation — médecine, SVT, anatomie',
  },
};

interface ZoneCardProps {
  zone: 'lab' | 'clubs' | 'hub';
  bricks: number;
  totalContents: number;
  completedContents: number;
}

export function ZoneCard({ zone, bricks, totalContents, completedContents }: ZoneCardProps) {
  const meta = ZONE_META[zone];
  const Icon = meta.icon;
  const progress = Math.round((completedContents / (totalContents || 1)) * 100);

  return (
    <div className={`relative rounded-2xl border p-5 transition-colors cursor-pointer ${meta.color}`}>
      <div className="flex items-center gap-3 mb-3">
        <Icon size={24} />
        <h3 className="font-semibold text-slate-100">{meta.label}</h3>
      </div>
      <p className="text-sm text-slate-400 mb-4">{meta.description}</p>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-slate-100">{bricks}</div>
          <div className="text-xs text-slate-500">briques</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-slate-300">{progress}%</div>
          <div className="text-xs text-slate-500">
            {completedContents}/{totalContents}
          </div>
        </div>
      </div>
    </div>
  );
}
