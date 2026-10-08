import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/db/client';
import { normalizeAccessCode } from '@/lib/access-code';
import { learnerSecret, signLearnerToken } from '@/lib/learner-token';
import { allowAttempt } from '@/lib/rate-limit';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** POST { code } → opens a learner session (token + public profile). */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!allowAttempt(`learner-login:${ip}`, 10, 15 * 60 * 1000)) return fail('Trop d’essais. Réessaie dans quelques minutes.', 429);

  const body = (await req.json().catch(() => null)) as { code?: unknown } | null;
  const code = typeof body?.code === 'string' ? normalizeAccessCode(body.code) : '';
  if (code.length !== 8) return fail('Code invalide : il comporte 8 caractères.', 400);

  try {
    const { data } = await getServerClient().from('students')
      .select('id, name, emoji, gradient, mode, learning_mode').eq('access_code', code).maybeSingle();
    if (!data) return fail('Code inconnu. Demande-le à ton enseignant.', 404);
    return NextResponse.json({ token: signLearnerToken(data.id as string, new Date(), learnerSecret()), student: data });
  } catch (err) {
    console.error('[POST /api/learner/login]', err);
    return fail('Erreur serveur', 500);
  }
}
