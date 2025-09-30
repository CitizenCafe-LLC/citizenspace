import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Supabase client singleton
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Get or create Supabase client
 * Uses singleton pattern to ensure only one client instance
 */
export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseClient;
}

/**
 * Execute a database query with error handling
 */
export async function executeQuery<T>(
  queryFn: (client: ReturnType<typeof getSupabaseClient>) => Promise<{ data: T | null; error: any }>
): Promise<{ data: T; error: null } | { data: null; error: string }> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await queryFn(client);

    if (error) {
      console.error('Database query error:', error);
      return { data: null, error: error.message || 'Database query failed' };
    }

    return { data: data as T, error: null };
  } catch (err) {
    console.error('Unexpected database error:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'An unexpected error occurred'
    };
  }
}