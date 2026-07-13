import { createClient } from '@supabase/supabase-js'
import { env } from '@/config/env.js'

/**
 * Cliente Supabase com a Service Role Key.
 * Usado APENAS no backend para operações administrativas
 * (bypassa RLS). Nunca expor esta chave ao frontend.
 */
export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
