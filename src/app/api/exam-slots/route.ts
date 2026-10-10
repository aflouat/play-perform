import { NextRequest, NextResponse } from 'next/server';
import { getAccessContext } from '@/lib/access-context';
import { validateAvailability } from '@/modules/exams';
import { canOpenSlots, createSlots, listExaminerSlots } from '@/modules/exams/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });
const DAY_MS = 24 * 60 * 60 * 1000;

/** GET ?from=ISO&to=ISO → the caller's slots (examiner agenda), with who booked them. 14 days at most. */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  if (!ctx) return fail('Non autorisé', 403);
  const from = new Date(req.nextUrl.searchParams.get('from') ?? '');
  const to = new Date(req.nextUrl.searchParams.get('to') ?? '');
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from || to.getTime() - from.getTime() > 14 * DAY_MS) return fail('Période invalide.', 400);
  try {
    return NextResponse.json({ slots: await listExaminerSlots(ctx.userId, from.toISOString(), to.toISOString()) });
  } catch (err) {
    console.error('[GET /api/exam-slots]', err);
    return fail('Erreur serveur', 500);
  }
}

/** POST { organizationId, from, to, durationMin? } → opens the slots of a range (examiners of that centre). */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  if (!ctx) return fail('Non autorisé', 403);
  const validation = validateAvailability(await req.json().catch(() => null), new Date());
  if (!validation.ok) return fail(validation.error, 400);
  const { organizationId, durationMin, starts } = validation.value;
  try {
    if (!(await canOpenSlots(ctx.userId, organizationId))) return fail('Ton centre ne t’a pas (encore) confié les oraux.', 403);
    return NextResponse.json(await createSlots(ctx.userId, organizationId, durationMin, starts), { status: 201 });
  } catch (err) {
    console.error('[POST /api/exam-slots]', err);
    return fail('Erreur serveur', 500);
  }
}
