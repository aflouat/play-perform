import { NextRequest, NextResponse } from 'next/server';
import { fetchReleaseNotes, insertReleaseNote } from '@/lib/db';
import { STATIC_RELEASE_NOTES } from '@/lib/release-notes-static';
import type { DbReleaseNote } from '@/lib/db';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get('q') ?? undefined;
  const version = searchParams.get('version') ?? undefined;
  const from = searchParams.get('from') ?? undefined;
  const to = searchParams.get('to') ?? undefined;

  try {
    const dbNotes = await fetchReleaseNotes({ q, version, from, to });

    // Merge static notes if DB is empty or Supabase not configured
    const notes: DbReleaseNote[] = dbNotes.length > 0
      ? dbNotes
      : filterStatic({ q, version, from, to });

    return NextResponse.json({ notes });
  } catch {
    return NextResponse.json({ notes: filterStatic({ q, version, from, to }) });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Simple bearer token check using service role key
  const auth = req.headers.get('authorization') ?? '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!serviceKey || auth !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  try {
    const body = await req.json() as Partial<DbReleaseNote>;
    if (!body.version || !body.title || !Array.isArray(body.changes)) {
      return NextResponse.json({ error: 'version, title et changes sont requis.' }, { status: 400 });
    }
    await insertReleaseNote({
      version: body.version,
      title: body.title,
      summary: body.summary ?? null,
      changes: body.changes,
      tags: body.tags ?? [],
      deployed_by: body.deployed_by ?? null,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[releases] POST error', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

function filterStatic(filter: { q?: string; version?: string; from?: string; to?: string }) {
  return STATIC_RELEASE_NOTES.filter((n) => {
    if (filter.version && n.version !== filter.version) return false;
    if (filter.from && (n.deployed_at ?? '') < filter.from) return false;
    if (filter.to && (n.deployed_at ?? '') > `${filter.to}T23:59:59Z`) return false;
    if (filter.q) {
      const q = filter.q.toLowerCase();
      const text = `${n.title} ${n.summary ?? ''} ${n.changes.join(' ')}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });
}
