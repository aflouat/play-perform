'use client';

import Link from 'next/link';
import { getSkillById, getSkillLevel } from '@/modules/skills';
import { courseHref, type CourseView, type PhaseView } from '../domain/roadmap';

const formatDay = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
const skillName = (id: string) => getSkillById(id)?.name ?? id;
const ICON = { done: '✅', ready: '▶️', 'needs-level': '🔒' } as const;

/** Target date versus actual date; red when the current phase is past its target. */
function Schedule({ phase }: { phase: PhaseView }) {
  if (phase.status === 'done') {
    return (
      <p className="text-sm text-slate-600">
        Objectif : {formatDay(phase.plannedDate)} · Réalisée {phase.completedAt ? `le ${formatDay(phase.completedAt)}` : ''}
        {phase.late && <span className="font-bold text-amber-700"> ({phase.daysLate} j après l’objectif)</span>}
      </p>
    );
  }
  return phase.late
    ? <p className="text-sm font-bold text-rose-600">Objectif : {formatDay(phase.plannedDate)} · en retard de {phase.daysLate} j, on s’y remet !</p>
    : <p className="text-sm text-slate-600">Objectif : {formatDay(phase.plannedDate)}</p>;
}

function Course({ course, active }: { course: CourseView; active: boolean }) {
  const target = `${skillName(course.skillId)} · niveau ${course.targetLevel} (${getSkillLevel(course.targetLevel).label})`;
  const req = course.requires;
  return (
    <li className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 text-sm">
      <span aria-hidden="true">{ICON[course.state]}</span>
      <div className="flex-1">
        <p className={`font-bold ${course.state === 'done' ? 'text-slate-500 line-through' : 'text-[#1a1a2e]'}`}>{course.title}</p>
        <p className="text-xs text-slate-500">{target} · ton niveau : {course.level ?? '—'}</p>
        {req && (
          <p className={`text-xs ${course.state === 'needs-level' ? 'font-bold text-amber-700' : 'text-slate-500'}`}>
            Niveau {req.level} en {skillName(req.skillId)} requis pour débloquer ce cours
          </p>
        )}
      </div>
      {active && course.state === 'ready' && (
        <Link href={courseHref(course.skillId)} className="shrink-0 font-bold text-violet-600">Commencer →</Link>
      )}
      {active && course.state === 'needs-level' && req && (
        <Link href={courseHref(req.skillId)} className="shrink-0 font-bold text-amber-700">Remise à niveau →</Link>
      )}
    </li>
  );
}

/** Detail of a phase: its label, its chapters (specific to the training path) with the minimum level required, and its planning. */
export function PhaseDetail({ phase }: { phase: PhaseView }) {
  return (
    <div role="region" aria-label={`Détail de la phase ${phase.number}`} className="mt-5 space-y-3 border-t border-slate-100 pt-4">
      <h3 className="font-black text-[#1a1a2e]">Phase {phase.number} · {phase.title}</h3>
      <Schedule phase={phase} />
      <ul className="space-y-2">
        {phase.courses.map((c) => <Course key={c.title} course={c} active={phase.status === 'current'} />)}
      </ul>
    </div>
  );
}
