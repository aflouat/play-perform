import type { SkillLevelNumber } from '@/modules/skills';
import type { RoadmapCourse } from './roadmap';
import { GENERIC_PHASES, type GenericPhaseId, type PathPhase, type TrainingPath } from './training-path';

export type PathInput = { ok: true; value: TrainingPath & { active: boolean } } | { ok: false; error: string };

const MAX_CHAPTERS = 8;
const text = (v: unknown, min: number, max: number) => (typeof v === 'string' && v.trim().length >= min && v.trim().length <= max ? v.trim() : null);
const level = (v: unknown) => (Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 5 ? (v as SkillLevelNumber) : null);
const record = (v: unknown) => (typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : null);

/** Lowercase identifier from a name: "Technicien Pharma" → "technicien-pharma". */
export function slugify(name: string): string {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}

/** Starting point of a new path in the editor: the 4 generic phases, no chapter, not yet offered to learners. */
export function emptyTrainingPath(): TrainingPath & { active: boolean } {
  const phases = Object.fromEntries(GENERIC_PHASES.map((p) => [p.id, { weeks: 4, chapters: [] }])) as unknown as Record<GenericPhaseId, PathPhase>;
  return { id: '', name: '', emoji: '🎓', description: '', phases, active: false };
}

function chapterOf(raw: unknown, where: string, skillIds: readonly string[]): RoadmapCourse | string {
  const c = record(raw);
  if (!c) return `${where} : chapitre invalide.`;
  const title = text(c.title, 3, 100);
  if (!title) return `${where} : titre du chapitre requis (3 à 100 caractères).`;
  if (typeof c.skillId !== 'string' || !skillIds.includes(c.skillId)) return `${where} : compétence inconnue pour « ${title} ».`;
  const targetLevel = level(c.targetLevel);
  if (!targetLevel) return `${where} : niveau visé de 1 à 5 pour « ${title} ».`;
  if (c.requires === undefined || c.requires === null) return { title, skillId: c.skillId, targetLevel };
  const req = record(c.requires);
  const reqLevel = level(req?.level);
  if (!req || typeof req.skillId !== 'string' || !skillIds.includes(req.skillId) || !reqLevel) return `${where} : prérequis invalide pour « ${title} » (compétence inconnue ou niveau hors 1 à 5).`;
  if (req.skillId === c.skillId) return `${where} : le prérequis de « ${title} » doit porter sur une autre compétence.`;
  return { title, skillId: c.skillId, targetLevel, requires: { skillId: req.skillId, level: reqLevel } };
}

/** A path written in the editor of the parent company: identifier, texts, the 4 generic phases and their chapters. */
export function validateTrainingPath(input: unknown, skillIds: readonly string[]): PathInput {
  const raw = record(input);
  if (!raw) return { ok: false, error: 'Requête invalide.' };
  if (typeof raw.id !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(raw.id) || raw.id.length < 3 || raw.id.length > 40) {
    return { ok: false, error: 'Identifiant invalide : 3 à 40 caractères, minuscules, chiffres et tirets (ex. technicien-pharma).' };
  }
  const name = text(raw.name, 3, 60);
  if (!name) return { ok: false, error: 'Le nom du parcours doit faire de 3 à 60 caractères.' };
  const emoji = text(raw.emoji, 1, 8) ?? '🎓';
  const description = typeof raw.description === 'string' ? raw.description.trim().slice(0, 200) : '';
  const phasesIn = record(raw.phases);
  const phases = {} as Record<GenericPhaseId, PathPhase>;
  for (const { id, title } of GENERIC_PHASES) {
    const phase = record(phasesIn?.[id]);
    if (!phase) return { ok: false, error: `Phase « ${title} » manquante.` };
    if (!Number.isInteger(phase.weeks) || (phase.weeks as number) < 1 || (phase.weeks as number) > 52) return { ok: false, error: `Phase « ${title} » : durée de 1 à 52 semaines.` };
    if (!Array.isArray(phase.chapters) || phase.chapters.length === 0) return { ok: false, error: `Phase « ${title} » : ajoute au moins un chapitre.` };
    if (phase.chapters.length > MAX_CHAPTERS) return { ok: false, error: `Phase « ${title} » : ${MAX_CHAPTERS} chapitres au plus.` };
    const chapters: RoadmapCourse[] = [];
    for (const c of phase.chapters) {
      const chapter = chapterOf(c, `Phase « ${title} »`, skillIds);
      if (typeof chapter === 'string') return { ok: false, error: chapter };
      chapters.push(chapter);
    }
    phases[id] = { weeks: phase.weeks as number, chapters };
  }
  return { ok: true, value: { id: raw.id, name, emoji, description, phases, active: raw.active !== false } };
}
