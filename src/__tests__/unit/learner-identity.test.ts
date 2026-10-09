import { validatePersonName, validateNickname, validateIdentityUpdate, isIdentityReady, canPrintDiploma } from '@/modules/competition';

describe('validatePersonName (diploma)', () => {
  it.each([['Léa', 'Léa'], [' Jean-Pierre ', 'Jean-Pierre'], ["O'Neil", "O'Neil"], ['de   la Tour', 'de la Tour']])('accepts %p', (input, expected) => {
    expect(validatePersonName(input)).toEqual({ ok: true, value: expected });
  });
  it.each([[''], ['  '], ['A'.repeat(41)], ['R2D2'], ['<b>'], [42], [null]])('rejects %p', (input) => {
    expect(validatePersonName(input).ok).toBe(false);
  });
});

describe('validateNickname with the real names', () => {
  const real = { firstName: 'Léa', lastName: 'Martin' };
  it('still accepts a plain pseudonym', () => {
    expect(validateNickname('RenardBleu42', real)).toEqual({ ok: true, value: 'RenardBleu42' });
  });
  it('refuses a pseudonym that reveals the first or last name, whatever the accents and case', () => {
    expect(validateNickname('lea_pro', real).ok).toBe(false);
    expect(validateNickname('MARTIN2010', real).ok).toBe(false);
    expect(validateNickname('Mon-Léa', real).ok).toBe(false);
  });
  it('does not block a short name that is only a fragment of a word', () => {
    expect(validateNickname('Panda', { firstName: 'Al', lastName: 'Li' }).ok).toBe(true);
  });
  it('works without known names', () => {
    expect(validateNickname('Lynx_9').ok).toBe(true);
  });
});

describe('validateIdentityUpdate', () => {
  it('accepts any subset of fields and cleans them', () => {
    expect(validateIdentityUpdate({ profileId: 'p1', firstName: ' Léa ', lastName: 'Martin', nickname: 'RenardBleu42' }))
      .toEqual({ ok: true, value: { profileId: 'p1', firstName: 'Léa', lastName: 'Martin', nickname: 'RenardBleu42' } });
    expect(validateIdentityUpdate({ profileId: 'p1', nickname: 'Lynx_9' })).toEqual({ ok: true, value: { profileId: 'p1', nickname: 'Lynx_9' } });
  });
  it('rejects a bad field and says which', () => {
    const bad = validateIdentityUpdate({ profileId: 'p1', lastName: '12' });
    expect(bad.ok).toBe(false);
    expect(validateIdentityUpdate({ profileId: '', nickname: 'Lynx_9' }).ok).toBe(false);
    expect(validateIdentityUpdate({ profileId: 'p1' }).ok).toBe(false);
    expect(validateIdentityUpdate(null).ok).toBe(false);
  });
  it('checks the pseudonym against the names given in the same request', () => {
    expect(validateIdentityUpdate({ profileId: 'p1', firstName: 'Léa', nickname: 'lea99' }).ok).toBe(false);
  });
});

describe('identity readiness', () => {
  it('needs first name, last name and pseudonym to be complete', () => {
    expect(isIdentityReady({ firstName: 'Léa', lastName: 'Martin', nickname: 'Lynx_9' })).toBe(true);
    expect(isIdentityReady({ firstName: 'Léa', lastName: null, nickname: 'Lynx_9' })).toBe(false);
    expect(isIdentityReady({ firstName: 'Léa', lastName: 'Martin', nickname: null })).toBe(false);
  });
  it('prints a diploma with the two names only', () => {
    expect(canPrintDiploma({ firstName: 'Léa', lastName: 'Martin', nickname: null })).toBe(true);
    expect(canPrintDiploma({ firstName: 'Léa', lastName: ' ', nickname: 'x' })).toBe(false);
  });
});
