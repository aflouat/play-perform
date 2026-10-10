import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { seedQuestions } from '@/lib/db';
import { quizToDbRow } from '@/lib/question-bank-mapper';
import { listBuiltInBanks } from '@/modules/skills';

/** Super admin: copies the built-in banks into the database so they can be edited. Existing rows (admin edits) are never overwritten. */
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!await isAdminAuthorized(req)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  try {
    const rows = listBuiltInBanks().flatMap((b) => b.questions.map((q) => quizToDbRow(q, b.skillId)));
    const unique = [...new Map(rows.map((r) => [r.id, r])).values()];
    const added = await seedQuestions(unique);
    return NextResponse.json({ total: unique.length, added });
  } catch (err) {
    console.error('[POST /api/questions/seed]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
