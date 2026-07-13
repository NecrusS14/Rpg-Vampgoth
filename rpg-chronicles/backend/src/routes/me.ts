import { Router } from 'express'
import { requireAuth, type AuthenticatedRequest } from '@/middleware/requireAuth.js'
import { supabaseAdmin } from '@/lib/supabaseAdmin.js'

export const meRouter = Router()

/**
 * Retorna o perfil do usuário autenticado.
 * Valida a integração completa: Frontend -> JWT -> Backend -> Supabase.
 */
meRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, display_name, avatar_url, created_at')
    .eq('id', req.userId)
    .maybeSingle()

  if (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil.' })
    return
  }

  res.json({ profile: data })
})
