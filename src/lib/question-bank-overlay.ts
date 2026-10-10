import type { BankQuestion, QuizQuestion, Subject } from '@/types';

/**
 * Questions published in the database, layered over the built-in banks:
 * same id = the database version wins (admin edit), new id = added.
 * Module-level store, free of React so servers can import it; screens refresh through question-bank-hooks.ts.
 */
let overlay: BankQuestion[] = [];
let version = 0;
let ready = false;
const listeners = new Set<() => void>();

export function setBankOverlay(items: BankQuestion[]): void {
  overlay = items;
  version += 1;
  ready = true;
  listeners.forEach((l) => l());
}

export const getBankVersion = (): number => version;
export const subscribeBank = (cb: () => void): (() => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };

/** True once the database layer answered (or failed): quiz sessions wait for it so they draw from the final bank. */
export const isBankReady = (): boolean => ready;

/** Subject quizzes only see questions that are not attached to a skill. */
export function overlayForSubject(subject: Subject): QuizQuestion[] {
  return overlay.filter((b) => b.skillId === null && b.question.subject === subject).map((b) => b.question);
}

export function overlayForSkill(skillId: string): QuizQuestion[] {
  return overlay.filter((b) => b.skillId === skillId).map((b) => b.question);
}

/** `edited` replaces `base` questions of the same id (keeping a built-in hint the edit left empty) and appends new ones. */
export function mergeById(base: QuizQuestion[], edited: QuizQuestion[]): QuizQuestion[] {
  if (edited.length === 0) return base;
  const byId = new Map(edited.map((q) => [q.id, q]));
  const merged = base.map((q) => {
    const e = byId.get(q.id);
    if (!e) return q;
    byId.delete(q.id);
    return { ...e, hint: e.hint ?? q.hint };
  });
  return [...merged, ...byId.values()];
}
