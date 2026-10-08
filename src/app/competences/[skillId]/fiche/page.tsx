'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CourseSheetView } from '@/modules/skills';
import { useActiveProfileId, isProfileReady } from '@/hooks/useActiveProfileId';

export default function CourseSheetPage() {
  const { skillId } = useParams<{ skillId: string }>();
  const router = useRouter();
  const profileId = useActiveProfileId();
  useEffect(() => { if (profileId === '__none__') router.replace('/'); }, [profileId, router]);

  if (!isProfileReady(profileId)) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Chargement…</div>;
  }
  return (
    <main className="mx-auto max-w-md px-5 pt-8 pb-16">
      <button onClick={() => router.push('/competences')} className="mb-4 text-sm text-slate-400">← Ma ville des compétences</button>
      <CourseSheetView skillId={skillId} profileId={profileId} />
    </main>
  );
}
