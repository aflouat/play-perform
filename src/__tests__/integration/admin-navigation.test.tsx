import { render, screen, waitFor } from '@testing-library/react';
import { AdminNav } from '@/modules/organizations/ui/AdminNav';
import { SuperAdminGate } from '@/modules/organizations/ui/SuperAdminGate';
import * as client from '@/modules/organizations/infra/organization-client';

jest.mock('next/navigation', () => ({ usePathname: () => '/admin/inscriptions' }));
jest.mock('@/modules/organizations/infra/organization-client');

const me = jest.mocked(client.fetchMyAccess);
const manager = { email: 'm@x.fr', isSuperAdmin: false, memberships: [{ organizationId: 'o', organizationName: 'Alpha', role: 'org_admin' as const }] };
const superAdmin = { email: 's@x.fr', isSuperAdmin: true, memberships: [] };

beforeEach(() => jest.resetAllMocks());

describe('AdminNav', () => {
  it('shows a centre manager only the centre’s operations', async () => {
    me.mockResolvedValue(manager);
    render(<AdminNav />);
    expect(await screen.findByRole('link', { name: 'Inscriptions' })).toHaveAttribute('aria-current', 'page');
    ['Élèves', 'Corrections', 'Équipe'].forEach((name) => expect(screen.getByRole('link', { name })).toBeInTheDocument());
    ['Tarifs', 'Parcours', 'Questions', 'Import CSV', 'Centres'].forEach((name) => expect(screen.queryByRole('link', { name })).toBeNull());
  });

  it('shows the super admin the shared resources too', async () => {
    me.mockResolvedValue(superAdmin);
    render(<AdminNav />);
    for (const name of ['Tarifs', 'Parcours', 'Questions', 'Import CSV', 'Centres']) {
      expect(await screen.findByRole('link', { name })).toBeInTheDocument();
    }
  });
});

describe('SuperAdminGate', () => {
  it('replaces a shared-resource page by a clear message for a centre manager', async () => {
    me.mockResolvedValue(manager);
    render(<SuperAdminGate><p>Tarifs des abonnements</p></SuperAdminGate>);
    expect(await screen.findByRole('alert')).toHaveTextContent(/réservée à la société mère/);
    expect(screen.queryByText('Tarifs des abonnements')).toBeNull();
  });

  it('lets the super admin through', async () => {
    me.mockResolvedValue(superAdmin);
    render(<SuperAdminGate><p>Tarifs des abonnements</p></SuperAdminGate>);
    await waitFor(() => expect(screen.getByText('Tarifs des abonnements')).toBeInTheDocument());
  });
});
