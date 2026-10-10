import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { OralBooking } from '@/modules/exams/ui/OralBooking';
import { ExamAgenda } from '@/modules/exams/ui/ExamAgenda';
import * as client from '@/modules/exams/infra/exam-client';

jest.mock('@/modules/exams/infra/exam-client');
jest.mock('@/modules/exams/infra/staffing-client');
import * as staffing from '@/modules/exams/infra/staffing-client';
const enrollments = { current: [{ id: 'e1', skillId: 'logique', status: 'approved' }] };
jest.mock('@/modules/skills/application/use-enrollments', () => ({ useEnrollments: () => ({ enrollments: enrollments.current, loaded: true }) }));

const inHours = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();
const slot = (id: string, hours: number) => ({ id, organizationId: 'org-1', examinerUserId: 'u1', startsAt: inHours(hours), durationMin: 30, status: 'available' as const });

beforeEach(() => {
  jest.clearAllMocks();
  enrollments.current = [{ id: 'e1', skillId: 'logique', status: 'approved' }];
  jest.spyOn(window, 'confirm').mockReturnValue(true);
  jest.mocked(client.fetchMyOrals).mockResolvedValue([]);
  jest.mocked(client.fetchOpenSlots).mockResolvedValue([slot('s1', 50), slot('s2', 50.5)]);
  jest.mocked(client.bookOralSlot).mockResolvedValue(null);
  jest.mocked(client.cancelOral).mockResolvedValue(null);
  jest.mocked(staffing.fetchMyOralRequests).mockResolvedValue([]);
  jest.mocked(staffing.joinOralWaitingList).mockResolvedValue(null);
  localStorage.clear();
});

describe('learner: booking an oral', () => {
  it('lists the free slots of the centre and books one', async () => {
    render(<OralBooking profileId="p1" skillId="logique" />);
    const buttons = await screen.findAllByRole('button', { name: /^\d{2}:\d{2}$/ });
    expect(buttons).toHaveLength(2);
    fireEvent.click(buttons[0]);
    await waitFor(() => expect(client.bookOralSlot).toHaveBeenCalledWith('p1', 's1', 'logique'));
    expect(await screen.findByRole('status')).toHaveTextContent(/réservé/);
  });

  it('shows the booked oral, with cancellation only more than 24 h before, and the last result', async () => {
    jest.mocked(client.fetchMyOrals).mockResolvedValue([
      { id: 'b2', slotId: 's9', skillId: 'logique', level: 2, status: 'booked', outcome: null, examinerComment: null, startsAt: inHours(48), durationMin: 30 },
      { id: 'b1', slotId: 's8', skillId: 'logique', level: 1, status: 'done', outcome: 'failed', examinerComment: 'Justifie chaque étape.', startsAt: inHours(-100), durationMin: 30 },
    ]);
    render(<OralBooking profileId="p1" skillId="logique" />);
    expect(await screen.findByText(/Ton oral :/)).toBeInTheDocument();
    expect(screen.getByText(/Presque !/)).toBeInTheDocument();
    expect(screen.getByText(/Justifie chaque étape/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Annuler/ }));
    await waitFor(() => expect(client.cancelOral).toHaveBeenCalledWith('b2'));
  });

  it('points a learner without enrollment to the course sheet', async () => {
    enrollments.current = [];
    render(<OralBooking profileId="p1" skillId="logique" />);
    expect(await screen.findByRole('link', { name: /fiche du cours/ })).toHaveAttribute('href', '/competences/logique/fiche');
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('examiner: agenda', () => {
  beforeEach(() => {
    jest.mocked(staffing.fetchExaminerStatus).mockResolvedValue({ centres: [{ id: 'org-1', name: 'Centre Alpha' }], openSlots: 1, waiting: 0 });
    jest.mocked(client.openAvailability).mockResolvedValue(null);
    jest.mocked(client.fetchAgenda).mockResolvedValue([
      { ...slot('s1', -0.2), status: 'booked', booking: { id: 'b1', profileId: 'p1', studentName: 'Léa Martin', skillId: 'logique', level: 2, status: 'booked', outcome: null } },
      { ...slot('s2', 30), booking: null },
    ]);
  });

  it('cuts a morning into 30-minute slots of the examiner’s centre', async () => {
    render(<ExamAgenda />);
    const form = await screen.findByRole('form', { name: 'Ajouter des disponibilités' });
    fireEvent.change(within(form).getByLabelText('Jour'), { target: { value: '2030-01-15' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Ouvrir 6 créneaux' }));
    await waitFor(() => expect(client.openAvailability).toHaveBeenCalledWith(expect.objectContaining({ organizationId: 'org-1', durationMin: 30 })));
  });

  it('shows who comes, and lets the examiner record the result once the oral has started', async () => {
    jest.mocked(client.sendOutcome).mockResolvedValue(null);
    render(<ExamAgenda />);
    expect(await screen.findByText('Léa Martin')).toBeInTheDocument();
    expect(screen.getByText('Libre')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Validé/ }));
    await waitFor(() => expect(client.sendOutcome).toHaveBeenCalledWith('b1', 'passed', ''));
  });
});

describe('final oral without any examiner available', () => {
  it('puts the learner on the waiting list once and tells them the centre is looking for an examiner', async () => {
    localStorage.setItem('pp:skill-levels:p1', JSON.stringify({ logique: 4 }));
    jest.mocked(client.fetchOpenSlots).mockResolvedValue([]);
    jest.mocked(staffing.fetchMyOralRequests).mockResolvedValueOnce([])
      .mockResolvedValue([{ id: 'r1', skillId: 'logique', level: 4, status: 'waiting', createdAt: '2026-10-10T10:00:00Z' }]);
    jest.mocked(staffing.joinOralWaitingList).mockResolvedValue(null);
    render(<OralBooking profileId="p1" skillId="logique" />);
    expect(await screen.findByText(/Tu es en liste d’attente pour ton oral final/)).toBeInTheDocument();
    expect(staffing.joinOralWaitingList).toHaveBeenCalledTimes(1);
    expect(staffing.joinOralWaitingList).toHaveBeenCalledWith('p1', 'logique');
  });

  it('does not wait before the final phase, and announces the slots once opened', async () => {
    localStorage.setItem('pp:skill-levels:p1', JSON.stringify({ logique: 2 }));
    jest.mocked(client.fetchOpenSlots).mockResolvedValue([]);
    jest.mocked(staffing.fetchMyOralRequests).mockResolvedValue([]);
    const { unmount } = render(<OralBooking profileId="p1" skillId="logique" />);
    expect(await screen.findByText(/Pas de créneau libre/)).toBeInTheDocument();
    expect(staffing.joinOralWaitingList).not.toHaveBeenCalled();
    unmount();
    jest.mocked(client.fetchOpenSlots).mockResolvedValue([slot('s1', 50)]);
    jest.mocked(staffing.fetchMyOralRequests).mockResolvedValue([{ id: 'r1', skillId: 'logique', level: 4, status: 'waiting', createdAt: '2026-10-10T10:00:00Z' }]);
    render(<OralBooking profileId="p1" skillId="logique" />);
    expect(await screen.findByText(/Bonne nouvelle/)).toBeInTheDocument();
  });
});

describe('centre: staffing the orals', () => {
  it('shows the learners waiting and lets the manager entrust orals to a teacher', async () => {
    const { OralWaitingList } = await import('@/modules/exams/ui/OralWaitingList');
    jest.mocked(staffing.fetchWaitingRequests).mockResolvedValue([{ id: 'r1', profileId: 'p1', studentName: 'Léa Martin', organizationId: 'org-1', skillId: 'logique', level: 4, createdAt: new Date().toISOString() }]);
    render(<OralWaitingList />);
    expect(await screen.findByRole('heading', { name: /1 élève attend un examinateur/ })).toBeInTheDocument();
    expect(screen.getByText('Léa Martin')).toBeInTheDocument();
  });

  it('notifies an examiner the centre allowed but who has no availability', async () => {
    const { OralAvailabilityNotice } = await import('@/modules/exams/ui/OralAvailabilityNotice');
    jest.mocked(staffing.fetchExaminerStatus).mockResolvedValue({ centres: [{ id: 'org-1', name: 'Alpha' }], openSlots: 0, waiting: 0 });
    render(<OralAvailabilityNotice />);
    expect(await screen.findByRole('status')).toHaveTextContent(/saisis tes disponibilités/);
    expect(screen.getByRole('link', { name: /Saisir mes disponibilités/ })).toHaveAttribute('href', '/examinateur/agenda');
  });
});
