import React from 'react';
import { SuperAdminGate } from '@/modules/organizations';

/** The chats belong to Play Perform: only the parent company reads them. */
export default function AuditChatsLayout({ children }: { children: React.ReactNode }) {
  return <SuperAdminGate>{children}</SuperAdminGate>;
}
