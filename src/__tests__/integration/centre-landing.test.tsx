import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CentreLanding } from '@/modules/storefront/ui/CentreLanding';
import { getTrainingPaths } from '@/modules/dashboards/infra/training-paths-seed';

const centre = { id: 'org-1', name: 'Centre Alpha', slug: 'centre-alpha', address: '12 rue des Lilas', postalCode: '69003', city: 'Lyon' };

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }) as unknown as typeof fetch;
});

describe('landing page of a franchised centre', () => {
  it('presents the centre, the method with orals, its paths and its address', () => {
    render(<CentreLanding centre={centre} paths={getTrainingPaths()} openSlots={12} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Centre Alpha' })).toBeInTheDocument();
    expect(screen.getByText('📍 Lyon')).toBeInTheDocument();
    expect(screen.getByText(/Passe l’oral avec un examinateur/)).toBeInTheDocument();
    expect(screen.getByText(/12 créneaux d’oral disponibles/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Technicien(ne) de laboratoire' })).toBeInTheDocument();
    expect(screen.getByText('12 rue des Lilas', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /J’ai déjà mon code/ })).toHaveAttribute('href', '/apprenant');
  });

  it('sends a call-back request to the centre', async () => {
    render(<CentreLanding centre={centre} paths={getTrainingPaths()} openSlots={0} />);
    expect(screen.queryByText(/créneau.* d’oral disponible/)).toBeNull();
    fireEvent.change(screen.getByLabelText('Prénom'), { target: { value: 'Léa' } });
    fireEvent.change(screen.getByLabelText('E-mail ou téléphone'), { target: { value: '0612345678' } });
    fireEvent.change(screen.getByLabelText('Parcours qui t’intéresse'), { target: { value: 'technicien-laboratoire' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Je veux m’inscrire/ }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/centres/centre-alpha/leads', expect.objectContaining({ method: 'POST' })));
    expect(JSON.parse((jest.mocked(global.fetch).mock.calls[0][1] as RequestInit).body as string)).toMatchObject({ firstName: 'Léa', pathId: 'technicien-laboratoire', consent: true });
    expect(await screen.findByRole('status')).toHaveTextContent('Merci Léa');
  });
});
