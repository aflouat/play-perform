import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAdminAuthorized } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const isAdmin = await isAdminAuthorized(req);
  return NextResponse.json({ isAdmin });
}
