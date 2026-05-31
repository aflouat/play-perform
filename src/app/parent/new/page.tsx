'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AddStudentForm } from '@/components/parent/AddStudentForm';

export default function NewStudentPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#1a1a2e]">Ajouter un élève</h1>
            <p className="text-slate-500 text-sm">Créez un nouveau profil élève.</p>
          </div>
          <Link href="/parent" className="text-xs text-slate-400 hover:text-slate-600 font-semibold">← Retour</Link>
        </div>

        <AddStudentForm onAdded={() => { router.push('/parent'); }} />

      </div>
    </div>
  );
}
