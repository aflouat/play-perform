'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { examinerNotice } from '../domain/staffing';
import { fetchExaminerStatus, type ExaminerStatus } from '../infra/staffing-client';

/** Notification for a teacher or examiner the centre allowed to give orals: enter availabilities to be bookable (urgent when learners wait). */
export function OralAvailabilityNotice() {
  const [status, setStatus] = useState<ExaminerStatus | null>(null);
  useEffect(() => { fetchExaminerStatus().then(setStatus); }, []);
  const notice = status && examinerNotice({ centres: status.centres.length, openSlots: status.openSlots, waiting: status.waiting });
  if (!notice) return null;
  return (
    <div role="status" className={`flex flex-wrap items-center gap-3 rounded-2xl p-4 text-sm ${notice.tone === 'urgent' ? 'bg-rose-50 text-rose-900' : 'bg-violet-50 text-violet-900'}`}>
      <span aria-hidden="true" className="text-2xl">🎤</span>
      <p className="flex-1 font-semibold">{notice.text}</p>
      <Link href="/examinateur/agenda" className="rounded-xl bg-violet-600 px-4 py-2 font-bold text-white">Saisir mes disponibilités →</Link>
    </div>
  );
}
