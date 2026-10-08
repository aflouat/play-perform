'use client';

import { useEffect, useState } from 'react';
import { fetchEnrollments } from '../infra/enrollment-client';
import type { SkillEnrollment } from '../domain/enrollment';

/** Enrollment requests of a profile; `loaded` is false until the first answer (offline = stays empty). */
export function useEnrollments(profileId: string): { enrollments: SkillEnrollment[]; loaded: boolean; reload: () => void } {
  const [state, setState] = useState<{ enrollments: SkillEnrollment[]; loaded: boolean }>({ enrollments: [], loaded: false });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let alive = true;
    fetchEnrollments(profileId).then((enrollments) => { if (alive) setState({ enrollments, loaded: true }); });
    return () => { alive = false; };
  }, [profileId, version]);

  return { ...state, reload: () => setVersion((v) => v + 1) };
}
