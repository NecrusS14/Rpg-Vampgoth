import type { ReactNode } from 'react'

interface PageShellProps {
  title: string
  subtitle?: string
  children?: ReactNode
}

/**
 * Casca visual padrão para telas ainda não implementadas na Fase 0.
 * Cada tela real substituirá isso na fase correspondente do roadmap.
 */
export function PageShell({ title, subtitle, children }: PageShellProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="gothic-panel max-w-xl w-full p-10 text-center">
        <h1 className="text-3xl md:text-4xl text-gold gold-glow mb-3">{title}</h1>
        {subtitle && <p className="text-parchment/70 font-body text-lg mb-6">{subtitle}</p>}
        {children}
        <p className="mt-8 text-xs uppercase tracking-[0.2em] text-graphite-light">
          RPG Chronicles — Fase 0 · Placeholder
        </p>
      </div>
    </div>
  )
}
