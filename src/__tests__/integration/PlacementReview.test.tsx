import { render, screen } from '@testing-library/react';
import { PlacementReview, savePlacement } from '@/modules/landing';
import { PlacementResultView } from '@/modules/landing/ui/PlacementResultView';
import { getPlacementTest } from '@/modules/quizzes';
import { getSkillById } from '@/modules/skills';

const result = { startLevel: 3 as const, correct: 2, skipped: 1, total: 5, mastered: false };

describe('PlacementReview', () => {
  beforeEach(() => localStorage.clear());

  it('shows feedback for every question, the right answers and the levels to work on', () => {
    const questions = getPlacementTest('logique');
    savePlacement('logique', result, [questions[0].correctIndex, questions[1].correctIndex, null, (questions[3].correctIndex + 1) % 4, null]);
    render(<PlacementReview skillId="logique" />);
    expect(screen.getAllByText(/bonne réponse$/)).toHaveLength(5);
    expect(screen.getByText(/À retravailler : niveau 3, niveau 4, niveau 5/)).toBeInTheDocument();
    expect(screen.getAllByText(/ta réponse/)).toHaveLength(1);
    expect(screen.getAllByText(/Je ne sais pas/)).toHaveLength(2);
  });

  it('invites to take the test when nothing was saved on this device', () => {
    render(<PlacementReview skillId="logique" />);
    expect(screen.getByRole('link', { name: /Passer le test de niveau/ })).toHaveAttribute('href', '/#commencer');
  });

  it('is linked from the result of the test', () => {
    render(<PlacementResultView skill={getSkillById('logique')!} result={result} onAnotherSkill={() => undefined} />);
    expect(screen.getByRole('link', { name: /Revoir mes réponses/ })).toHaveAttribute('href', '/test-de-niveau/logique');
  });
});
