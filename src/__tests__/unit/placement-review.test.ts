import { reviewAnswers, getPlacementTest } from '@/modules/quizzes';
import { savePlacement, readSavedPlacements } from '@/modules/landing';

const questions = getPlacementTest('logique');

describe('reviewAnswers', () => {
  it('pairs each question with the learner’s choice and the right answer', () => {
    const chosen = questions.map((q, i) => (i === 0 ? q.correctIndex : (q.correctIndex + 1) % q.options.length));
    const review = reviewAnswers(questions, chosen);
    expect(review).toHaveLength(5);
    expect(review[0]).toMatchObject({ correct: true, skipped: false, chosenText: questions[0].options[questions[0].correctIndex] });
    expect(review[1]).toMatchObject({ correct: false, skipped: false, correctText: questions[1].options[questions[1].correctIndex] });
  });

  it('marks "Je ne sais pas" as skipped with no chosen text', () => {
    const review = reviewAnswers(questions, questions.map(() => null));
    review.forEach((entry) => expect(entry).toMatchObject({ correct: false, skipped: true, chosenText: null }));
  });

  it('lists the levels to work on first', () => {
    const chosen = questions.map((q, i) => (i < 2 ? q.correctIndex : null));
    const levels = reviewAnswers(questions, chosen).filter((e) => !e.correct).map((e) => e.question.level);
    expect(levels).toEqual([3, 4, 5]);
  });

  it('copes with fewer answers than questions', () => {
    expect(reviewAnswers(questions, [0, 1])).toHaveLength(2);
  });
});

describe('saved placements keep the answers for the review', () => {
  beforeEach(() => localStorage.clear());
  const result = { startLevel: 3 as const, correct: 2, skipped: 0, total: 5, mastered: false };

  it('stores the chosen options next to the result', () => {
    savePlacement('logique', result, [0, 1, null, 2, 3]);
    expect(readSavedPlacements().logique.answers).toEqual([0, 1, null, 2, 3]);
  });

  it('still saves results without answers (older tests)', () => {
    savePlacement('logique', result);
    expect(readSavedPlacements().logique.answers).toBeUndefined();
  });
});
