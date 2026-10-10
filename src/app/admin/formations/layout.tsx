import React from 'react';
import { SuperAdminGate } from '@/modules/organizations';

/** Training paths are common to every centre: only the parent company edits them. */
export default function FormationsLayout({ children }: { children: React.ReactNode }) {
  return <SuperAdminGate>{children}</SuperAdminGate>;
}
