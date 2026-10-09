/** Minimum number of answers before sharing statistics (below, a "30 %" would be noise and could single someone out). */
export const MIN_SAMPLE = 10;
/** A wrong option is a "classic trap" from this share of all answers. */
const TRAP_MIN_SHARE = 25;

export interface TrapSummary {
  sample: number; correctShare: number; wrongShare: number;
  /** The wrong option chosen most often, when it stands out */
  trap: { optionId: string; share: number } | null;
}

const percent = (part: number, total: number) => Math.round((part / total) * 100);

/** Anonymous summary of how learners answered a question: counts per option, never per person. */
export function trapSummary(counts: Record<string, number>, correctOptionId: string): TrapSummary | null {
  const sample = Object.values(counts).reduce((a, b) => a + b, 0);
  if (sample < MIN_SAMPLE) return null;
  const correct = counts[correctOptionId] ?? 0;
  const wrong = Object.entries(counts).filter(([id]) => id !== correctOptionId).sort(([, a], [, b]) => b - a);
  const top = wrong[0];
  const share = top ? percent(top[1], sample) : 0;
  return {
    sample, correctShare: percent(correct, sample), wrongShare: percent(sample - correct, sample),
    trap: top && share >= TRAP_MIN_SHARE ? { optionId: top[0], share } : null,
  };
}

/** Reassuring note for a learner who answered wrong: others fell into the same trap. Null for a right answer. */
export function trapMessage(summary: TrapSummary | null, chosen: string, correctOptionId: string): string | null {
  if (!summary || chosen === correctOptionId) return null;
  if (summary.trap && summary.trap.optionId === chosen) {
    return `Piège classique : ${summary.trap.share} % des élèves ont choisi la même réponse que toi. Tu n’es pas seul(e) à t’être fait avoir !`;
  }
  return `${summary.wrongShare} % des élèves se trompent sur cette question : elle est vraiment délicate.`;
}

/** Wording of the feedback after an answer: an error is a lesson learned, never a verdict. */
export function constructiveFeedback(correct: boolean, explanation: string): { title: string; body: string } {
  return correct
    ? { title: '✓ Bravo !', body: explanation }
    : { title: '💡 Presque ! Voilà ce que tu viens d’apprendre :', body: explanation };
}

export interface TrapQuestion { id: string; question: string; correctOptionId: string; explanation: string; options: readonly { id: string; text: string }[] }
export interface ClassicTrap { question: TrapQuestion; summary: TrapSummary; trapOptionText: string; correctOptionText: string }

/** The questions where learners go wrong most often, with the option they pick: the "wall of classic mistakes" (anonymous). */
export function rankTraps(questions: readonly TrapQuestion[], distributions: Record<string, Record<string, number>>, limit = 3): ClassicTrap[] {
  return questions
    .flatMap((question) => {
      const summary = trapSummary(distributions[question.id] ?? {}, question.correctOptionId);
      const trap = summary?.trap;
      if (!summary || !trap) return [];
      const text = (id: string) => question.options.find((o) => o.id === id)?.text ?? '';
      return [{ question, summary, trapOptionText: text(trap.optionId), correctOptionText: text(question.correctOptionId) }];
    })
    .sort((a, b) => (b.summary.trap?.share ?? 0) - (a.summary.trap?.share ?? 0))
    .slice(0, limit);
}
