import { createServerClient, createBrowserClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// For server components and API routes
export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    { cookies: cookieStore }
  );
}

// For client components (if needed)
export function getBrowserSupabase() {
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
}
