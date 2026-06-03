import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { fetchAllParcours, insertParcours } from '@/lib/db/parcours';

export async function GET(): Promise<NextResponse> {
  try {
    const parcours = await fetchAllParcours();
    return NextResponse.json({ parcours });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!(await isAdminAuthorized(req)))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  try {
    const body = await req.json() as { name?: string; emoji?: string; description?: string; subjects?: string[]; questionsPerSubject?: number };
    if (!body.name || !body.subjects?.length)
      return NextResponse.json({ error: 'name et subjects requis' }, { status: 400 });
    const created = await insertParcours({
      name: body.name,
      emoji: body.emoji ?? '🎯',
      description: body.description,
      subjects: body.subjects,
      questions_per_subject: body.questionsPerSubject ?? 5,
    });
    return NextResponse.json({ parcours: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
