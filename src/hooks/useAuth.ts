import { useEffect, useState } from 'react'
import { useAppStore } from '../store'
import { authTelegram, getMe } from '../api'

export function useAuth() {
  const { token, user, setAuth, setUser } = useAppStore()
  const [loading, setLoading] = useState(!user)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) { setLoading(false); return }

    const tg = (window as any).Telegram?.WebApp
    const initData = tg?.initData

    async function authenticate() {
      try {
        if (initData) {
          // Real Telegram environment
          tg.ready()
          tg.expand()
          const res = await authTelegram(initData)
          setAuth(res.token, res.user)
        } else if (token) {
          // Already logged in — just refresh user
          const me = await getMe()
          setUser(me)
        } else {
          setError('Открой через Telegram')
        }
      } catch (e: any) {
        setError(e?.response?.data?.message ?? 'Ошибка авторизации')
      } finally {
        setLoading(false)
      }
    }

    authenticate()
  }, [])

  return { user, token, loading, error }
}
