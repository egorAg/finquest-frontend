import { useCallback } from 'react'
import { useAppStore } from '../store'
import { fmt, getCurrencySymbol } from '../lib/utils'

export function useFmt() {
  const currency = useAppStore((s) => s.user?.settings?.currency)
  const symbol = getCurrencySymbol(currency)
  return useCallback((amount: number) => fmt(amount, symbol), [symbol])
}
