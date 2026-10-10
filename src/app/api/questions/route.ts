import { NextRequest, NextResponse } from 'next/server';
import { fetchAllQuestionsFromDb } from '@/lib/db';
import { isAdminAuthorized } from '@/lib/admin-auth';

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!await isAdminAuthorized(req)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const subject = req.nextUrl.searchParams.get('subject') ?? undefined;
  try {
    const questions = await fetchAllQuestionsFromDb(subject);
    return NextResponse.json({ questions });
  } catch (err) {
    console.error('[GET /api/questions]', err);
    return NextResponse.json({ questions: [] });
  }
}
