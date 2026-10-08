import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!_client) _client = createClient(url, key);
  return _client;
}

/** URL Supabase vue du serveur : SUPABASE_INTERNAL_URL (réseau Docker) sinon l'URL publique. */
export function getServerSupabaseUrl(): string {
  return process.env.SUPABASE_INTERNAL_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
}

export function getServerClient(): SupabaseClient {
  const url = getServerSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY (ou l’URL Supabase) est absent côté serveur : renseigne-le dans les variables d’environnement (Vercel → Settings → Environment Variables) puis redéploie.');
  }
  return createClient(url, key);
}

/** Client de lecture publique : navigateur, ou serveur (clé anon) pour les API routes. */
export function getReadClient(): SupabaseClient | null {
  const browser = getClient();
  if (browser) return browser;
  const url = getServerSupabaseUrl();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}
