import React from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-6">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Admin</span>
        <Link href="/admin/import"
          className="text-sm font-semibold text-slate-600 hover:text-violet-600 transition-colors">
          📥 Import CSV
        </Link>
        <Link href="/admin/questions"
          className="text-sm font-semibold text-slate-600 hover:text-violet-600 transition-colors">
          📝 Questions
        </Link>
        <Link href="/admin/parcours"
          className="text-sm font-semibold text-slate-600 hover:text-violet-600 transition-colors">
          🗺️ Parcours
        </Link>
        <Link href="/parent"
          className="text-sm font-semibold text-slate-600 hover:text-violet-600 transition-colors">
          👨‍👧 Élèves
        </Link>
        <div className="ml-auto">
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-600">← Accueil</Link>
        </div>
      </nav>
      <div className="p-6 max-w-5xl mx-auto">{children}</div>
    </div>
  );
}
