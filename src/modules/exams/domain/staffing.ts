import { DIPLOMA_MIN_EVALUATION_LEVEL, type SkillLevelNumber } from '@/modules/skills';
import type { OrgRole } from '@/modules/organizations';

/** Staffing of the orals: who may give them (set by the centre) and the waiting list when nobody is available. */

/** The final oral of a skill: from the level the diploma requires on. */
export const FINAL_ORAL_LEVEL = DIPLOMA_MIN_EVALUATION_LEVEL;
export const isFinalOralPhase = (level: SkillLevelNumber | null): boolean => level !== null && level >= FINAL_ORAL_LEVEL;

/** Roles of a centre that may be allowed to give orals. */
const ORAL_ROLES: readonly OrgRole[] = ['teacher', 'examiner'];

export interface OralGrant { organizationId: string; userId: string; enabled: boolean }
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

/** Body of PUT /api/oral-staff: the centre enables or disables "peut faire passer les oraux" for one of its teachers or examiners. */
export function validateOralGrant(input: unknown, members: readonly { userId: string; role: OrgRole }[]): Result<OralGrant> {
  const raw = typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : null;
  if (!raw || typeof raw.organizationId !== 'string' || typeof raw.userId !== 'string' || typeof raw.enabled !== 'boolean') {
    return { ok: false, error: 'Requête invalide.' };
  }
  if (!members.some((m) => m.userId === raw.userId && ORAL_ROLES.includes(m.role))) {
    return { ok: false, error: 'Seuls les enseignants et examinateurs du centre peuvent faire passer les oraux.' };
  }
  return { ok: true, value: { organizationId: raw.organizationId, userId: raw.userId, enabled: raw.enabled } };
}

export interface OralRequestContext {
  enrolled: boolean; level: SkillLevelNumber | null;
  /** Free slots of the learner's centre right now */
  openSlots: number;
  upcomingForSkill: number;
  /** A waiting request already exists for this skill */
  waiting: boolean;
}

/** Why a learner is not put on the waiting list (null: they are). Status 200 = already waiting (nothing to do). */
export function oralRequestRefusal(c: OralRequestContext): { status: 200 | 403 | 409; error: string } | null {
  if (!c.enrolled) return { status: 403, error: 'L’oral fait partie de la formation complète : inscris-toi d’abord à cette compétence.' };
  if (!isFinalOralPhase(c.level)) return { status: 409, error: `La liste d’attente concerne l’oral final (à partir du niveau ${FINAL_ORAL_LEVEL}).` };
  if (c.upcomingForSkill > 0) return { status: 409, error: 'Tu as déjà un oral réservé dans cette compétence.' };
  if (c.openSlots > 0) return { status: 409, error: 'Des créneaux sont disponibles : réserve directement ton oral.' };
  if (c.waiting) return { status: 200, error: 'Tu es déjà sur la liste d’attente.' };
  return null;
}

/** Banner for someone allowed to give orals: ask for availabilities, more urgently when learners are waiting. */
export function examinerNotice(s: { centres: number; openSlots: number; waiting: number }): { tone: 'info' | 'urgent'; text: string } | null {
  if (s.centres === 0) return null;
  if (s.waiting > 0) {
    return { tone: 'urgent', text: `${s.waiting} élève${s.waiting > 1 ? 's attendent' : ' attend'} un examinateur pour l’oral final : ouvre des créneaux pour les recevoir.` };
  }
  if (s.openSlots === 0) return { tone: 'info', text: 'Ton centre t’a confié les oraux : saisis tes disponibilités pour que les élèves puissent te solliciter.' };
  return null;
}
