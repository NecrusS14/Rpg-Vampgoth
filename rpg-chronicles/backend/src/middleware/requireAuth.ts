import type { NextFunction, Request, Response } from 'express'
import { supabaseAdmin } from '@/lib/supabaseAdmin.js'

export interface AuthenticatedRequest extends Request {
  userId?: string
}

/**
 * Extrai o Bearer token do header Authorization e valida contra o Supabase Auth.
 * Em caso de sucesso, anexa `req.userId` para uso nas rotas subsequentes.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de autenticação ausente.' })
    return
  }

  const token = authHeader.slice('Bearer '.length)
  const { data, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !data.user) {
    res.status(401).json({ error: 'Token inválido ou expirado.' })
    return
  }

  req.userId = data.user.id
  next()
}
