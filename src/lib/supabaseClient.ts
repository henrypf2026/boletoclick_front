import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton: evita múltiples instancias en el mismo contexto de browser (Next.js dev mode)
const globalAny = globalThis as typeof globalThis & { _supabase?: ReturnType<typeof createClient> };

export const supabase = globalAny._supabase ?? (globalAny._supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
  },
}));
