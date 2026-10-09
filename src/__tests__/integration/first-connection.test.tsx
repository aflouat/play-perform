import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FirstSteps } from '@/modules/dashboards/ui/FirstSteps';
import { PlacementStep } from '@/modules/dashboards/ui/PlacementStep';
import { getPlacementTest } from '@/modules/quizzes';
import { getAllSkillLevels, setSkillLevel } from '@/modules/skills';
import type { LearnerSnapshot } from '@/modules/dashboards';
import * as levelsClient from '@/modules/skills/infra/levels-client';

jest.mock('@/modules/competition', () => ({ IdentityForm: ({ profileId }: { profileId: string }) => <form aria-label="Mon profil">profil de {profileId}</form> }));
jest.mock('@/modules/skills/infra/levels-client');

const snapshot = (over: Partial<LearnerSnapshot> = {}): LearnerSnapshot => ({
  streak: 0, xp: 0, dueReviews: 0, enrolledSkills: [], answeredEnrollments: 0, pendingEnrollments: 0, evaluationsToRead: 0,
  challengePlayed: true, studiedToday: false, canEnroll: true, identityComplete: false, hasLevel: false, startedSkillId: null, ...over,
});

beforeEach(() => { jest.resetAllMocks(); localStorage.clear(); jest.mocked(levelsClient.pushRemoteLevel).mockResolvedValue(true); });

describe('first connection', () => {
  it('starts with the profile (pseudonym and names)', () => {
    render(<FirstSteps profileId="p1" snapshot={snapshot()} onChange={jest.fn()} />);
    expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent('Mon profil');
    expect(screen.getByRole('form', { name: 'Mon profil' })).toBeInTheDocument();
    expect(screen.queryByText(/Lancer mon premier quiz/)).toBeNull();
  });

  it('then offers the level test', () => {
    render(<FirstSteps profileId="p1" snapshot={snapshot({ identityComplete: true })} onChange={jest.fn()} />);
    expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent('Mon niveau');
    expect(screen.getByRole('heading', { name: /Quelle compétence veux-tu acquérir/ })).toBeInTheDocument();
  });

  it('finally sends to the first quiz of the skill just tested', () => {
    render(<FirstSteps profileId="p1" snapshot={snapshot({ identityComplete: true, hasLevel: true, startedSkillId: 'logique' })} onChange={jest.fn()} />);
    expect(screen.getByRole('link', { name: /Lancer mon premier quiz/ })).toHaveAttribute('href', '/competences/logique?activity=quiz');
    expect(screen.getAllByRole('listitem').map((li) => li.textContent?.trim().charAt(0))).toContain('✓');
  });
});

describe('level test inside the first connection', () => {
  it('turns the result into the starting level of the skill and moves on', async () => {
    const onDone = jest.fn();
    render(<PlacementStep profileId="p1" onDone={onDone} />);
    await userEvent.click(await screen.findByRole('button', { name: /Logique et raisonnement/ }));
    for (const q of getPlacementTest('logique').slice(0, 5)) {
      await userEvent.click(await screen.findByRole('button', { name: new RegExp(q.options[q.correctIndex].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }));
    }
    expect(await screen.findByText(/niveau 5 sur 5/)).toBeInTheDocument();
    expect(getAllSkillLevels('p1').logique).toBe(5);
    await userEvent.click(screen.getByRole('button', { name: /Continuer/ }));
    expect(onDone).toHaveBeenCalledWith('logique');
    await waitFor(() => expect(levelsClient.pushRemoteLevel).toHaveBeenCalledWith('p1', 'logique', 5));
  });

  it('never lowers a level the learner already earned', async () => {
    setSkillLevel('p1', 'logique', 4);
    render(<PlacementStep profileId="p1" onDone={jest.fn()} />);
    await userEvent.click(await screen.findByRole('button', { name: /Logique et raisonnement/ }));
    for (let i = 0; i < 5; i++) await userEvent.click(await screen.findByRole('button', { name: /Je ne sais pas/ }));
    await screen.findByText(/niveau 1 sur 5/);
    expect(getAllSkillLevels('p1').logique).toBe(4);
  });
});
