import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'

export function Login() {
  const navigate = useNavigate()
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle)
  const signInAnonymously = useAuthStore((s) => s.signInAnonymously)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<'google' | 'anon' | null>(null)

  const handleGoogle = async () => {
    setError(null)
    setLoading('google')
    try {
      await signInWithGoogle()
    } catch {
      setError('Não foi possível iniciar o login com Google. Tente novamente.')
      setLoading(null)
    }
  }

  const handleAnon = async () => {
    setError(null)
    setLoading('anon')
    try {
      await signInAnonymously()
      navigate('/inicio')
    } catch {
      setError('Não foi possível entrar anonimamente. Tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="gothic-panel max-w-md w-full p-10"
      >
        <h1 className="text-4xl text-center text-gold gold-glow mb-2">RPG Chronicles</h1>
        <p className="text-center text-parchment/60 font-body mb-10">
          Entre nas sombras. Sua crônica aguarda.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleGoogle}
            disabled={loading !== null}
            className="w-full py-3 px-4 rounded-sm bg-parchment text-void font-semibold
                       hover:bg-bone transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'google' ? 'Redirecionando…' : 'Entrar com Google'}
          </button>

          <div className="flex items-center gap-3 text-graphite-light text-xs uppercase tracking-widest">
            <span className="flex-1 h-px bg-graphite-light/40" />
            ou
            <span className="flex-1 h-px bg-graphite-light/40" />
          </div>

          <button
            onClick={handleAnon}
            disabled={loading !== null}
            className="w-full py-3 px-4 rounded-sm border border-gold/40 text-gold
                       hover:bg-gold/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'anon' ? 'Entrando…' : 'Entrar anonimamente'}
          </button>
        </div>

        {error && <p className="mt-6 text-sm text-blood-bright text-center">{error}</p>}

        <p className="mt-10 text-center text-sm text-parchment/50">
          Ainda não tem uma crônica?{' '}
          <a href="/cadastro" className="text-gold underline underline-offset-4">
            Comece sua jornada
          </a>
        </p>
      </motion.div>
    </div>
  )
}
