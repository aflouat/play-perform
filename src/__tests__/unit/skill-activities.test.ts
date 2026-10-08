import { isQuizPassed, QUIZ_LENGTH, nextLevelAfterQuiz } from '@/modules/skills';
import { getSkillSubject, pickSkillQuestions, toFlashcards, difficultyForLevel } from '@/modules/skills';

describe('quiz pass rule', () => {
  it('requires at least 4 correct answers out of 5', () => {
    expect(QUIZ_LENGTH).toBe(5);
    expect(isQuizPassed(4, 5)).toBe(true);
    expect(isQuizPassed(3, 5)).toBe(false);
    expect(isQuizPassed(0, 0)).toBe(false);
  });

  it('moves up one level on success, caps at 5, starts from 1', () => {
    expect(nextLevelAfterQuiz(2, true)).toBe(3);
    expect(nextLevelAfterQuiz(5, true)).toBe(5);
    expect(nextLevelAfterQuiz(null, true)).toBe(2);
    expect(nextLevelAfterQuiz(3, false)).toBe(3);
    expect(nextLevelAfterQuiz(null, false)).toBe(1);
  });
});

describe('skill content', () => {
  it('maps skill levels 1-5 onto quiz difficulties 1-4', () => {
    expect([1, 2, 3, 4, 5].map((l) => difficultyForLevel(l as 1 | 2 | 3 | 4 | 5))).toEqual([1, 2, 3, 4, 4]);
  });

  it('links skills to a question bank when one exists', () => {
    expect(getSkillSubject('maths-fractions')).toBe('maths');
    expect(getSkillSubject('logique')).toBeNull();
  });

  it('picks questions of the right subject, preferring the level difficulty', () => {
    const picked = pickSkillQuestions('maths-fractions', 1, 5, () => 0.5);
    expect(picked.length).toBe(5);
    expect(new Set(picked.map((q) => q.id)).size).toBe(5);
    picked.forEach((q) => expect(q.subject).toBe('maths'));
    expect(picked.filter((q) => q.difficulty === 1).length).toBeGreaterThan(0);
  });

  it('returns nothing for a skill without a question bank', () => {
    expect(pickSkillQuestions('logique', 2, 5)).toEqual([]);
  });

  it('turns questions into flashcards with the right answer and the explanation', () => {
    const [q] = pickSkillQuestions('maths-fractions', 1, 1, () => 0.1);
    const [card] = toFlashcards([q]);
    expect(card.front).toBe(q.question);
    expect(card.back).toBe(q.options.find((o) => o.id === q.correctOptionId)?.text);
    expect(card.explanation).toBe(q.explanation);
  });
});
