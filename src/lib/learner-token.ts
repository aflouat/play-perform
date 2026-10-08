import { createHmac, timingSafeEqual } from 'node:crypto';

const PREFIX = 'pp1';
const TTL_SECONDS = 30 * 24 * 60 * 60;

const b64 = (value: string) => Buffer.from(value).toString('base64url');
const sign = (data: string, secret: string) => createHmac('sha256', secret).update(data).digest('base64url');

/** Secret used to sign learner sessions: dedicated variable, else the service role key. */
export function learnerSecret(): string {
  const secret = process.env.LEARNER_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error('LEARNER_TOKEN_SECRET (ou SUPABASE_SERVICE_ROLE_KEY) manquant');
  return secret;
}

/** Learner tokens look like `pp1.<payload>.<signature>`; Supabase JWTs do not start with `pp1.`. */
export function isLearnerToken(token: string): boolean {
  return token.startsWith(`${PREFIX}.`);
}

export function signLearnerToken(profileId: string, now: Date, secret: string): string {
  const payload = b64(JSON.stringify({ sid: profileId, exp: Math.floor(now.getTime() / 1000) + TTL_SECONDS }));
  return `${PREFIX}.${payload}.${sign(`${PREFIX}.${payload}`, secret)}`;
}

export function verifyLearnerToken(token: string, now: Date, secret: string): { profileId: string } | null {
  const [prefix, payload, signature] = token.split('.');
  if (prefix !== PREFIX || !payload || !signature) return null;
  const expected = Buffer.from(sign(`${prefix}.${payload}`, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const { sid, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { sid?: unknown; exp?: unknown };
    if (typeof sid !== 'string' || typeof exp !== 'number' || exp * 1000 < now.getTime()) return null;
    return { profileId: sid };
  } catch { return null; }
}
