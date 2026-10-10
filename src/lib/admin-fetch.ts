import { createClient } from '@supabase/supabase-js';

/** fetch() with the signed-in admin's Supabase token; redirects to /auth when there is no session. */
export async function adminFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');
  const { data } = await supabase.auth.getSession();
  if (!data.session) { window.location.href = '/auth'; return new Response(null, { status: 401 }); }
  const headers = new Headers(init.headers);
  headers.set('authorization', `Bearer ${data.session.access_token}`);
  return fetch(url, { ...init, headers });
}
