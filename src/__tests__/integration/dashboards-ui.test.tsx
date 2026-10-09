import { render, screen } from '@testing-library/react';
import { CentreDashboardView } from '@/modules/dashboards/ui/CentreDashboardView';
import { ExaminerDashboardView } from '@/modules/dashboards/ui/ExaminerDashboardView';
import { LearnerHome } from '@/modules/dashboards/ui/LearnerHome';
import * as client from '@/modules/dashboards/infra/dashboard-client';
import * as snapshot from '@/modules/dashboards/application/useLearnerSnapshot';

jest.mock('@/modules/dashboards/infra/dashboard-client');
jest.mock('@/modules/dashboards/application/useLearnerSnapshot');

const student = (name: string, status: 'active' | 'idle' | 'dormant') => ({
  id: name, name, emoji: '🙂', grade: '6e', xp: 120, streak: 2, lastActivityAt: null, levelsTotal: 4, skillsStarted: 2, status,
});

describe('centre dashboard', () => {
  it('shows the figures, links to what waits, and who to nudge first', async () => {
    jest.mocked(client.fetchCentreDashboard).mockResolvedValue({
      totalStudents: 3, activeThisWeek: 1, averageLevels: 2.4, newEnrollments: 2, pendingEvaluations: 0, challengePlayers: 1,
      students: [student('Cléo', 'dormant'), student('Ben', 'idle'), student('Ana', 'active')],
      needAttention: [student('Cléo', 'dormant'), student('Ben', 'idle')],
    });
    render(<CentreDashboardView />);
    expect(await screen.findByText('1/3')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Inscriptions cette semaine/ })).toHaveAttribute('href', '/admin/inscriptions');
    expect(screen.getByRole('heading', { name: /À relancer \(2\)/ })).toBeInTheDocument();
    expect(screen.getAllByRole('img').map((e) => e.getAttribute('aria-label'))).toEqual([
      'Inactif depuis plus d’un mois, ou jamais commencé', 'Inactif depuis plus d’une semaine']);
  });

  it('congratulates a centre whose students all worked', async () => {
    jest.mocked(client.fetchCentreDashboard).mockResolvedValue({
      totalStudents: 1, activeThisWeek: 1, averageLevels: 1, newEnrollments: 0, pendingEvaluations: 0, challengePlayers: 0,
      students: [student('Ana', 'active')], needAttention: [],
    });
    render(<CentreDashboardView />);
    expect(await screen.findByRole('status')).toHaveTextContent(/ont travaillé cette semaine/);
  });
});

describe('examiner dashboard', () => {
  it('shows the queue and a way to start correcting', async () => {
    jest.mocked(client.fetchExaminerDashboard).mockResolvedValue({
      pending: 3, oldestWaitingDays: 5, correctedThisWeek: 4, averageTurnaroundHours: 23.5,
      byCentre: [{ organizationName: 'Alpha', pending: 2 }, { organizationName: 'Beta', pending: 1 }],
    });
    render(<ExaminerDashboardView />);
    expect(await screen.findByRole('link', { name: /Commencer les corrections/ })).toHaveAttribute('href', '/admin/evaluations');
    expect(screen.getByText('5 j')).toBeInTheDocument();
    expect(screen.getByText('24 h')).toBeInTheDocument();
    expect(screen.getByText(/Alpha/)).toBeInTheDocument();
  });

  it('is calm when nothing waits, and explains a refusal', async () => {
    jest.mocked(client.fetchExaminerDashboard).mockResolvedValue({ pending: 0, oldestWaitingDays: 0, correctedThisWeek: 0, averageTurnaroundHours: null, byCentre: [] });
    const { unmount } = render(<ExaminerDashboardView />);
    expect(await screen.findByText(/Rien en attente/)).toBeInTheDocument();
    unmount();
    jest.mocked(client.fetchExaminerDashboard).mockResolvedValue(null);
    render(<ExaminerDashboardView />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/réservé aux examinateurs/);
  });
});

describe('learner home', () => {
  it('lists what to do now, most useful first', () => {
    jest.mocked(snapshot.useLearnerSnapshot).mockReturnValue({
      streak: 4, xp: 250, dueReviews: 3, enrolledSkills: [{ skillId: 'logique', name: 'Logique', level: 2, dailyMinutes: 20 }],
      answeredEnrollments: 0, pendingEnrollments: 0, evaluationsToRead: 1, challengePlayed: false, studiedToday: false, canEnroll: true, identityComplete: true,
    });
    render(<LearnerHome profileId="p1" />);
    const links = screen.getAllByRole('link').map((l) => l.textContent);
    expect(links[0]).toMatch(/3 révisions à faire/);
    expect(links[1]).toMatch(/corrigé 1 évaluation/);
    expect(links[2]).toMatch(/défi de la semaine/);
    expect(screen.getByRole('link', { name: /Logique/ })).toHaveAttribute('href', '/competences/logique');
    expect(screen.getByText('🔥 4')).toBeInTheDocument();
  });
});
