import React from 'react';
import { AdminNav } from '@/modules/organizations';
import { RoleGate } from '@/shared/ui/RoleGate';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 bg-slate-50">
      <AdminNav />
      <div className="p-6 max-w-5xl mx-auto"><RoleGate deny="learner">{children}</RoleGate></div>
    </div>
  );
}
