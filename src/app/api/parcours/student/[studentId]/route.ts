import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/db/client';

type Params = { params: Promise<{ studentId: string }> };

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const { studentId } = await params;
  try {
    const db = getServerClient();
    const { data } = await db
      .from('parcours_enrollments')
      .select('parcours(*)')
      .eq('student_id', studentId);
    const parcours = (data ?? []).map((row: { parcours: unknown }) => row.parcours).filter(Boolean);
    return NextResponse.json({ parcours });
  } catch {
    return NextResponse.json({ parcours: [] });
  }
}
