import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

export async function isAdminAuthorized(req: NextRequest): Promise<boolean> {
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '');
  if (!token) return false;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  // Script / CLI access via service role key
  if (serviceKey && token === serviceKey) return true;

  // Parent JWT: verify and check against allowed admin emails
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  if (adminEmails.length === 0 || !serviceKey) return false;

  try {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', serviceKey);
    const { data } = await db.auth.getUser(token);
    return !!data.user && adminEmails.includes(data.user.email ?? '');
  } catch { return false; }
}
