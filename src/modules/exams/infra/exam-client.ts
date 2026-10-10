import { getAuthToken } from '@/lib/auth-token';
import type { AgendaSlot, ExamSlot, LearnerBooking } from '../domain/types';
import type { Outcome } from '../domain/slots';

const headers = async () => ({ 'content-type': 'application/json', authorization: `Bearer ${await getAuthToken()}` });
const errorOf = async (res: Response, fallback: string) => ((await res.json().catch(() => ({}))) as { error?: string }).error ?? fallback;

async function get<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: await headers() });
    return res.ok ? ((await res.json()) as T) : null;
  } catch { return null; }
}

/** Sends a change; returns the error to show, or null. */
async function send(url: string, method: string, body?: unknown, fallback = 'Action impossible.'): Promise<string | null> {
  try {
    const res = await fetch(url, { method, headers: await headers(), body: body === undefined ? undefined : JSON.stringify(body) });
    return res.ok ? null : errorOf(res, fallback);
  } catch { return fallback; }
}

// Examiner
export const fetchAgenda = async (from: string, to: string) =>
  (await get<{ slots: AgendaSlot[] }>(`/api/exam-slots?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`))?.slots ?? null;
export const openAvailability = (range: { organizationId: string; from: string; to: string; durationMin: number }) =>
  send('/api/exam-slots', 'POST', range, 'Création impossible.');
export const closeSlot = (id: string) => send(`/api/exam-slots/${id}`, 'DELETE');
export const sendOutcome = (bookingId: string, outcome: Outcome, comment: string) =>
  send(`/api/exam-bookings/${bookingId}`, 'PATCH', { outcome, comment }, 'Enregistrement impossible.');

// Learner
export const fetchOpenSlots = async (profileId: string) =>
  (await get<{ slots: ExamSlot[] }>(`/api/exam-slots/open?profileId=${encodeURIComponent(profileId)}`))?.slots ?? [];
export const fetchMyOrals = async (profileId: string) =>
  (await get<{ bookings: LearnerBooking[] }>(`/api/exam-bookings?profileId=${encodeURIComponent(profileId)}`))?.bookings ?? [];
export const bookOralSlot = (profileId: string, slotId: string, skillId: string) =>
  send('/api/exam-bookings', 'POST', { profileId, slotId, skillId }, 'Réservation impossible.');
export const cancelOral = (bookingId: string) => send(`/api/exam-bookings/${bookingId}`, 'DELETE', undefined, 'Annulation impossible.');
