export type StepId = 'profile' | 'level' | 'quiz';
export type StepState = 'done' | 'current' | 'todo';

export interface OnboardingInput { identityReady: boolean; hasLevel: boolean; hasXp: boolean }
export interface OnboardingStep { id: StepId; label: string; state: StepState }
export interface Onboarding { steps: OnboardingStep[]; current: StepId | null; done: boolean }

/**
 * First connection in three steps: pseudonym and names → level test → first quiz.
 * Each step is derived from what really exists (profile, level, XP), so nothing has to be stored and
 * a learner who already has progress is not forced through the steps they have done.
 */
export function onboardingSteps(input: OnboardingInput): Onboarding {
  const finished: Record<StepId, boolean> = { profile: input.identityReady, level: input.hasLevel, quiz: input.hasXp };
  const labels: Record<StepId, string> = { profile: 'Mon profil', level: 'Mon niveau', quiz: 'Mon premier quiz' };
  const order: StepId[] = ['profile', 'level', 'quiz'];
  const current = order.find((id) => !finished[id]) ?? null;
  return {
    steps: order.map((id) => ({ id, label: labels[id], state: finished[id] ? 'done' : id === current ? 'current' : 'todo' })),
    current,
    done: current === null,
  };
}

export const firstQuizHref = (skillId: string | null): string => (skillId ? `/competences/${skillId}?activity=quiz` : '/competences');

/** Level kept after a placement test: the tested level, never lower than one already earned. */
export const applyStartLevel = (existing: number | null, tested: number): number => Math.max(existing ?? 0, tested);
