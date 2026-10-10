import { NextRequest, NextResponse } from 'next/server';
import { parseAndValidateCsv } from '@/lib/csv-parser';
import { insertQuestions, fetchAllQuestionsFromDb } from '@/lib/db';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { ALL_QUESTIONS } from '@/lib/question-banks';

/** Every id already taken: built-in banks and everything stored (drafts included). */
async function buildExistingIds(): Promise<Set<string>> {
  const ids = new Set<string>();
  for (const questions of Object.values(ALL_QUESTIONS)) for (const q of questions) ids.add(q.id);
  for (const r of await fetchAllQuestionsFromDb()) ids.add(r.id);
  return ids;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!await isAdminAuthorized(req)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const contentType = req.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('csv');
      if (!file || typeof file === 'string') {
        return NextResponse.json({ error: 'Champ "csv" manquant.' }, { status: 400 });
      }
      const text = await (file as File).text();
      const existingIds = await buildExistingIds();
      const { valid, errors } = parseAndValidateCsv(text, existingIds);

      if (valid.length > 0) await insertQuestions(valid);
      return NextResponse.json({ imported: valid.length, errors });
    }

    if (contentType.includes('application/json')) {
      const body: unknown = await req.json();
      if (
        !body ||
        typeof body !== 'object' ||
        !Array.isArray((body as Record<string, unknown>).questions)
      ) {
        return NextResponse.json({ error: 'Body invalide : { questions: RawCsvRow[] } attendu.' }, { status: 400 });
      }
      // Re-use CSV parser by serialising rows back to CSV text
      const rows = (body as { questions: string[][] }).questions;
      const header = [
        'id','subject','category','difficulty','xpReward','emoji','imageUrl',
        'question','questionAssisted','optionA','optionB','optionC','optionD',
        'optionAAssisted','optionBAssisted','optionCAssisted','optionDAssisted',
        'correctOptionId','explanation','explanationAssisted',
      ].join(',');
      const csvText = [header, ...rows.map((r) => r.join(','))].join('\n');
      const existingIds = await buildExistingIds();
      const { valid, errors } = parseAndValidateCsv(csvText, existingIds);

      if (valid.length > 0) await insertQuestions(valid);
      return NextResponse.json({ imported: valid.length, errors });
    }

    return NextResponse.json({ error: 'Content-Type non supporté.' }, { status: 400 });
  } catch (err) {
    console.error('[import] erreur', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
