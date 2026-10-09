'use client';

import { useEffect, useState } from 'react';
import { initScore, loadFromStorage } from '@/lib/score-storage';
import {
  fetchEnrollments, fetchProfileEvaluations, getAllPlans, getAllSkillLevels, getSeen, getSkills, isEnrolled, loadSkillReviews,
} from '@/modules/skills';
import { fetchCompetition, fetchIdentity, isIdentityReady } from '@/modules/competition';
import type { LearnerSnapshot } from '../domain/learner';

const isAfter = (iso: string | null, since: string | null) => Boolean(iso) && (!since || (iso as string) > since);
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/** Gathers what the learner's home needs: this device (levels, plans, reviews, score) and the API (requests, corrections, challenge). */
export function useLearnerSnapshot(profileId: string): LearnerSnapshot | null {
  const [snapshot, setSnapshot] = useState<LearnerSnapshot | null>(null);

  useEffect(() => {
    let alive = true;
    const now = new Date();
    Promise.all([fetchEnrollments(profileId), fetchProfileEvaluations(profileId), fetchCompetition(profileId, 'xp'), fetchIdentity(profileId)]).then(([enrollments, evaluations, competition, identity]) => {
      if (!alive) return;
      const score = loadFromStorage(profileId) ?? initScore(profileId);
      const levels = getAllSkillLevels(profileId);
      const plans = getAllPlans(profileId);
      const enrolled = getSkills().filter((s) => isEnrolled(s.id, enrollments));
      const answered = enrollments.filter((e) => e.status !== 'pending' && isAfter(e.decidedAt, getSeen(profileId, 'enrollments')));
      const corrected = evaluations.filter((e) => e.status !== 'pending' && isAfter(e.correctedAt, getSeen(profileId, 'evaluations')));
      setSnapshot({
        streak: score.streak,
        xp: score.xp,
        dueReviews: enrolled.reduce((sum, s) => sum + loadSkillReviews(profileId, s.id, now).dueNow, 0),
        enrolledSkills: enrolled.map((s) => ({ skillId: s.id, name: s.name, level: levels[s.id] ?? null, dailyMinutes: plans[s.id]?.dailyMinutes ?? null })),
        answeredEnrollments: answered.length,
        pendingEnrollments: enrollments.filter((e) => e.status === 'pending').length,
        evaluationsToRead: corrected.length,
        // No ranking available (demo profile, offline): do not nag about a challenge that cannot be played
        challengePlayed: competition === null ? true : competition.myResult !== null,
        studiedToday: score.lastActivityAt !== null && sameDay(score.lastActivityAt, now),
        canEnroll: !profileId.startsWith('demo-'),
        // Unknown identity (demo profile, offline): do not nag
        identityComplete: identity === null ? true : isIdentityReady(identity),
      });
    });
    return () => { alive = false; };
  }, [profileId]);

  return snapshot;
}
