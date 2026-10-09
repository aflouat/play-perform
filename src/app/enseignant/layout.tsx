import type { ReactNode } from 'react';
import { RoleGate } from '@/shared/ui/RoleGate';

/** The centre's space is not for learners. */
export default function CentreLayout({ children }: { children: ReactNode }) {
  return <RoleGate deny="learner">{children}</RoleGate>;
}
