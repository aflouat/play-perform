import { hasQuestionBank, type SkillLevelNumber } from '@/modules/skills';

/** One course of a phase: bring a skill to a target level, possibly once another skill reaches a minimum level. */
export interface RoadmapCourse {
  skillId: string;
  targetLevel: SkillLevelNumber;
  /** Minimum level required in a skill before opening this course */
  requires?: { skillId: string; level: SkillLevelNumber };
}

/** A phase of the learner's roadmap ("carte au trésor"): done when every course reached its target level. */
export interface RoadmapPhase { id: string; title: string; weeks: number; courses: RoadmapCourse[] }

/** Start of the roadmap and the days phases were completed (YYYY-MM-DD). */
export interface RoadmapProgress { startedAt: string; completedAt: Record<string, string> }

export type Levels = Readonly<Record<string, SkillLevelNumber>>;
export type PhaseStatus = 'done' | 'current' | 'locked';
export type CourseState = 'done' | 'ready' | 'needs-level';

export interface CourseView extends RoadmapCourse { state: CourseState; level: SkillLevelNumber | null }

export interface PhaseView {
  id: string; number: number; title: string; status: PhaseStatus;
  done: number; total: number; courses: CourseView[];
  plannedDate: string; completedAt: string | null;
  /** Current phase past its target date, or phase completed after it */
  late: boolean; daysLate: number;
}

export type ResumeTarget =
  | { kind: 'course'; skillId: string; level: SkillLevelNumber; href: string }
  | { kind: 'remediation'; skillId: string; level: SkillLevelNumber; forSkillId: string; href: string }
  | { kind: 'finished'; href: string };

const DAY_MS = 24 * 60 * 60 * 1000;
const parse = (day: string) => { const [y, m, d] = day.split('-').map(Number); return new Date(y, m - 1, d); };
const pad = (n: number) => String(n).padStart(2, '0');
const daysBetween = (from: string, to: string) => Math.round((parse(to).getTime() - parse(from).getTime()) / DAY_MS);

export function addDays(day: string, days: number): string {
  const date = parse(day);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Level filter: a course opens only when the learner's level meets its requirement. */
export function courseState(course: RoadmapCourse, levels: Levels): CourseState {
  if ((levels[course.skillId] ?? 0) >= course.targetLevel) return 'done';
  const req = course.requires;
  return req && (levels[req.skillId] ?? 0) < req.level ? 'needs-level' : 'ready';
}

/** Target date of each phase: the start date plus the durations of the phases up to it. */
export function plannedDates(phases: readonly RoadmapPhase[], startedAt: string): string[] {
  let elapsed = 0;
  return phases.map((p) => { elapsed += p.weeks * 7; return addDays(startedAt, elapsed); });
}

/** Phase lock: phase n stays locked until phase n-1 is complete; the first unfinished phase is the current one. */
export function buildRoadmap(phases: readonly RoadmapPhase[], levels: Levels, progress: RoadmapProgress, today: string): PhaseView[] {
  const dates = plannedDates(phases, progress.startedAt);
  let open = true;
  return phases.map((phase, i) => {
    const courses = phase.courses.map((c) => ({ ...c, state: courseState(c, levels), level: levels[c.skillId] ?? null }));
    const done = courses.filter((c) => c.state === 'done').length;
    const status: PhaseStatus = !open ? 'locked' : done === courses.length ? 'done' : 'current';
    if (status !== 'done') open = false;
    const completedAt = status === 'done' ? progress.completedAt[phase.id] ?? null : null;
    const reference = status === 'done' ? completedAt : status === 'current' ? today : null;
    const daysLate = reference ? Math.max(0, daysBetween(dates[i], reference)) : 0;
    return {
      id: phase.id, number: i + 1, title: phase.title, status, done, total: courses.length, courses,
      plannedDate: dates[i], completedAt, late: daysLate > 0, daysLate,
    };
  });
}

/** Phases complete without a recorded day: they were completed today. */
export function newlyCompleted(views: readonly PhaseView[], today: string): Record<string, string> {
  return Object.fromEntries(views.filter((v) => v.status === 'done' && !v.completedAt).map((v) => [v.id, today]));
}

/** Where a course is worked on: straight into its quiz, or the skill page (evaluation) when it has no question bank. */
export function courseHref(skillId: string, hasQuiz: (skillId: string) => boolean = hasQuestionBank): string {
  return hasQuiz(skillId) ? `/competences/${skillId}?activity=quiz` : `/competences/${skillId}`;
}

/** "Reprendre mon apprentissage": the last skill worked on if still to do, else the next course; a missing level leads to its catch-up course. */
export function resumeTarget(views: readonly PhaseView[], lastSkillId: string | null, hasQuiz: (skillId: string) => boolean = hasQuestionBank): ResumeTarget {
  const current = views.find((v) => v.status === 'current');
  if (!current) return { kind: 'finished', href: '/competences' };
  const todo = current.courses.filter((c) => c.state !== 'done');
  const course = todo.find((c) => c.skillId === lastSkillId) ?? todo[0];
  if (course.state === 'needs-level' && course.requires) {
    const { skillId, level } = course.requires;
    return { kind: 'remediation', skillId, level, forSkillId: course.skillId, href: courseHref(skillId, hasQuiz) };
  }
  return { kind: 'course', skillId: course.skillId, level: course.targetLevel, href: courseHref(course.skillId, hasQuiz) };
}
