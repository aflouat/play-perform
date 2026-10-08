export type ProgressInput =
  | { kind: 'score'; profileId: string; xp: number; level: number; streak: number }
  | { kind: 'badge'; profileId: string; badgeId: string };

type Result = { ok: true; value: ProgressInput } | { ok: false; error: string };

const int = (v: unknown, min: number, max: number): v is number => typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;

/** Body of PUT /api/progress: the browser's score and badge sync (untrusted input). */
export function validateProgressInput(input: unknown): Result {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'Requête invalide.' };
  const b = input as Record<string, unknown>;
  if (typeof b.profileId !== 'string' || !b.profileId || b.profileId.length > 80) return { ok: false, error: 'Profil manquant.' };
  if (b.kind === 'score') {
    if (!int(b.xp, 0, 10_000_000) || !int(b.level, 1, 100_000) || !int(b.streak, 0, 10_000)) return { ok: false, error: 'Score invalide.' };
    return { ok: true, value: { kind: 'score', profileId: b.profileId, xp: b.xp, level: b.level, streak: b.streak } };
  }
  if (b.kind === 'badge') {
    if (typeof b.badgeId !== 'string' || !/^[a-z0-9-]{1,40}$/.test(b.badgeId)) return { ok: false, error: 'Badge invalide.' };
    return { ok: true, value: { kind: 'badge', profileId: b.profileId, badgeId: b.badgeId } };
  }
  return { ok: false, error: 'Type de progression inconnu.' };
}
