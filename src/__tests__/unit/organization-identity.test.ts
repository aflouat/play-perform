import { validateSiren, validateSiret, validateCentreIdentity, formatSiren, formatSiret, isIdentityComplete } from '@/modules/organizations';

describe('SIREN / SIRET', () => {
  it('accepts valid numbers, with or without spaces', () => {
    expect(validateSiren('732 829 320')).toEqual({ ok: true, value: '732829320' });
    expect(validateSiret('732 829 320 00074')).toEqual({ ok: true, value: '73282932000074' });
  });
  it('rejects a wrong length, letters and a bad checksum', () => {
    expect(validateSiren('73282932').ok).toBe(false);
    expect(validateSiren('7328293AB').ok).toBe(false);
    expect(validateSiren('123456789').ok).toBe(false);
    expect(validateSiret('73282932000044').ok).toBe(false);
  });
  it('requires the establishment (SIRET) to belong to the company (SIREN)', () => {
    expect(validateCentreIdentity({ siren: '732829320', siret: '35600000000048' } as never).ok).toBe(false);
  });
  it('formats for display', () => {
    expect(formatSiren('732829320')).toBe('732 829 320');
    expect(formatSiret('73282932000074')).toBe('732 829 320 00074');
  });
});

describe('validateCentreIdentity', () => {
  const ok = {
    legalName: 'Centre Alpha SAS', siren: '732 829 320', siret: '732 829 320 00074',
    address: '12 rue des Écoles', postalCode: '75005', city: 'Paris',
  };
  it('cleans and accepts a complete identity', () => {
    expect(validateCentreIdentity(ok)).toEqual({ ok: true, value: {
      legalName: 'Centre Alpha SAS', siren: '732829320', siret: '73282932000074', address: '12 rue des Écoles', postalCode: '75005', city: 'Paris',
    } });
  });
  it.each([
    ['no legal name', { ...ok, legalName: ' ' }],
    ['bad postal code', { ...ok, postalCode: '7500' }],
    ['no address', { ...ok, address: '' }],
    ['no city', { ...ok, city: '' }],
    ['bad siren', { ...ok, siren: '123456789' }],
    ['not an object', null],
  ])('rejects %s', (_label, input) => {
    expect(validateCentreIdentity(input).ok).toBe(false);
  });
  it('tells whether a centre has filled its legal identity', () => {
    expect(isIdentityComplete({ siren: '732829320', siret: '73282932000074', legalName: 'A', address: 'x', postalCode: '75005', city: 'Paris' })).toBe(true);
    expect(isIdentityComplete({ siren: null, siret: null, legalName: null, address: null, postalCode: null, city: null })).toBe(false);
  });
});
