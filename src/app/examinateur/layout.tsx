import type { ReactNode } from 'react';
import { AdminNav } from '@/modules/organizations';

export default function ExaminerLayout({ children }: { children: ReactNode }) {
  return <><AdminNav />{children}</>;
}
