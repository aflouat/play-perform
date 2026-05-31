import { NextRequest, NextResponse } from 'next/server';
import { fetchAllQuestionsFromDb } from '@/lib/db';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const subject = req.nextUrl.searchParams.get('subject') ?? undefined;
  try {
    const questions = await fetchAllQuestionsFromDb(subject);
    return NextResponse.json({ questions });
  } catch (err) {
    console.error('[GET /api/questions]', err);
    return NextResponse.json({ questions: [] });
  }
}
