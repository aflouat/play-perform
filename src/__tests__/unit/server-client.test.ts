/** @jest-environment node */
import { getServerClient } from '@/lib/db/client';

describe('getServerClient', () => {
  const env = { ...process.env };
  afterEach(() => { process.env = { ...env }; });

  it('explains which setting is missing instead of "supabaseKey is required"', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(() => getServerClient()).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  it('builds a client when both settings are present', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
    expect(getServerClient()).toBeDefined();
  });
});
