import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

export async function isAdminAuthorized(req: NextRequest): Promise<boolean> {
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '');
  if (!token) return false;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  // Script / CLI access via service role key
  if (serviceKey && token === serviceKey) return true;

  // Parent JWT: verify email against ADMIN_EMAILS
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  if (adminEmails.length === 0) return false;

  // Use service key if available, otherwise fall back to anon key
  const apiKey = serviceKey || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');
  if (!apiKey || !url) return false;

  try {
    const db = createClient(url, apiKey);
    const { data } = await db.auth.getUser(token);
    return !!data.user && adminEmails.includes(data.user.email ?? '');
  } catch { return false; }
}
