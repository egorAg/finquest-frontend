import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store'
import { getTransactions, getGoals, getSpaces } from '../api'
import { Card } from '../components/ui/Card'
import { XpBar } from '../components/ui/XpBar'
import { fmt, currentMonth } from '../lib/utils'

type Period = 'month' | 'year'

export function Dashboard() {
  const navigate = useNavigate()
  const { user, activeSpaceId, setActiveSpaceId, spaces, setSpaces } = useAppStore()
  const [period, setPeriod] = useState<Period>('month')

  const month = currentMonth()
  const year = new Date().getFullYear().toString()

  const { data: spacesData } = useQuery({
    queryKey: ['spaces'],
    queryFn: getSpaces,
  })

  useEffect(() => {
    if (!spacesData) return
    setSpaces(spacesData)
    if (!activeSpaceId && spacesData.length > 0) setActiveSpaceId(spacesData[0].id)
  }, [spacesData])

  const activeSpace = (spacesData ?? spaces).find((s: { id: string }) => s.id === activeSpaceId)

  const { data: txs = [] } = useQuery({
    queryKey: ['transactions', activeSpaceId, period],
    queryFn: () => getTransactions({
      spaceId: activeSpaceId ?? undefined,
      month: period === 'month' ? month : undefined,
    }),
    enabled: !!activeSpaceId,
  })

  const { data: goals = [] } = useQuery({
    queryKey: ['goals', activeSpaceId],
    queryFn: () => getGoals(activeSpaceId ?? undefined),
    enabled: !!activeSpaceId,
  })

  // Filter by period
  const filtered = period === 'year'
    ? txs.filter((t) => t.date.startsWith(year))
    : txs

  const income = filtered.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const expense = filtered.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
  const balance = income - expense

  const activeGoals = goals.filter((g) => !g.isCompleted)
  const recentTxs = [...txs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  if (!user) return null

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        {/* Space switcher */}
        <button
          onClick={() => navigate('/spaces')}
          className="flex items-center gap-2 bg-card2 rounded-xl px-3 py-2 text-sm font-bold"
        >
          <span>{activeSpace?.emoji ?? '👤'}</span>
          <span>{activeSpace?.name ?? 'Загрузка...'}</span>
          <span className="text-muted">▾</span>
        </button>

        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/notifications')} className="text-2xl relative">
            🔔
          </button>
          <button onClick={() => navigate('/profile')}>
            <div className="w-9 h-9 rounded-full bg-green/20 flex items-center justify-center text-lg">
              {user.avatarEmoji}
            </div>
          </button>
        </div>
      </div>

      {/* Balance card */}
      <Card className="bg-gradient-to-br from-green/20 to-blue/10 border-green/20">
        {/* Period pills */}
        <div className="flex gap-2 mb-4">
          {(['month', 'year'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                period === p ? 'bg-white/10 text-text' : 'text-muted'
              }`}
            >
              {p === 'month' ? 'Месяц' : 'Год'}
            </button>
          ))}
        </div>

        <div className="text-4xl font-display font-black mb-1">
          {balance >= 0 ? '+' : ''}{fmt(balance)}
        </div>
        <div className="flex gap-4 text-sm text-muted mb-4">
          <span className="text-green">↑ {fmt(income)}</span>
          <span className="text-red">↓ {fmt(expense)}</span>
        </div>

        <XpBar xp={user.xp} xpToNext={user.xpToNext} level={user.level} />
      </Card>

      {/* Active goals */}
      {activeGoals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-bold">Цели</h2>
            <button onClick={() => navigate('/goals')} className="text-xs text-muted">Все →</button>
          </div>
          <div className="space-y-2">
            {activeGoals.slice(0, 2).map((goal) => {
              const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
              return (
                <Card key={goal.id} className="cursor-pointer" onClick={() => navigate(`/goals/${goal.id}`)}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{goal.emoji}</span>
                      <span className="font-bold text-sm">{goal.name}</span>
                    </div>
                    <span className="text-xs text-muted">{Math.round(pct)}%</span>
                  </div>
                  <div className="h-1.5 bg-card2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: goal.color }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted mt-1">
                    <span>{fmt(goal.currentAmount)}</span>
                    <span>{fmt(goal.targetAmount)}</span>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display font-bold">Операции</h2>
          <button onClick={() => navigate('/transactions')} className="text-xs text-muted">Все →</button>
        </div>
        {recentTxs.length === 0 ? (
          <Card className="text-center py-6 text-muted">
            <div className="text-3xl mb-2">📭</div>
            <div className="text-sm">Нет операций за период</div>
          </Card>
        ) : (
          <Card className="divide-y divide-border p-0 overflow-hidden">
            {recentTxs.map((tx) => (
              <button
                key={tx.id}
                onClick={() => navigate(`/transactions/${tx.id}`)}
                className="flex items-center justify-between w-full px-4 py-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tx.categoryEmoji}</span>
                  <div>
                    <div className="font-bold text-sm">{tx.category}</div>
                    {tx.comment && <div className="text-xs text-muted">{tx.comment}</div>}
                  </div>
                </div>
                <span className={`font-bold text-sm ${tx.type === 'INCOME' ? 'text-green' : 'text-text'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}{fmt(tx.amount)}
                </span>
              </button>
            ))}
          </Card>
        )}
      </div>

      <div className="h-4" />
    </div>
  )
}
