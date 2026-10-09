'use client';

import { useEffect, useState } from 'react';
import type { CentreApplication } from '../domain/application';
import { fetchMyApplication } from '../infra/organization-client';

/** Banner of my space while my centre's application is waiting or was refused. */
export function CentreApplicationBanner() {
  const [application, setApplication] = useState<CentreApplication | null>(null);
  useEffect(() => { fetchMyApplication().then(setApplication); }, []);
  if (!application || application.status === 'approved') return null;

  return application.status === 'pending' ? (
    <p role="status" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
      ⏳ Le dossier de <strong>{application.legalName}</strong> est en cours d’examen par Play Perform. Tu pourras inscrire tes élèves dès qu’il sera accepté.
    </p>
  ) : (
    <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-900">
      ↩️ Le dossier de <strong>{application.legalName}</strong> a été refusé{application.comment ? ` : « ${application.comment} »` : ''}. Tu peux en déposer un nouveau.
    </p>
  );
}
