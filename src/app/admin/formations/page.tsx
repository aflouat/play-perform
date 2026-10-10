'use client';

import { TrainingPathAdmin } from '@/modules/dashboards';

export default function AdminFormationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-[#1a1a2e]">Parcours de formation</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Les 4 phases (Fondations → Bases → Consolidation → Approfondissement) sont communes ; chaque parcours y place ses chapitres.
          Un chapitre amène une compétence du catalogue à un niveau, avec un niveau minimum éventuel dans une autre compétence.
        </p>
      </div>
      <TrainingPathAdmin />
    </div>
  );
}
