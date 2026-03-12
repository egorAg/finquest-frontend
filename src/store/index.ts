import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Space } from '../types'

interface AppState {
  // Auth
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  setUser: (user: User) => void
  clearAuth: () => void

  // Active space
  activeSpaceId: string | null
  setActiveSpaceId: (id: string) => void

  // Spaces cache
  spaces: Space[]
  setSpaces: (spaces: Space[]) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        localStorage.setItem('fq_token', token)
        set({ token, user })
      },
      setUser: (user) => set({ user }),
      clearAuth: () => {
        localStorage.removeItem('fq_token')
        set({ token: null, user: null, activeSpaceId: null, spaces: [] })
      },

      activeSpaceId: null,
      setActiveSpaceId: (id) => set({ activeSpaceId: id }),

      spaces: [],
      setSpaces: (spaces) => set({ spaces }),
    }),
    {
      name: 'finquest-store',
      version: 2,
      partialize: (s) => ({
        token: s.token,
        user: s.user,
        activeSpaceId: s.activeSpaceId,
      }),
    },
  ),
)
