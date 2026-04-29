import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Supabase Connection', () => {
  it('should connect to Supabase with valid credentials', async () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(supabaseUrl).toBeDefined();
    expect(serviceRoleKey).toBeDefined();

    const supabase = createClient(supabaseUrl!, serviceRoleKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Test connection by checking if we can access the database
    const { data, error } = await supabase.from('users').select('count()', { count: 'exact', head: true });

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should have valid JWT tokens', () => {
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(anonKey).toBeDefined();
    expect(serviceRoleKey).toBeDefined();

    // JWT tokens should be valid base64
    const parts = anonKey!.split('.');
    expect(parts.length).toBe(3);

    const parts2 = serviceRoleKey!.split('.');
    expect(parts2.length).toBe(3);
  });
});
