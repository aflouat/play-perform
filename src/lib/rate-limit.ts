/** Best-effort in-memory limiter (per server instance): enough to slow down guessing of access codes. */
const attempts = new Map<string, { count: number; resetAt: number }>();

export function allowAttempt(key: string, max: number, windowMs: number, now = Date.now()): boolean {
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}
