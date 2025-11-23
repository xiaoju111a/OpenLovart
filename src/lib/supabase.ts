import { createClient } from '@supabase/supabase-js';
import { Session } from '@clerk/nextjs/server';

export interface Database {
  public: {
    Tables: {
      user_credits: {
        Row: {
          user_id: string;
          credits: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          credits?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          credits?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          thumbnail: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          title: string;
          thumbnail?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          thumbnail?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      canvas_elements: {
        Row: {
          id: string;
          project_id: string;
          element_data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          element_data: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          element_data?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

/**
 * Create a Supabase client with Clerk session token
 * This function is used on the client side
 */
export function createClerkSupabaseClient(session: Session | null) {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: async () => {
          const token = await session?.getToken({ template: 'supabase' });
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      },
    }
  );
}

/**
 * Create a Supabase client for server-side operations
 */
export function createServerSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
