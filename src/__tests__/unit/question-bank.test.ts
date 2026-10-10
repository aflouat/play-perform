import type { QuizQuestion } from '@/types';
import type { DbQuestion } from '@/lib/db';
import { dbToBankQuestion, quizToDbRow } from '@/lib/question-bank-mapper';
import { mergeById, setBankOverlay, overlayForSkill, overlayForSubject, getBankVersion } from '@/lib/question-bank-overlay';
import { getQuestions } from '@/lib/question-banks';
import { getSkillBank, hasQuestionBank, getBuiltInSkillBank } from '@/modules/skills';

const row = (over: Partial<DbQuestion> = {}): DbQuestion => ({
  id: 'x-1', subject: 'maths', category: null, difficulty: 2, xp_reward: 15, emoji: '➗', image_url: null,
  question: 'Q ?', question_assisted: null, option_a: 'a', option_b: 'b', option_c: 'c', option_d: 'd',
  option_a_assisted: null, option_b_assisted: null, option_c_assisted: null, option_d_assisted: null,
  correct_option_id: 'B', explanation: 'Parce que.', explanation_assisted: null,
  skill_id: null, status: 'published', hint: null, ...over,
});

const quiz = (id: string, over: Partial<QuizQuestion> = {}): QuizQuestion => ({
  id, subject: 'maths', question: id, options: [{ id: 'A', text: 'a' }, { id: 'B', text: 'b' }, { id: 'C', text: 'c' }, { id: 'D', text: 'd' }],
  correctOptionId: 'A', explanation: 'e', difficulty: 1, xpReward: 10, ...over,
});

afterEach(() => setBankOverlay([]));

describe('mapper', () => {
  it('maps a database row to a quiz question and keeps the skill', () => {
    const b = dbToBankQuestion(row({ skill_id: 'labo-securite', hint: 'Pense aux EPI', category: 'epi' }));
    expect(b.skillId).toBe('labo-securite');
    expect(b.question).toMatchObject({ id: 'x-1', subject: 'maths', correctOptionId: 'B', hint: 'Pense aux EPI', category: 'epi', difficulty: 2, xpReward: 15 });
    expect(b.question.options.map((o) => o.text)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('leaves assisted variants and optional fields undefined when empty', () => {
    const q = dbToBankQuestion(row()).question;
    expect(q.questionAssisted).toBeUndefined();
    expect(q.hint).toBeUndefined();
  });

  it('round-trips a quiz question into a published row', () => {
    const r = quizToDbRow(quiz('m-1', { hint: 'indice' }), 'maths-fractions');
    expect(r).toMatchObject({ id: 'm-1', skill_id: 'maths-fractions', status: 'published', option_a: 'a', correct_option_id: 'A', hint: 'indice' });
    expect(dbToBankQuestion(r).question).toMatchObject({ id: 'm-1', hint: 'indice', correctOptionId: 'A' });
  });
});

describe('mergeById', () => {
  it('lets the database version replace the built-in one and appends new questions', () => {
    const merged = mergeById([quiz('a'), quiz('b')], [quiz('b', { question: 'corrigée' }), quiz('c')]);
    expect(merged.map((q) => q.id)).toEqual(['a', 'b', 'c']);
    expect(merged[1].question).toBe('corrigée');
  });

  it('keeps the built-in hint when the edited version has none', () => {
    const merged = mergeById([quiz('a', { hint: 'indice' })], [quiz('a', { question: 'maj' })]);
    expect(merged[0]).toMatchObject({ question: 'maj', hint: 'indice' });
  });
});

describe('overlay', () => {
  it('separates subject questions (no skill) from skill questions', () => {
    setBankOverlay([{ skillId: null, question: quiz('s1') }, { skillId: 'labo-securite', question: quiz('k1') }]);
    expect(overlayForSubject('maths').map((q) => q.id)).toEqual(['s1']);
    expect(overlayForSkill('labo-securite').map((q) => q.id)).toEqual(['k1']);
  });

  it('bumps the version so screens can refresh', () => {
    const v = getBankVersion();
    setBankOverlay([]);
    expect(getBankVersion()).toBe(v + 1);
  });
});

describe('reading banks', () => {
  it('adds a database question to its subject quiz and edits a built-in one', () => {
    const built = getQuestions('maths')[0];
    setBankOverlay([{ skillId: null, question: quiz('db-new') }, { skillId: null, question: { ...built, question: 'Texte corrigé en admin' } }]);
    const list = getQuestions('maths');
    expect(list.some((q) => q.id === 'db-new')).toBe(true);
    expect(list.find((q) => q.id === built.id)?.question).toBe('Texte corrigé en admin');
  });

  it('serves a skill with no built-in bank from the database alone', () => {
    expect(hasQuestionBank('nouvelle-competence')).toBe(false);
    setBankOverlay([{ skillId: 'nouvelle-competence', question: quiz('n1') }]);
    expect(hasQuestionBank('nouvelle-competence')).toBe(true);
    expect(getSkillBank('nouvelle-competence').map((q) => q.id)).toEqual(['n1']);
  });

  it('does not show skill-only questions in the subject quiz', () => {
    setBankOverlay([{ skillId: 'labo-securite', question: quiz('only-skill') }]);
    expect(getQuestions('maths').some((q) => q.id === 'only-skill')).toBe(false);
    expect(getSkillBank('labo-securite').some((q) => q.id === 'only-skill')).toBe(true);
  });

  it('keeps the built-in bank unchanged for the weekly challenge (server recomputes the score)', () => {
    setBankOverlay([{ skillId: 'labo-securite', question: quiz('extra') }]);
    expect(getBuiltInSkillBank('labo-securite').some((q) => q.id === 'extra')).toBe(false);
  });
});
