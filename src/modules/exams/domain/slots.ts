import { getSkillById } from '@/modules/skills';

/** Length of an oral by default; the examiner may pick another one when adding availabilities. */
export const DEFAULT_SLOT_MINUTES = 30;
export const SLOT_DURATIONS = [15, 30, 45, 60] as const;
export const MIN_NOTICE_HOURS = 2;
export const LEARNER_CANCEL_HOURS = 24;
export const MAX_UPCOMING_ORALS = 3;
const MAX_RANGE_HOURS = 12;
const MAX_DAYS_AHEAD = 90;
const HOUR_MS = 60 * 60 * 1000;

export type SlotStatus = 'available' | 'booked' | 'cancelled';
export type BookingStatus = 'booked' | 'cancelled' | 'done';
export type Outcome = 'passed' | 'failed' | 'no_show';
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const record = (v: unknown) => (typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : null);
const date = (v: unknown) => { const d = typeof v === 'string' ? new Date(v) : null; return d && !Number.isNaN(d.getTime()) ? d : null; };

/** Start times of the slots that fit entirely in [from, to). */
export function splitAvailability(from: Date, to: Date, minutes: number = DEFAULT_SLOT_MINUTES): string[] {
  const starts: string[] = [];
  for (let t = from.getTime(); t + minutes * 60_000 <= to.getTime(); t += minutes * 60_000) starts.push(new Date(t).toISOString());
  return starts;
}

/** Body of POST /api/exam-slots: a range of availability of the examiner in one centre, cut into slots. */
export function validateAvailability(input: unknown, now: Date): Result<{ organizationId: string; durationMin: number; starts: string[] }> {
  const raw = record(input);
  if (!raw) return { ok: false, error: 'Requête invalide.' };
  if (typeof raw.organizationId !== 'string' || !raw.organizationId) return { ok: false, error: 'Choisis le centre de ces créneaux.' };
  const durationMin = raw.durationMin === undefined ? DEFAULT_SLOT_MINUTES : Number(raw.durationMin);
  if (!(SLOT_DURATIONS as readonly number[]).includes(durationMin)) return { ok: false, error: 'Durée invalide : 15, 30, 45 ou 60 minutes.' };
  const from = date(raw.from);
  const to = date(raw.to);
  if (!from || !to) return { ok: false, error: 'Indique le début et la fin de la plage.' };
  if (to <= from) return { ok: false, error: 'La fin doit être après le début.' };
  if (from < now) return { ok: false, error: 'Cette plage est déjà passée.' };
  if (to.getTime() - from.getTime() > MAX_RANGE_HOURS * HOUR_MS) return { ok: false, error: `Une plage dure ${MAX_RANGE_HOURS} h au plus.` };
  if (from.getTime() - now.getTime() > MAX_DAYS_AHEAD * 24 * HOUR_MS) return { ok: false, error: `Les créneaux s’ouvrent ${MAX_DAYS_AHEAD} jours à l’avance au plus.` };
  const starts = splitAvailability(from, to, durationMin);
  if (starts.length === 0) return { ok: false, error: 'La plage doit contenir au moins un créneau entier.' };
  return { ok: true, value: { organizationId: raw.organizationId, durationMin, starts } };
}

export interface BookingRequest { profileId: string; slotId: string; skillId: string }

export function validateBookingRequest(input: unknown): Result<BookingRequest> {
  const raw = record(input);
  const ok = (v: unknown) => typeof v === 'string' && v.length > 0;
  if (!raw || !ok(raw.profileId) || !ok(raw.slotId) || !ok(raw.skillId)) return { ok: false, error: 'Requête invalide.' };
  if (!getSkillById(raw.skillId as string)) return { ok: false, error: 'Compétence inconnue.' };
  return { ok: true, value: { profileId: raw.profileId as string, slotId: raw.slotId as string, skillId: raw.skillId as string } };
}

export interface BookingContext {
  slot: { status: SlotStatus; startsAt: string; organizationId: string };
  studentOrganizationId: string;
  enrolled: boolean;
  /** Orals still to come for this learner: in this skill, and in all */
  upcomingForSkill: number; upcomingTotal: number;
}

/** Why a learner cannot book this slot (null: they can). */
export function bookingRefusal(c: BookingContext, now: Date): { status: 403 | 409; error: string } | null {
  if (c.slot.organizationId !== c.studentOrganizationId) return { status: 403, error: 'Ce créneau est réservé aux élèves d’un autre centre que ton centre.' };
  if (!c.enrolled) return { status: 403, error: 'L’oral fait partie de la formation complète : inscris-toi d’abord à cette compétence.' };
  if (c.slot.status !== 'available') return { status: 409, error: 'Ce créneau n’est plus disponible : choisis-en un autre.' };
  if (new Date(c.slot.startsAt).getTime() - now.getTime() < MIN_NOTICE_HOURS * HOUR_MS) return { status: 409, error: `Réserve au moins ${MIN_NOTICE_HOURS} h à l’avance.` };
  if (c.upcomingForSkill > 0) return { status: 409, error: 'Tu as déjà un oral à venir dans cette compétence.' };
  if (c.upcomingTotal >= MAX_UPCOMING_ORALS) return { status: 409, error: `Tu as déjà ${MAX_UPCOMING_ORALS} oraux à venir : passe-les d’abord.` };
  return null;
}

/** Why a booking cannot be cancelled now (null: it can). The learner up to 24 h before, the examiner until the start. */
export function cancelRefusal(b: { status: BookingStatus; startsAt: string }, by: 'learner' | 'examiner', now: Date): string | null {
  if (b.status !== 'booked') return 'Cet oral est déjà annulé ou terminé.';
  const left = new Date(b.startsAt).getTime() - now.getTime();
  if (left <= 0) return 'L’oral a déjà commencé.';
  if (by === 'learner' && left < LEARNER_CANCEL_HOURS * HOUR_MS) return `Annulation possible jusqu’à ${LEARNER_CANCEL_HOURS} h avant : préviens ton centre.`;
  return null;
}

/** Body of PATCH /api/exam-bookings/:id: the examiner records the result once the oral has started. */
export function validateOutcome(input: unknown, startsAt: string, now: Date): Result<{ outcome: Outcome; comment: string }> {
  const raw = record(input);
  if (!raw || !['passed', 'failed', 'no_show'].includes(raw.outcome as string)) return { ok: false, error: 'Résultat invalide (passed, failed ou no_show).' };
  if (new Date(startsAt) > now) return { ok: false, error: 'L’oral n’a pas encore commencé.' };
  const comment = typeof raw.comment === 'string' ? raw.comment.trim().slice(0, 1000) : '';
  if (raw.outcome === 'failed' && !comment) return { ok: false, error: 'Explique ce qui manque pour aider l’élève.' };
  return { ok: true, value: { outcome: raw.outcome as Outcome, comment } };
}

/** Local day (YYYY-MM-DD) of an instant in a time zone. */
export const dayIn = (iso: string, timeZone: string) => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));

/** Slots grouped by local day, both in chronological order. */
export function groupByDay<T extends { startsAt: string }>(slots: readonly T[], timeZone: string): { day: string; slots: T[] }[] {
  const sorted = [...slots].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const days = new Map<string, T[]>();
  for (const s of sorted) days.set(dayIn(s.startsAt, timeZone), [...(days.get(dayIn(s.startsAt, timeZone)) ?? []), s]);
  return [...days].map(([day, list]) => ({ day, slots: list }));
}
