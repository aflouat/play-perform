import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { dispatchDueReminders } from '@/lib/push/dispatch';
import { pushConfigured } from '@/lib/push/send';

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from((req.headers.get('authorization') ?? '').replace('Bearer ', ''));
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** GET (every few minutes, by a scheduler) → pushes the reminders that are due. Header: Authorization: Bearer $CRON_SECRET. */
export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!authorized(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  if (!pushConfigured()) return NextResponse.json({ error: 'Clés VAPID absentes' }, { status: 503 });
  try {
    return NextResponse.json(await dispatchDueReminders());
  } catch (err) {
    console.error('[GET /api/push/dispatch]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
