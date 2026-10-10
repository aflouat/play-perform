import Link from 'next/link';
import { getSkillById } from '@/modules/skills';
import type { ResumeTarget } from '../domain/roadmap';

const skillName = (id: string) => getSkillById(id)?.name ?? id;

function detailOf(target: ResumeTarget): string {
  if (target.kind === 'finished') return 'Feuille de route terminée ! Vise la maîtrise dans ta ville.';
  if (target.kind === 'remediation') {
    return `D’abord « ${skillName(target.skillId)} » niveau ${target.level}, requis pour « ${target.forTitle} »`;
  }
  return `« ${target.title} » · ${skillName(target.skillId)} vers le niveau ${target.level}`;
}

/** "Action immédiate": one big button that takes the learner straight back where they stopped. */
export function ResumeButton({ target }: { target: ResumeTarget }) {
  return (
    <Link href={target.href}
      className="flex items-center gap-4 rounded-3xl bg-gradient-to-r from-amber-400 to-orange-400 px-6 py-5 text-violet-950 shadow-lg transition hover:scale-[1.01] hover:shadow-xl">
      <span aria-hidden="true" className="text-4xl">{target.kind === 'finished' ? '🎉' : '🚀'}</span>
      <span className="flex-1">
        <span className="block text-xl font-black">{target.kind === 'finished' ? 'Bravo, carte terminée !' : 'Reprendre mon apprentissage'}</span>
        <span className="block text-sm font-semibold">{detailOf(target)}</span>
      </span>
      <span aria-hidden="true" className="text-2xl font-black">→</span>
    </Link>
  );
}
