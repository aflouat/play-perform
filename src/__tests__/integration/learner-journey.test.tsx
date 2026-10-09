import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillActivityView } from '@/modules/skills/ui/SkillActivityView';
import { DiplomaView } from '@/modules/skills/ui/DiplomaView';
import { EnrollmentForm } from '@/modules/skills/ui/EnrollmentForm';
import { IdentityForm } from '@/modules/competition/ui/IdentityForm';
import * as enrollments from '@/modules/skills/application/use-enrollments';
import * as enrollmentClient from '@/modules/skills/infra/enrollment-client';
import * as competitionClient from '@/modules/competition/infra/competition-client';

jest.mock('@/modules/skills/application/use-enrollments');
jest.mock('@/modules/skills/infra/enrollment-client');
jest.mock('@/modules/skills/ui/EvaluationPanel', () => ({ EvaluationPanel: () => <p>Panneau d’évaluation</p> }));
jest.mock('@/modules/competition/infra/competition-client');

const approved = { id: 'r', profileId: 'p1', organizationId: 'o', skillId: 'maths-fractions', motivation: '', status: 'approved' as const, centerComment: null, createdAt: '', decidedAt: '' };
const props = { skillId: 'maths-fractions', profileId: 'p1', mode: 'advanced' as const, addXp: jest.fn(), triggerGain: jest.fn() };

beforeEach(() => { jest.resetAllMocks(); localStorage.clear(); });

describe('quiz without enrollment, complete training with enrollment', () => {
  it('lets anyone take a quiz or flashcards, and locks the corrected evaluation behind the enrollment', async () => {
    jest.mocked(enrollments.useEnrollments).mockReturnValue({ enrollments: [], loaded: true, reload: jest.fn() });
    render(<SkillActivityView {...props} />);
    expect(screen.getByRole('button', { name: /Quiz/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Flashcards/ })).toBeEnabled();
    const evaluation = screen.getByRole('button', { name: /Évaluation/ });
    expect(evaluation).toHaveTextContent(/Réservé à la formation complète/);
    await userEvent.click(evaluation);
    expect(screen.getByRole('link', { name: /Voir la formation et m’inscrire/ })).toHaveAttribute('href', '/competences/maths-fractions/fiche');
    expect(screen.queryByText('Panneau d’évaluation')).toBeNull();
  });

  it('opens the evaluation once enrolled', async () => {
    jest.mocked(enrollments.useEnrollments).mockReturnValue({ enrollments: [approved], loaded: true, reload: jest.fn() });
    render(<SkillActivityView {...props} />);
    await userEvent.click(screen.getByRole('button', { name: /Évaluation/ }));
    expect(screen.getByText('Panneau d’évaluation')).toBeInTheDocument();
  });
});

describe('enrollment', () => {
  it('is one click, the reason being optional', async () => {
    jest.mocked(enrollmentClient.submitEnrollment).mockResolvedValue({ ok: true });
    const onSent = jest.fn();
    render(<EnrollmentForm profileId="p1" skillId="logique" existing={undefined} onSent={onSent} />);
    const button = screen.getByRole('button', { name: /Je m’inscris à la formation complète/ });
    expect(button).toBeEnabled();
    await userEvent.click(button);
    await waitFor(() => expect(onSent).toHaveBeenCalled());
    expect(enrollmentClient.submitEnrollment).toHaveBeenCalledWith({ profileId: 'p1', skillId: 'logique', motivation: '' });
    expect(screen.getByText(/Les quiz et les flashcards restent libres/)).toBeInTheDocument();
  });

  it('tells the learner when the centre withdrew the access, and lets them enroll again', () => {
    const withdrawn = { ...approved, status: 'rejected' as const, centerComment: 'Place réservée' };
    render(<EnrollmentForm profileId="p1" skillId="logique" existing={withdrawn} onSent={jest.fn()} />);
    expect(screen.getByText(/Ton centre a retiré cet accès : « Place réservée »/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Je m’inscris/ })).toBeEnabled();
  });
});

describe('identity form', () => {
  const stored = { firstName: 'Léa', lastName: null, nickname: null, showInRanking: true, centreName: 'Alpha' };

  it('explains who sees what: the pseudonym to everyone, the real names on the diploma only', async () => {
    jest.mocked(competitionClient.fetchIdentity).mockResolvedValue(stored);
    render(<IdentityForm profileId="p1" />);
    expect(await screen.findByText(/seul nom que voient les autres élèves/)).toBeInTheDocument();
    expect(screen.getByText(/Visible uniquement sur ton diplôme/)).toBeInTheDocument();
  });

  it('refuses a pseudonym that contains the first name, without calling the server', async () => {
    jest.mocked(competitionClient.fetchIdentity).mockResolvedValue(stored);
    render(<IdentityForm profileId="p1" />);
    await userEvent.type(await screen.findByLabelText('Pseudo'), 'lea2012');
    await userEvent.type(screen.getByLabelText('Nom'), 'Martin');
    await userEvent.click(screen.getByRole('button', { name: /Enregistrer/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/ne doit pas contenir ton prénom/);
    expect(competitionClient.saveIdentity).not.toHaveBeenCalled();
  });

  it('saves a valid profile', async () => {
    jest.mocked(competitionClient.fetchIdentity).mockResolvedValue(stored);
    jest.mocked(competitionClient.saveIdentity).mockResolvedValue(null);
    const onSaved = jest.fn();
    render(<IdentityForm profileId="p1" onSaved={onSaved} />);
    await userEvent.type(await screen.findByLabelText('Pseudo'), 'RenardBleu42');
    await userEvent.type(screen.getByLabelText('Nom'), 'Martin');
    await userEvent.click(screen.getByRole('button', { name: /Enregistrer/ }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(competitionClient.saveIdentity).toHaveBeenCalledWith('p1', { firstName: 'Léa', lastName: 'Martin', nickname: 'RenardBleu42' });
  });
});

describe('diploma', () => {
  it('carries the real names, the centre, the skill, the date and a reference', () => {
    render(<DiplomaView diploma={{ firstName: 'Léa', lastName: 'Martin', skillName: 'Logique et raisonnement', skillEmoji: '🧩', levelLabel: 'Expertise', centreName: 'Centre Alpha SAS', issuedOn: '2026-10-05', reference: 'PP-0A1B2C3D' }} />);
    const diploma = screen.getByRole('article', { name: 'Diplôme' });
    expect(diploma).toHaveTextContent('Léa Martin');
    expect(diploma).toHaveTextContent('Centre Alpha SAS');
    expect(diploma).toHaveTextContent('Logique et raisonnement');
    expect(diploma).toHaveTextContent('5 octobre 2026');
    expect(diploma).toHaveTextContent('PP-0A1B2C3D');
  });
});
