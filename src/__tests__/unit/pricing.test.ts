import { formatPrice, eurosToCents, centsToEuros, yearlySavingPercent, validatePlanUpdate, billingSuffix } from '@/modules/pricing';

const nbsp = (s: string) => s.replace(/[  ]/g, ' ');

describe('pricing domain', () => {
  it('formats round prices without decimals and others with 2 decimals', () => {
    expect(nbsp(formatPrice(500))).toBe('5 €');
    expect(nbsp(formatPrice(499))).toBe('4,99 €');
    expect(nbsp(formatPrice(12000))).toBe('120 €');
  });

  it('converts euros typed by an admin into cents', () => {
    expect(eurosToCents('5')).toBe(500);
    expect(eurosToCents('4,99')).toBe(499);
    expect(eurosToCents('4.5')).toBe(450);
    expect(eurosToCents(' 49 ')).toBe(4900);
    expect(eurosToCents('abc')).toBeNull();
    expect(eurosToCents('-3')).toBeNull();
    expect(eurosToCents('1,999')).toBeNull();
  });

  it('converts cents back to an editable euro string', () => {
    expect(centsToEuros(499)).toBe('4,99');
    expect(centsToEuros(500)).toBe('5');
  });

  it('computes the yearly saving against 12 monthly payments', () => {
    expect(yearlySavingPercent(500, 5000)).toBe(17);
    expect(yearlySavingPercent(500, 6000)).toBeNull();
    expect(yearlySavingPercent(0, 5000)).toBeNull();
  });

  it('gives the billing period of each plan', () => {
    expect(billingSuffix('monthly')).toBe('/ mois');
    expect(billingSuffix('yearly')).toBe('/ an');
    expect(billingSuffix('lifetime')).toBe('une seule fois');
  });

  describe('validatePlanUpdate', () => {
    const valid = { label: '1 mois', priceCents: 500, description: 'Sans engagement', features: ['Toutes les compétences'], highlighted: false, active: true };

    it('accepts a valid update and trims texts', () => {
      const result = validatePlanUpdate({ ...valid, label: '  1 mois  ', features: [' A ', '', 'B'] });
      expect(result).toEqual({ ok: true, value: { ...valid, features: ['A', 'B'] } });
    });

    it.each([
      ['empty label', { ...valid, label: '  ' }],
      ['negative price', { ...valid, priceCents: -1 }],
      ['decimal cents', { ...valid, priceCents: 4.5 }],
      ['price too high', { ...valid, priceCents: 10_000_01 }],
      ['too many features', { ...valid, features: Array.from({ length: 9 }, (_, i) => `f${i}`) }],
      ['wrong type', { ...valid, active: 'yes' }],
      ['not an object', null],
    ])('rejects %s', (_label, input) => {
      expect(validatePlanUpdate(input).ok).toBe(false);
    });
  });
});
