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
    expect(await screen.findByRole('link', { name: 'Je commence mon apprentissage' })).toHaveAttribute('href', '/#commencer');
    expect(screen.getByRole('link', { name: 'J’ai un code' })).toHaveAttribute('href', '/apprenant');
  });

  it('keeps the centre’s entry in its own corner, apart from the learner’s calls to action', async () => {
    render(<SiteHeader />);
    const centre = await screen.findByRole('link', { name: /Gérer mon centre/ });
    expect(centre).toHaveAttribute('href', '/auth');
    const nav = screen.getByRole('navigation', { name: 'Navigation principale' });
    expect(nav).not.toContainElement(centre);
  });

  it('shows a learner only their own space, never the centre’s', async () => {
    saveLearnerToken('pp1.token.sig');
    render(<SiteHeader />);
    expect(await screen.findByRole('link', { name: 'Ma ville' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Compétition' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Mon centre|Centre de formation|Inscriptions|Corrections|Équipe/ })).toBeNull();
    expect(screen.queryByRole('link', { name: /Je commence mon apprentissage|J’ai un code/ })).toBeNull();
    expect(screen.queryByRole('link', { name: /Gérer mon centre/ })).toBeNull();
  });

  it('shows a centre only its own space, never the learner’s', async () => {
    session = { access_token: 'jwt' };
    render(<SiteHeader />);
    expect(await screen.findByRole('button', { name: 'Déconnexion' })).toBeInTheDocument();
    // one menu only: the section links live in the back-office menu, not in the site header
    expect(screen.queryByRole('link', { name: /Mon centre|Équipe|Inscriptions|Corrections/ })).toBeNull();
    expect(screen.queryByRole('link', { name: /Je commence mon apprentissage|J’ai un code|Ma ville|Compétition/ })).toBeNull();
  });

  it('shows only the logo while the role is unknown', () => {
    render(<SiteHeader />);
    expect(screen.queryByRole('link', { name: 'Je commence mon apprentissage' })).toBeNull();
    expect(screen.getByRole('link', { name: /Play Perform/ })).toBeInTheDocument();
    return screen.findByRole('link', { name: 'Je commence mon apprentissage' }); // let the session check finish
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

import PortalPage from '@/app/connexion/page';
import { within } from '@testing-library/react';

describe('entry portal', () => {
  it('offers two distinct doors, with action verbs, and never mixes their links', () => {
    render(<PortalPage />);
    const learner = screen.getByRole('region', { name: 'Apprendre et progresser' });
    const centre = screen.getByRole('region', { name: 'Gérer mon centre' });
    expect(within(learner).getByRole('link', { name: /Je commence mon apprentissage/ })).toHaveAttribute('href', '/#commencer');
    expect(within(learner).getByRole('link', { name: /code d.accès/ })).toHaveAttribute('href', '/apprenant');
    expect(within(centre).getByRole('link', { name: 'Gérer mon centre de formation' })).toHaveAttribute('href', '/auth');
    expect(within(centre).getByRole('link', { name: /Créer l.espace de mon centre/ })).toHaveAttribute('href', '/centre/inscription');
    expect(within(learner).queryByRole('link', { name: /centre/i })).toBeNull();
    expect(within(centre).queryByRole('link', { name: /apprentissage|code/ })).toBeNull();
  });
});

import { CentreSignupForm } from '@/modules/organizations/ui/CentreSignupForm';

describe('centre registration form', () => {
  it('asks for the legal identity and explains a wrong SIRET before sending', async () => {
    render(<CentreSignupForm />);
    await userEvent.type(screen.getByLabelText('E-mail'), 'contact@alpha.fr');
    await userEvent.type(screen.getByLabelText(/Mot de passe/), 'motdepasse1');
    await userEvent.type(screen.getByLabelText(/Raison sociale/), 'Centre Alpha SAS');
    await userEvent.type(screen.getByLabelText(/^SIREN/), '732829320');
    await userEvent.type(screen.getByLabelText(/SIRET de l/), '73282932000044');
    await userEvent.type(screen.getByLabelText(/Adresse de l/), '12 rue des Écoles');
    await userEvent.type(screen.getByLabelText(/Code postal/), '75005');
    await userEvent.type(screen.getByLabelText(/Ville/), 'Paris');
    expect(screen.getByRole('button', { name: /Déposer le dossier/ })).toBeDisabled();
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: /Déposer le dossier/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/SIRET invalide/);
  });
});
