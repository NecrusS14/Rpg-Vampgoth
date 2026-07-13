import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { env } from '@/config/env.js'
import { healthRouter } from '@/routes/health.js'
import { meRouter } from '@/routes/me.js'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '1mb' }))

  // Rate limit global — proteção básica contra abuso/DoS.
  // Limites por rota (ex.: rolagem de dados, IA Mestre) serão refinados nas fases seguintes.
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  )

  app.use('/health', healthRouter)
  app.use('/me', meRouter)

  app.use((_req, res) => {
    res.status(404).json({ error: 'Rota não encontrada.' })
  })

  return app
}
