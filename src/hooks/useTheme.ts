import { useEffect } from 'react'
import { useAppStore } from '../store'

export function useTheme() {
  const { user } = useAppStore()
  const setting = user?.settings?.theme ?? 'dark'

  useEffect(() => {
    const apply = (theme: 'dark' | 'light') => {
      document.body.dataset.theme = theme
    }

    if (setting === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: light)')
      apply(mq.matches ? 'light' : 'dark')
      const handler = (e: MediaQueryListEvent) => apply(e.matches ? 'light' : 'dark')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    } else {
      apply(setting as 'dark' | 'light')
    }
  }, [setting])
}
