'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useRole, type Role } from '@/hooks/useRole';

/** Keeps a space for its role: someone with another role is sent back to their own space (nothing is rendered meanwhile). */
export function RoleGate({ deny, children }: { deny: Role; children: ReactNode }) {
  const role = useRole();
  const router = useRouter();
  useEffect(() => {
    if (role === 'learner' && deny === 'learner') router.replace('/competences');
  }, [role, deny, router]);
  return role === deny ? null : <>{children}</>;
}
