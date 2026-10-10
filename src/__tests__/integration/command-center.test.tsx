import { fireEvent, render, screen, within } from '@testing-library/react';
import { CommandCenter } from '@/modules/dashboards/ui/CommandCenter';
import * as snapshot from '@/modules/dashboards/application/useLearnerSnapshot';
import * as competition from '@/modules/competition';
import * as community from '@/modules/community';

jest.mock('@/modules/dashboards/application/useLearnerSnapshot');
jest.mock('@/modules/competition', () => ({
  ...jest.requireActual('@/modules/competition'),
  fetchFeed: jest.fn(), sendCheer: jest.fn(), fetchIdentity: jest.fn(),
}));
jest.mock('@/modules/community', () => ({ ...jest.requireActual('@/modules/community'), fetchDistributions: jest.fn() }));

const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

beforeEach(() => {
  localStorage.clear();
  // Phase 1 (méthode 2, logique 1) is done; phase 2 needs logique 2 for the fractions course
  localStorage.setItem('pp:skill-levels:p1', JSON.stringify({ methode: 2, logique: 1 }));
  localStorage.setItem('score:p1', JSON.stringify({ userId: 'p1', xp: 250, level: 3, streak: 4, lastActivityAt: null, badges: [
    { id: 'first-quiz', name: 'Premier Quiz', emoji: '🎯', description: '', unlockedAt: '2026-10-01T10:00:00Z' },
  ] }));
  jest.mocked(snapshot.useLearnerSnapshot).mockReturnValue({
    streak: 4, xp: 250, dueReviews: 0, enrolledSkills: [], answeredEnrollments: 0, pendingEnrollments: 0, evaluationsToRead: 0,
    challengePlayed: true, studiedToday: true, canEnroll: true, identityComplete: true, hasLevel: true, startedSkillId: 'logique',
  });
  jest.mocked(competition.fetchFeed).mockResolvedValue([
    { id: 'e1', nickname: 'Lynx', level: 4, skillName: 'Fractions', skillEmoji: '🧮', skillId: 'maths-fractions', createdAt: '2026-10-09T10:00:00Z', cheers: 0, cheeredByMe: false, isMine: false },
  ] as never);
  jest.mocked(competition.sendCheer).mockResolvedValue(true);
  jest.mocked(community.fetchDistributions).mockResolvedValue({});
});

describe('learner command center', () => {
  it('shows the streak, the map with the current phase, and resumes on the missing logic level', async () => {
    render(<CommandCenter profileId="p1" />);
    const status = await screen.findByRole('region', { name: 'Mon statut' });
    expect(within(status).getByText('4')).toBeInTheDocument();
    expect(within(status).getByText('Rang 3')).toBeInTheDocument();
    expect(within(status).getByRole('img', { name: 'Premier Quiz' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Phase 1 : Fondations, accomplie/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Phase 2 : Les bases du collège, en cours, 0 cours sur 3/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Phase 3 : Consolidation, à venir, verrouillée/ })).toBeDisabled();

    const resume = screen.getByRole('link', { name: /Reprendre mon apprentissage/ });
    expect(resume).toHaveAttribute('href', '/competences/logique');
    expect(resume).toHaveTextContent(/D’abord « Logique et raisonnement » niveau 2, requis pour « Fractions et proportions »/);
  });

  it('opens the detail of the current phase: courses, required level, target date', async () => {
    render(<CommandCenter profileId="p1" />);
    fireEvent.click(await screen.findByRole('button', { name: /Phase 2/ }));
    const detail = screen.getByRole('region', { name: 'Détail de la phase 2' });
    expect(within(detail).getByText(/Niveau 2 en Logique et raisonnement requis pour débloquer ce cours/)).toBeInTheDocument();
    expect(within(detail).getByRole('link', { name: /Remise à niveau/ })).toHaveAttribute('href', '/competences/logique');
    expect(within(detail).getByText(/^Objectif :/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('pp:roadmap:p1') ?? '{}')).toMatchObject({ startedAt: today(), completedAt: { fondations: today() } });
  });

  it('shows the centre feed with a Bravo button', async () => {
    render(<CommandCenter profileId="p1" />);
    const bravo = await screen.findByRole('button', { name: 'Bravo à Lynx' });
    fireEvent.click(bravo);
    expect(competition.sendCheer).toHaveBeenCalledWith('p1', 'e1');
    expect(bravo).toBeDisabled();
  });
});
