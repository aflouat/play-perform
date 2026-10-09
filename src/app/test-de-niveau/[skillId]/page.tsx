'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PlacementReview } from '@/modules/landing';

export default function PlacementReviewPage() {
  const { skillId } = useParams<{ skillId: string }>();
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-8">
      <Link href="/" className="mb-6 inline-flex text-sm text-slate-400 hover:text-slate-600">← Retour à l&apos;accueil</Link>
      <PlacementReview skillId={skillId} />
    </main>
  );
}
