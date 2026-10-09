import type { ReactNode } from 'react';
import { AdminNav } from '@/modules/organizations';
import { RoleGate } from '@/shared/ui/RoleGate';

/** The centre's space: its menu (shared with the back-office), never shown to learners. */
export default function CentreLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGate deny="learner">
      <AdminNav />
      {children}
    </RoleGate>
  );
}
