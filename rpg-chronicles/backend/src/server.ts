import { createServer } from 'http'
import { createApp } from '@/app.js'
import { createSocketServer } from '@/sockets/index.js'
import { env } from '@/config/env.js'

const app = createApp()
const httpServer = createServer(app)
createSocketServer(httpServer)

httpServer.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[RPG Chronicles] Backend rodando na porta ${env.port} (${env.nodeEnv})`)
})
