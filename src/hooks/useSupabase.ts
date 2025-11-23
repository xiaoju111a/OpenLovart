import { useSession } from '@clerk/nextjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { Database } from '@/lib/supabase';

/**
 * Custom hook to create a Supabase client with Clerk authentication
 * This automatically handles session tokens and authentication
 */
export function useSupabase() {
  const { session } = useSession();
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient<Database> | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      setSupabaseClient(null);
      return;
    }

    if (!session) {
      setSupabaseClient(null);
      return;
    }

    // Get token immediately
    session.getToken({ template: 'supabase' }).then((token) => {
      if (!token) {
        console.error('Failed to get Supabase token from Clerk');
        setSupabaseClient(null);
        return;
      }

      // Create a Supabase client with the current token
      const client = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
          auth: {
            persistSession: false,
          },
        }
      );

      setSupabaseClient(client);
    });
  }, [session]);

  return supabaseClient;
}
