'use client';

import Link from 'next/link';
import { getCourseSheet } from '../application/course-sheet';
import { useEnrollments } from '../application/use-enrollments';
import { useSkillLevels } from '../application/skill-progress';
import { isEnrolled } from '../domain/enrollment';
import { EnrollmentForm } from './EnrollmentForm';

const ACTIVITY_LABEL = { quiz: '❓ Quiz', flashcards: '🗂️ Flashcards', evaluation: '📝 Évaluation corrigée' } as const;

/** Course sheet: what the course teaches and how, then the enrollment request. */
export function CourseSheetView({ skillId, profileId }: { skillId: string; profileId: string }) {
  const sheet = getCourseSheet(skillId);
  const { enrollments, reload } = useEnrollments(profileId);
  const level = useSkillLevels(profileId)[skillId] ?? null;
  if (!sheet) return <p className="text-center text-slate-500">Cours introuvable.</p>;

  const mine = enrollments.find((e) => e.skillId === skillId);
  const enrolled = isEnrolled(skillId, level, enrollments);
  const hours = Math.round(sheet.minutesToMaster / 60);

  return (
    <div className="space-y-5">
      <header className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Fiche du cours · {sheet.skill.domain}</p>
        <h1 className="mt-1 text-xl font-black text-[#1a1a2e]">{sheet.skill.emoji} {sheet.skill.name}</h1>
        <p className="mt-2 text-sm text-slate-600">{sheet.skill.description}</p>
        <p className="mt-3 text-xs text-slate-500">⏱️ Environ {hours} h de travail pour atteindre la maîtrise (niveau 5).</p>
      </header>

      <section aria-label="Parcours" className="rounded-3xl bg-white p-5 border border-slate-200">
        <h2 className="mb-2 font-black text-[#1a1a2e]">Le parcours en 5 niveaux</h2>
        <ol className="space-y-1.5 text-sm text-slate-600">
          {sheet.levels.map((l) => <li key={l.n}><strong>{l.n}. {l.label}</strong> — {l.description}</li>)}
        </ol>
        <h2 className="mb-1 mt-4 font-black text-[#1a1a2e]">Comment progresser</h2>
        <ul className="flex flex-wrap gap-2 text-xs font-semibold text-violet-700">
          {sheet.activities.map((a) => <li key={a} className="rounded-full bg-violet-50 px-3 py-1">{ACTIVITY_LABEL[a]}</li>)}
        </ul>
      </section>

      {enrolled
        ? <Link href={`/competences/${skillId}`} className="block rounded-2xl bg-violet-600 py-3 text-center font-bold text-white">Commencer le cours →</Link>
        : <EnrollmentForm profileId={profileId} skillId={skillId} existing={mine} onSent={reload} />}
    </div>
  );
}
