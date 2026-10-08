import { NextRequest, NextResponse } from 'next/server';
import { getAccessContext } from '@/lib/access-context';

/** GET → which server settings are present (booleans only, never values). Super admin only. */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  if (!ctx?.isSuperAdmin) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const present = (name: string) => Boolean(process.env[name]);
  return NextResponse.json({
    supabaseUrl: present('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: present('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: present('SUPABASE_SERVICE_ROLE_KEY'),
    learnerTokenSecret: present('LEARNER_TOKEN_SECRET') || present('SUPABASE_SERVICE_ROLE_KEY'),
    adminEmails: present('ADMIN_EMAILS'),
    siteUrl: present('NEXT_PUBLIC_SITE_URL'),
    vapidPublicKey: present('NEXT_PUBLIC_VAPID_PUBLIC_KEY'),
    vapidPrivateKey: present('VAPID_PRIVATE_KEY'),
    cronSecret: present('CRON_SECRET'),
  });
}
