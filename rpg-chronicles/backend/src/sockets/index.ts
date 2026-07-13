import type { Server as HttpServer } from 'http'
import { Server, type Socket } from 'socket.io'
import { env } from '@/config/env.js'
import { supabaseAdmin } from '@/lib/supabaseAdmin.js'

interface AuthenticatedSocket extends Socket {
  userId?: string
}

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
      credentials: true,
    },
  })

  // Middleware de autenticação: todo cliente deve enviar o token Supabase
  // ao conectar (socket.io-client: io(url, { auth: { token } }))
  io.use(async (socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token as string | undefined

    if (!token) {
      next(new Error('Autenticação necessária.'))
      return
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !data.user) {
      next(new Error('Token inválido ou expirado.'))
      return
    }

    socket.userId = data.user.id
    next()
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    // eslint-disable-next-line no-console
    console.log(`[socket] conectado: ${socket.id} (user: ${socket.userId})`)

    // Fases futuras: entrar em salas de campanha, sincronizar chat,
    // combate, inventário, mapa, dados, NPCs e eventos.
    socket.on('room:join', (roomId: string) => {
      socket.join(roomId)
      io.to(roomId).emit('room:player-joined', { userId: socket.userId, roomId })
    })

    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.log(`[socket] desconectado: ${socket.id}`)
    })
  })

  return io
}
