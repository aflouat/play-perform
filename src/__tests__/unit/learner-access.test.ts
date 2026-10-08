/** @jest-environment node */
import { signLearnerToken, verifyLearnerToken, isLearnerToken } from '@/lib/learner-token';
import { generateAccessCode, normalizeAccessCode, formatAccessCode } from '@/lib/access-code';

const SECRET = 'test-secret';
const NOW = new Date('2026-10-08T10:00:00Z');

describe('learner token', () => {
  it('round-trips the profile id', () => {
    const token = signLearnerToken('student-1', NOW, SECRET);
    expect(isLearnerToken(token)).toBe(true);
    expect(verifyLearnerToken(token, NOW, SECRET)).toEqual({ profileId: 'student-1' });
  });
  it('rejects a tampered payload, a wrong secret and an expired token', () => {
    const token = signLearnerToken('student-1', NOW, SECRET);
    const [v, , sig] = token.split('.');
    const forged = `${v}.${Buffer.from(JSON.stringify({ sid: 'student-2', exp: 9999999999 })).toString('base64url')}.${sig}`;
    expect(verifyLearnerToken(forged, NOW, SECRET)).toBeNull();
    expect(verifyLearnerToken(token, NOW, 'other')).toBeNull();
    expect(verifyLearnerToken(token, new Date('2026-12-30T00:00:00Z'), SECRET)).toBeNull();
  });
  it('does not mistake a Supabase JWT for a learner token', () => {
    expect(isLearnerToken('eyJhbGciOi.eyJzdWIi.abc')).toBe(false);
    expect(verifyLearnerToken('garbage', NOW, SECRET)).toBeNull();
  });
});

describe('access codes', () => {
  it('generates 8 readable characters without look-alikes', () => {
    const code = generateAccessCode();
    expect(code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/);
  });
  it('formats as XXXX-XXXX and normalizes user input', () => {
    expect(formatAccessCode('ABCD2345')).toBe('ABCD-2345');
    expect(normalizeAccessCode(' abcd-2345 ')).toBe('ABCD2345');
    expect(normalizeAccessCode('ab 12-cd')).toBe('AB12CD');
  });
});

import { allowAttempt } from '@/lib/rate-limit';

describe('rate limit', () => {
  it('blocks after the maximum and frees the key after the window', () => {
    const t = 1_000_000;
    expect([1, 2, 3].map(() => allowAttempt('ip-a', 3, 1000, t))).toEqual([true, true, true]);
    expect(allowAttempt('ip-a', 3, 1000, t + 10)).toBe(false);
    expect(allowAttempt('ip-b', 3, 1000, t + 10)).toBe(true);
    expect(allowAttempt('ip-a', 3, 1000, t + 2000)).toBe(true);
  });
});
