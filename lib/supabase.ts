import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cliente público seguro para navegador y operaciones sujetas a RLS
export const supabasePublic = supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Cliente administrativo exclusivo de servidor (nunca expuesto al navegador)
function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('SEGURIDAD: supabaseAdmin no puede importarse en el navegador.');
  }
  if (!supabaseServiceKey) {
    throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY en el entorno del servidor.');
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export const supabaseAdmin = createAdminClient();
export const supabase = supabaseAdmin;