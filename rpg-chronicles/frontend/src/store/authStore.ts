import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

interface AuthState {
  session: Session | null
  user: User | null
  status: 'idle' | 'loading' | 'ready'
  initialize: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInAnonymously: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  status: 'idle',

  initialize: async () => {
    set({ status: 'loading' })

    const { data } = await supabase.auth.getSession()
    set({ session: data.session, user: data.session?.user ?? null, status: 'ready' })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
    })
  },

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/inicio` },
    })
  },

  signInAnonymously: async () => {
    const { data, error } = await supabase.auth.signInAnonymously()
    if (!error) {
      set({ session: data.session, user: data.user })
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null })
  },
}))
