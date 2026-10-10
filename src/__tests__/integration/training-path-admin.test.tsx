import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { TrainingPathAdmin } from '@/modules/dashboards/ui/TrainingPathAdmin';
import { SkillMap } from '@/modules/skills/ui/SkillMap';
import * as client from '@/modules/dashboards/infra/dashboard-client';
import * as admin from '@/modules/dashboards/infra/training-path-admin-client';
import { getTrainingPaths } from '@/modules/dashboards/infra/training-paths-seed';

jest.mock('@/modules/dashboards/infra/dashboard-client');
jest.mock('@/modules/dashboards/infra/training-path-admin-client');
jest.mock('@/modules/skills/application/use-enrollments', () => ({ useEnrollments: () => ({ enrollments: [], loaded: true }) }));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(client.fetchTrainingPathCatalog).mockResolvedValue([...getTrainingPaths()]);
  jest.mocked(admin.saveCatalogPath).mockResolvedValue(null);
});

describe('training path editor (parent company)', () => {
  it('creates a new path: identifier from the name, chapters in the generic phases', async () => {
    render(<TrainingPathAdmin />);
    fireEvent.click(await screen.findByRole('button', { name: '+ Nouveau parcours' }));
    fireEvent.change(screen.getByLabelText('Nom du parcours'), { target: { value: 'Technicien Environnement' } });
    expect(screen.getByLabelText(/Identifiant/)).toHaveValue('technicien-environnement');
    const fondations = screen.getByRole('group', { name: /Phase 1 · Fondations/ });
    fireEvent.click(within(fondations).getByRole('button', { name: '+ Ajouter un chapitre' }));
    fireEvent.change(within(fondations).getByLabelText('Titre du chapitre 1'), { target: { value: 'Prélever un échantillon d’eau' } });
    fireEvent.change(within(fondations).getByLabelText('Compétence du chapitre 1'), { target: { value: 'labo-mesures' } });
    fireEvent.click(within(fondations).getByLabelText('Niveau minimum requis'));
    fireEvent.click(screen.getByRole('button', { name: 'Créer le parcours' }));
    await waitFor(() => expect(admin.saveCatalogPath).toHaveBeenCalled());
    const [saved, isNew] = jest.mocked(admin.saveCatalogPath).mock.calls[0];
    expect(isNew).toBe(true);
    expect(saved).toMatchObject({ id: 'technicien-environnement', name: 'Technicien Environnement', active: false });
    expect(saved.phases.fondations.chapters[0]).toMatchObject({ title: 'Prélever un échantillon d’eau', skillId: 'labo-mesures', targetLevel: 1, requires: { level: 1 } });
  });

  it('edits an existing path and shows the server’s refusal', async () => {
    jest.mocked(admin.saveCatalogPath).mockResolvedValue('Phase « Bases » : ajoute au moins un chapitre.');
    render(<TrainingPathAdmin />);
    fireEvent.click(await screen.findByRole('button', { name: /Mathématiques/ }));
    expect(screen.getByLabelText(/Identifiant/)).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('ajoute au moins un chapitre');
    expect(jest.mocked(admin.saveCatalogPath).mock.calls[0][1]).toBe(false);
  });
});

describe('town of a learner', () => {
  it('shows the trade skills of their path only', () => {
    localStorage.clear();
    const { unmount } = render(<SkillMap profileId="p1" />);
    expect(screen.queryByText('Sécurité au laboratoire')).toBeNull();
    unmount();
    render(<SkillMap profileId="p1" tradeSkillIds={['labo-securite']} />);
    expect(screen.getByText('Sécurité au laboratoire')).toBeInTheDocument();
    expect(screen.queryByText('Solutions et dilutions')).toBeNull();
  });
});
