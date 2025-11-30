import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStorePromise = Promise.resolve(cookies());

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const store = await cookieStorePromise;
          return store.get(name)?.value;
        },

        async set(name: string, value: string, options: CookieOptions) {
          const store = await cookieStorePromise;
          
          // 🛑 FIX: Wrap in try/catch to ignore errors in Server Components
          try {
            if (typeof store.set === "function") {
              store.set({
                name,
                value,
                ...options,
              });
            }
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },

        async remove(name: string, options: CookieOptions) {
          const store = await cookieStorePromise;

          // 🛑 FIX: Wrap in try/catch to ignore errors in Server Components
          try {
            if (typeof store.set === "function") {
              store.set({
                name,
                value: "",
                ...options,
                expires: new Date(0),
              });
            }
          } catch (error) {
            // The `remove` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// Admin client using service role key for privileged operations
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}