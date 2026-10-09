import type { ReactNode } from 'react';
import { SuperAdminGate } from '@/modules/organizations';

/** Shared by all centres: the parent company manages it. */
export default function SuperAdminOnlyLayout({ children }: { children: ReactNode }) {
  return <SuperAdminGate>{children}</SuperAdminGate>;
}
