import { validateCentreApplication, validateApplicationDecision } from '@/modules/organizations';

const identity = {
  legalName: 'Centre Alpha SAS', siren: '732 829 320', siret: '732 829 320 00074',
  address: '12 rue des Écoles', postalCode: '75005', city: 'Paris',
};

describe('validateCentreApplication', () => {
  it('accepts an e-mail with a complete legal identity', () => {
    const result = validateCentreApplication({ email: ' Contact@Alpha.FR ', ...identity });
    expect(result).toEqual({ ok: true, value: {
      email: 'contact@alpha.fr', legalName: 'Centre Alpha SAS', siren: '732829320', siret: '73282932000074',
      address: '12 rue des Écoles', postalCode: '75005', city: 'Paris',
    } });
  });
  it.each([
    ['bad e-mail', { email: 'nope', ...identity }],
    ['bad SIREN', { email: 'a@b.fr', ...identity, siren: '123456789' }],
    ['SIRET of another company', { email: 'a@b.fr', ...identity, siret: '35600000000048' }],
    ['no address', { email: 'a@b.fr', ...identity, address: '' }],
    ['not an object', 42],
  ])('rejects %s', (_label, input) => {
    expect(validateCentreApplication(input).ok).toBe(false);
  });
});

describe('validateApplicationDecision', () => {
  it('approves without a comment', () => {
    expect(validateApplicationDecision({ status: 'approved' })).toEqual({ ok: true, value: { status: 'approved', comment: '' } });
  });
  it('asks for a reason to refuse', () => {
    expect(validateApplicationDecision({ status: 'rejected', comment: ' ' }).ok).toBe(false);
    expect(validateApplicationDecision({ status: 'rejected', comment: 'SIRET introuvable' }).ok).toBe(true);
  });
  it('rejects other statuses', () => {
    expect(validateApplicationDecision({ status: 'pending' }).ok).toBe(false);
  });
});
