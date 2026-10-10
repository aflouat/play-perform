/** What the learner's home needs to know, gathered from the device and the API. */
export interface LearnerSnapshot {
  streak: number; xp: number;
  /** Spaced-repetition reviews that can be done now, over all skills */
  dueReviews: number;
  enrolledSkills: { skillId: string; name: string; level: number | null; dailyMinutes: number | null }[];
  /** Enrollment requests answered (accepted or refused) and still waiting */
  answeredEnrollments: number; pendingEnrollments: number;
  /** Written evaluations corrected by an examiner, not yet read */
  evaluationsToRead: number;
  challengePlayed: boolean; studiedToday: boolean;
  /** The profile can apply to courses (it is a real student, not a demo) */
  canEnroll: boolean;
  /** Pseudonym, first name and last name are all filled in */
  identityComplete: boolean;
  /** At least one skill has a level (a placement test was taken, or a quiz passed) */
  hasLevel: boolean;
  /** Skill of the best level: where the first quiz goes */
  startedSkillId: string | null;
  /** Final orals waiting for an examiner (the centre is looking for one) */
  waitingOrals?: { skillId: string; name: string }[];
}

export interface NextAction { id: string; icon: string; text: string; href: string }

const DEFAULT_MINUTES = 15;

/** The learner's "what now?": the most useful things first, never more than a handful. */
export function nextActionsFor(s: LearnerSnapshot): NextAction[] {
  const actions: NextAction[] = [];
  if (!s.identityComplete) actions.push({ id: 'profile', icon: '🎭', text: 'Complète ton profil : un pseudo pour le classement, ton nom et prénom pour ton diplôme', href: '#profil' });
  if (s.dueReviews > 0) actions.push({ id: 'reviews', icon: '⏰', text: `${s.dueReviews} révision${s.dueReviews > 1 ? 's' : ''} à faire maintenant`, href: '/competences' });
  for (const o of s.waitingOrals ?? []) {
    actions.push({ id: `oral-${o.skillId}`, icon: '⏳', text: `Oral final de « ${o.name} » : liste d’attente, ton centre te cherche un examinateur`, href: `/competences/${o.skillId}` });
  }
  if (s.evaluationsToRead > 0) actions.push({ id: 'feedback', icon: '📝', text: `Ton examinateur a corrigé ${s.evaluationsToRead} évaluation${s.evaluationsToRead > 1 ? 's' : ''} : lis ses commentaires`, href: '/competences' });
  if (s.answeredEnrollments > 0) actions.push({ id: 'enrollment-answer', icon: '📨', text: 'Ton centre a répondu à ta demande d’inscription', href: '/competences' });
  if (!s.challengePlayed) actions.push({ id: 'challenge', icon: '🏆', text: 'Relève le défi de la semaine (5 questions)', href: '/classement' });
  if (!s.studiedToday && s.enrolledSkills.length > 0) {
    const pick = s.enrolledSkills.find((k) => k.dailyMinutes) ?? [...s.enrolledSkills].sort((a, b) => (a.level ?? 0) - (b.level ?? 0))[0];
    actions.push({ id: 'practice', icon: '🎯', text: `Avance sur « ${pick.name} » : ${pick.dailyMinutes ?? DEFAULT_MINUTES} min aujourd’hui`, href: `/competences/${pick.skillId}` });
  }
  if (s.enrolledSkills.length === 0 && s.pendingEnrollments === 0 && s.canEnroll) {
    actions.push({ id: 'discover', icon: '🏰', text: 'Choisis une formation complète dans ta ville : inscription immédiate, évaluations corrigées, diplôme', href: '/competences' });
  }
  if (s.enrolledSkills.length === 0 && s.pendingEnrollments > 0) {
    actions.push({ id: 'waiting', icon: '⏳', text: 'Ta demande d’inscription est en cours d’examen par ton centre', href: '/competences' });
  }
  return actions.length > 0 ? actions : [{ id: 'all-done', icon: '🎉', text: 'Tout est fait pour aujourd’hui, bravo !', href: '/competences' }];
}
