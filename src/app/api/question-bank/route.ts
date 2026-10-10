import { NextResponse } from 'next/server';
import { fetchPublishedQuestions } from '@/lib/db';
import { dbToBankQuestion } from '@/lib/question-bank-mapper';

/** Public: published questions (answers are already public in the app). The quiz screens layer them over the built-in banks. */
export async function GET(): Promise<NextResponse> {
  try {
    const rows = await fetchPublishedQuestions();
    return NextResponse.json({ questions: rows.map(dbToBankQuestion) }, { headers: { 'cache-control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  } catch (err) {
    console.error('[GET /api/question-bank]', err);
    return NextResponse.json({ questions: [] });
  }
}
