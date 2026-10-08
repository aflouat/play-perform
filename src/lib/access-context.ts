import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { getServerClient, getServerSupabaseUrl } from '@/lib/db/client';
import type { AccessContext, Membership, OrgRole } from '@/modules/organizations';

const adminEmails = () => (process.env.ADMIN_EMAILS ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

/**
 * Who is calling and what they may do. Super admins: `ADMIN_EMAILS` (bootstrap), the `platform_admins` table,
 * or the service role key (scripts). Members: rows of `memberships`. Learner tokens give no context.
 */
export async function getAccessContext(req: NextRequest): Promise<AccessContext | null> {
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '');
  if (!token || token.startsWith('pp1.')) return null;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (serviceKey && token === serviceKey) return { userId: 'service-role', email: 'service-role', isSuperAdmin: true, memberships: [] };
  try {
    const auth = createClient(getServerSupabaseUrl(), serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
    const { data } = await auth.auth.getUser(token);
    const user = data.user;
    if (!user) return null;
    const email = (user.email ?? '').toLowerCase();
    const db = getServerClient();
    const [{ data: rows }, { data: platform }] = await Promise.all([
      db.from('memberships').select('organization_id, role').eq('user_id', user.id),
      db.from('platform_admins').select('user_id').eq('user_id', user.id).maybeSingle(),
    ]);
    const memberships: Membership[] = ((rows ?? []) as { organization_id: string; role: OrgRole }[]).map((r) => ({ organizationId: r.organization_id, role: r.role }));
    return { userId: user.id, email, isSuperAdmin: adminEmails().includes(email) || platform !== null, memberships };
  } catch { return null; }
}
