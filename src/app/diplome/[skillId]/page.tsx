'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DiplomaView, fetchDiploma, getSkillById, type DiplomaGap, type DiplomaResponse } from '@/modules/skills';
import { IdentityForm } from '@/modules/competition';
import { useActiveProfileId, isProfileReady } from '@/hooks/useActiveProfileId';

const GUIDE: Record<Exclude<DiplomaGap, 'names'>, (skillId: string) => { text: string; href: string; cta: string }> = {
  enrollment: (id) => ({ text: 'T’inscrire à la formation complète (immédiat)', href: `/competences/${id}/fiche`, cta: 'Voir la formation' }),
  level: (id) => ({ text: 'Atteindre le niveau 5 avec les quiz et les évaluations', href: `/competences/${id}`, cta: 'Progresser' }),
  evaluation: (id) => ({ text: 'Faire valider par un examinateur une évaluation rédigée de niveau 4 ou plus', href: `/competences/${id}`, cta: 'Passer l’évaluation' }),
};

export default function DiplomaPage() {
  const { skillId } = useParams<{ skillId: string }>();
  const router = useRouter();
  const profileId = useActiveProfileId();
  const [state, setState] = useState<DiplomaResponse | null | undefined>(undefined);
  const skill = getSkillById(skillId);

  useEffect(() => { if (profileId === '__none__') router.replace('/'); }, [profileId, router]);
  const load = useCallback(() => { if (isProfileReady(profileId)) fetchDiploma(profileId, skillId).then(setState); }, [profileId, skillId]);
  useEffect(load, [load]);

  if (!isProfileReady(profileId) || state === undefined) return <div className="flex flex-1 items-center justify-center text-sm text-slate-400">Chargement…</div>;
  if (state?.diploma) {
    return (
      <main className="px-4 py-8">
        <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between print:hidden">
          <Link href="/competences" className="text-sm text-slate-400">← Ma ville</Link>
          <button onClick={() => window.print()} className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white">🖨️ Imprimer mon diplôme</button>
        </div>
        <DiplomaView diploma={state.diploma} />
      </main>
    );
  }
  const missing = state?.missing ?? [];
  return (
    <main className="mx-auto max-w-md px-5 py-8">
      <Link href="/competences" className="mb-4 inline-block text-sm text-slate-400">← Ma ville</Link>
      <h1 className="text-xl font-black text-[#1a1a2e]">🎓 Diplôme · {skill?.name ?? 'compétence'}</h1>
      {state === null ? <p className="mt-3 text-sm text-slate-500">Impossible de vérifier ton parcours pour l’instant.</p> : (
        <>
          <p className="mb-4 mt-1 text-sm text-slate-600">Il te reste à :</p>
          <ul className="space-y-2">
            {missing.filter((m): m is Exclude<DiplomaGap, 'names'> => m !== 'names').map((m) => {
              const g = GUIDE[m](skillId);
              return <li key={m} className="flex items-center justify-between gap-3 rounded-xl bg-white p-3 text-sm shadow-sm"><span>{g.text}</span><Link href={g.href} className="shrink-0 font-bold text-violet-700">{g.cta} →</Link></li>;
            })}
          </ul>
          {missing.includes('names') && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-slate-600">Indique ton prénom et ton nom : ils seront imprimés sur le diplôme.</p>
              <IdentityForm profileId={profileId} onSaved={load} />
            </div>
          )}
        </>
      )}
    </main>
  );
}
