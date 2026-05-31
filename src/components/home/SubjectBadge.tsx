'use client';

import React from 'react';
import type { Subject } from '@/types';
import { getQuestions } from '@/lib/question-banks';
import { loadProgressMap, computeStats } from '@/lib/spaced-repetition';

interface Props { profileId: string; subject: Subject; }

export function SubjectBadge({ profileId, subject }: Props) {
  const all = getQuestions(subject);
  const progressMap = loadProgressMap(profileId, subject);
  const stats = computeStats(all, progressMap);
  if (stats.total === 0) return null;
  if (stats.dueCount > 0) return (
    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-white text-xs font-black">
      {stats.dueCount}
    </span>
  );
  if (stats.masteredCount === stats.total) return (
    <span className="absolute top-2 right-2 text-emerald-500 text-sm">✓</span>
  );
  return null;
}
