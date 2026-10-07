/** @jest-environment node */
import { getReadClient } from '@/lib/db/client';

describe('getReadClient (server side)', () => {
  const env = { ...process.env };
  afterEach(() => { process.env = { ...env }; });

  it('builds an anon client on the server so /api/releases can read the database', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
    expect(getReadClient()).not.toBeNull();
  });

  it('returns null when Supabase is not configured', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_INTERNAL_URL;
    expect(getReadClient()).toBeNull();
  });
});
