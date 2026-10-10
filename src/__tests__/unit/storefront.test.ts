import { LEAD_STATUSES, centreMetadata, publicCentre, validateLead, validateLeadStatus } from '@/modules/storefront/domain/storefront';

const row = { id: 'org-1', name: 'Centre Alpha', slug: 'centre-alpha', kind: 'center', legal_name: 'Alpha Formation SAS', siren: '123456789', siret: '12345678900012',
  address: '12 rue des Lilas', postal_code: '69003', city: 'Lyon' };

describe('public face of a centre', () => {
  it('shows the trade name and the place, never the legal identifiers', () => {
    const centre = publicCentre(row);
    expect(centre).toEqual({ id: 'org-1', name: 'Centre Alpha', slug: 'centre-alpha', address: '12 rue des Lilas', postalCode: '69003', city: 'Lyon' });
    expect(JSON.stringify(centre)).not.toMatch(/123456789/);
  });

  it('gives each centre its own title and description for search engines', () => {
    expect(centreMetadata(publicCentre(row))).toEqual({
      title: 'Centre Alpha — formations et oraux à Lyon | Play Perform',
      description: expect.stringMatching(/Centre Alpha.*Lyon.*examinateur/),
    });
    expect(centreMetadata(publicCentre({ ...row, city: null })).title).toBe('Centre Alpha — formations et oraux | Play Perform');
  });
});

describe('information request (lead)', () => {
  const lead = { firstName: ' Léa ', contact: 'lea@example.fr', pathId: 'technicien-laboratoire', message: 'Je suis en 3e', consent: true };

  it('accepts a first name, an e-mail or a phone, and the consent', () => {
    expect(validateLead(lead, ['technicien-laboratoire'])).toEqual({ ok: true, value: { firstName: 'Léa', contact: 'lea@example.fr', pathId: 'technicien-laboratoire', message: 'Je suis en 3e' } });
    expect(validateLead({ ...lead, contact: '06 12 34 56 78' }, [])).toMatchObject({ ok: true, value: { contact: '0612345678', pathId: null } });
  });

  it.each([
    ['no consent', { consent: false }, /accepter/],
    ['an invalid contact', { contact: 'lea@' }, /e-mail ou un numéro/],
    ['no first name', { firstName: ' ' }, /prénom/],
    ['a too long message', { message: 'x'.repeat(1001) }, /1 000/],
  ])('refuses %s', (_label, patch, error) => {
    const result = validateLead({ ...lead, ...patch }, ['technicien-laboratoire']);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toMatch(error);
  });

  it('drops an unknown path rather than refusing the request', () => {
    expect(validateLead({ ...lead, pathId: 'astronaute' }, ['technicien-laboratoire'])).toMatchObject({ ok: true, value: { pathId: null } });
  });

  it('follows the centre’s handling of a request', () => {
    expect(LEAD_STATUSES).toEqual(['new', 'contacted', 'enrolled', 'closed']);
    expect(validateLeadStatus({ status: 'contacted' })).toEqual({ ok: true, value: 'contacted' });
    expect(validateLeadStatus({ status: 'spam' }).ok).toBe(false);
  });
});
