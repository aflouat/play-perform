import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SiteHeader } from '@/shared/ui/SiteHeader';
import { RoleGate } from '@/shared/ui/RoleGate';
import { CentreIdentityForm } from '@/modules/organizations/ui/CentreIdentityForm';
import { saveLearnerToken } from '@/lib/auth-token';

const replace = jest.fn();
const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace, push }) }));

let session: { access_token: string } | null = null;
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getSession: () => Promise.resolve({ data: { session } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
      signOut: () => Promise.resolve({}),
    },
  }),
}));

const access = { email: 'a@b.fr', isSuperAdmin: false, memberships: [{ organizationId: 'o1', organizationName: 'Centre', role: 'org_admin' }] };
jest.mock('@/modules/organizations', () => ({
  ...jest.requireActual('@/modules/organizations'),
  fetchMyAccess: () => Promise.resolve(access),
}));

beforeEach(() => { localStorage.clear(); session = null; replace.mockClear(); push.mockClear(); });

describe('header by role', () => {
  it('offers both entries to a visitor', async () => {
    render(<SiteHeader />);
    expect(await screen.findByRole('link', { name: 'Je suis apprenant' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Centre de formation' })).toBeInTheDocument();
  });

  it('shows a learner only their own space, never the centre’s', async () => {
    saveLearnerToken('pp1.token.sig');
    render(<SiteHeader />);
    expect(await screen.findByRole('link', { name: 'Ma ville' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Compétition' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Mon centre|Centre de formation|Inscriptions|Corrections|Équipe/ })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Je suis apprenant' })).toBeNull();
  });

  it('shows a centre only its own space, never the learner’s', async () => {
    session = { access_token: 'jwt' };
    render(<SiteHeader />);
    expect(await screen.findByRole('link', { name: 'Mon centre' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('link', { name: 'Équipe' })).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: /Je suis apprenant|Ma ville|Compétition/ })).toBeNull();
  });

  it('shows only the logo while the role is unknown', () => {
    render(<SiteHeader />);
    expect(screen.queryByRole('link', { name: 'Je suis apprenant' })).toBeNull();
    expect(screen.getByRole('link', { name: /Play Perform/ })).toBeInTheDocument();
    return screen.findByRole('link', { name: 'Je suis apprenant' }); // let the session check finish
  });
});

describe('RoleGate', () => {
  it('hides the centre’s space from a learner and sends them to their own', async () => {
    saveLearnerToken('pp1.token.sig');
    render(<RoleGate deny="learner"><p>Espace du centre</p></RoleGate>);
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/competences'));
    expect(screen.queryByText('Espace du centre')).toBeNull();
  });

  it('lets a centre account in', async () => {
    session = { access_token: 'jwt' };
    render(<RoleGate deny="learner"><p>Espace du centre</p></RoleGate>);
    expect(await screen.findByText('Espace du centre')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});

describe('centre legal identity form', () => {
  const empty = { legalName: null, siren: null, siret: null, address: null, postalCode: null, city: null };

  it('explains a wrong SIREN before sending anything', async () => {
    render(<CentreIdentityForm organizationId="o1" initial={empty} onSaved={jest.fn()} />);
    await userEvent.type(screen.getByLabelText(/Raison sociale/), 'Centre Alpha SAS');
    await userEvent.type(screen.getByLabelText(/^SIREN/), '123456789');
    await userEvent.click(screen.getByRole('button', { name: /Enregistrer/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/SIREN invalide/);
  });
});
