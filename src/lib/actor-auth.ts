import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { getServerSupabaseUrl } from '@/lib/db/client';

/** Supabase user id behind the Bearer token of the request, or null. */
export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '');
  if (!token) return null;
  try {
    const db = createClient(getServerSupabaseUrl(), process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
    const { data } = await db.auth.getUser(token);
    return data.user?.id ?? null;
  } catch { return null; }
}
