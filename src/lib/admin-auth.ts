import type { NextRequest } from 'next/server';
import { getAccessContext } from '@/lib/access-context';

/**
 * Super admin only (the parent company): ADMIN_EMAILS, the platform_admins table, or the service role key (scripts).
 * Centre-level permissions (recruit, decide, correct) live in modules/organizations.
 */
export async function isAdminAuthorized(req: NextRequest): Promise<boolean> {
  return (await getAccessContext(req))?.isSuperAdmin === true;
}
