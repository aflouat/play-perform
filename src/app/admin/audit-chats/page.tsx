'use client';

import { ChatAudit } from '@/modules/collab';

export default function AuditChatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-[#1a1a2e]">Audit des chats de binôme</h1>
        <p className="mt-0.5 text-xs text-slate-500">Piste d’audit : tous les messages sont conservés (jamais modifiés ni supprimés). À consulter en cas de signalement ou de non-respect du règlement.</p>
      </div>
      <ChatAudit />
    </div>
  );
}
