import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { fetchParcoursById, updateParcours, deleteParcours } from '@/lib/db/parcours';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const { id } = await params;
  const parcours = await fetchParcoursById(id);
  if (!parcours) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  return NextResponse.json({ parcours });
}

export async function PUT(req: NextRequest, { params }: Params): Promise<NextResponse> {
  if (!(await isAdminAuthorized(req)))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const { id } = await params;
  const body = await req.json() as Partial<{ name: string; emoji: string; description: string; subjects: string[]; questionsPerSubject: number }>;
  await updateParcours(id, {
    ...(body.name && { name: body.name }),
    ...(body.emoji && { emoji: body.emoji }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.subjects && { subjects: body.subjects }),
    ...(body.questionsPerSubject && { questions_per_subject: body.questionsPerSubject }),
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: Params): Promise<NextResponse> {
  if (!(await isAdminAuthorized(req)))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const { id } = await params;
  await deleteParcours(id);
  return NextResponse.json({ ok: true });
}
