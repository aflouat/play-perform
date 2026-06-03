import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { fetchEnrollmentsForParcours, enrollStudent, unenrollStudent } from '@/lib/db/parcours';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const { id } = await params;
  const enrollments = await fetchEnrollmentsForParcours(id);
  return NextResponse.json({ enrollments });
}

export async function POST(req: NextRequest, { params }: Params): Promise<NextResponse> {
  if (!(await isAdminAuthorized(req)))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const { id } = await params;
  const body = await req.json() as { studentId?: string };
  if (!body.studentId)
    return NextResponse.json({ error: 'studentId requis' }, { status: 400 });
  await enrollStudent(body.studentId, id);
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: Params): Promise<NextResponse> {
  if (!(await isAdminAuthorized(req)))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const { id } = await params;
  const body = await req.json() as { studentId?: string };
  if (!body.studentId)
    return NextResponse.json({ error: 'studentId requis' }, { status: 400 });
  await unenrollStudent(body.studentId, id);
  return NextResponse.json({ ok: true });
}
