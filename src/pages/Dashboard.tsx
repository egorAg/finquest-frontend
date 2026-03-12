import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store'
import { getTransactions, getGoals, getSpaces } from '../api'
import { XpBar } from '../components/ui/XpBar'
import { currentMonth, fmtDateGroup } from '../lib/utils'
import { useFmt } from '../hooks/useFmt'

type Period = 'month' | 'year'


export function Dashboard() {
  const navigate = useNavigate()
  const { user, activeSpaceId, setActiveSpaceId, spaces, setSpaces } = useAppStore()
  const [period, setPeriod] = useState<Period>('month')
  const fmt = useFmt()

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

  const filtered = period === 'year'
    ? txs.filter((t) => t.date.startsWith(year))
    : txs

  const income = filtered.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const expense = filtered.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
  const balance = income - expense

  const periodLabel = period === 'month'
    ? new Date().toLocaleDateString('ru', { month: 'long' })
    : new Date().getFullYear().toString()

  const activeGoals = goals.filter((g) => !g.isCompleted)
  const recentTxs = [...txs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  if (!user) return null

  return (
    <div>
      {/* Topbar */}
      <div
        className="flex items-center justify-between sticky top-0 z-10 bg-bg"
        style={{ padding: '16px 22px 12px' }}
      >
        <div className="flex flex-col" style={{ gap: 2 }}>
          <span
            className="font-semibold font-sans"
            style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}
          >
            Добрый день,
          </span>
          <span className="font-black text-text" style={{ fontSize: 18 }}>
            {user.firstName} 👋
          </span>
        </div>
        <div className="flex items-center" style={{ gap: 10 }}>
          <button
            onClick={() => navigate('/notifications')}
            className="flex items-center justify-center"
            style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'rgba(255,255,255,.06)',
              fontSize: 17, border: 'none',
            }}
          >
            🔔
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center justify-center"
            style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'linear-gradient(135deg, #4ADE80, #15803D)',
              fontSize: 18, border: 'none',
            }}
          >
            {user.avatarEmoji}
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ padding: '12px 18px 16px' }}>

        {/* XP Card */}
        <XpBar
          xp={user.xp}
          xpToNext={user.xpToNext}
          level={user.level}
          streakDays={user.streakDays}
          className="mb-[14px]"
          onClick={() => navigate('/level-progress')}
        />

        {/* Balance Card */}
        <div
          className="rounded-3xl mb-[14px] border"
          style={{ padding: 20, background: '#161B27', borderColor: 'rgba(255,255,255,.06)' }}
        >
          {/* Top: space switcher + period pills */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/spaces')}
              className="flex items-center font-extrabold"
              style={{
                gap: 7, borderRadius: 12, padding: '6px 12px',
                fontSize: 13, background: 'rgba(255,255,255,.06)',
                color: '#F0F4FF', border: 'none',
              }}
            >
              <span>{activeSpace?.emoji ?? '👤'}</span>
              <span>{activeSpace?.name ?? 'Загрузка...'}</span>
              <span style={{ fontSize: 10, opacity: .5 }}>▾</span>
            </button>
            <div className="flex gap-1">
              {(['month', 'year'] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="font-bold font-sans"
                  style={{
                    borderRadius: 8, padding: '4px 10px', fontSize: 11,
                    background: period === p ? 'rgba(255,255,255,.1)' : 'transparent',
                    color: period === p ? '#F0F4FF' : 'rgba(255,255,255,.3)',
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  {p === 'month' ? 'Месяц' : 'Год'}
                </button>
              ))}
            </div>
          </div>

          {/* Balance amount */}
          <div
            className="font-black"
            style={{ fontSize: 38, letterSpacing: '-.5px', color: '#F0F4FF', marginBottom: 18 }}
          >
            {balance >= 0 ? '+' : ''}{fmt(balance)}
          </div>

          {/* Income / Expense cards */}
          <div className="flex gap-2.5">
            <div
              className="flex-1 flex items-center rounded-[14px]"
              style={{ gap: 10, padding: '12px 14px', background: 'rgba(255,255,255,.04)' }}
            >
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(74,222,128,.15)', fontSize: 15 }}
              >
                ↑
              </div>
              <div className="flex flex-col">
                <span
                  className="font-bold uppercase font-sans"
                  style={{ fontSize: 10, letterSpacing: '.06em', color: 'rgba(255,255,255,.3)' }}
                >
                  Доходы · {periodLabel}
                </span>
                <span className="font-black text-green" style={{ fontSize: 15 }}>{fmt(income)}</span>
              </div>
            </div>
            <div
              className="flex-1 flex items-center rounded-[14px]"
              style={{ gap: 10, padding: '12px 14px', background: 'rgba(255,255,255,.04)' }}
            >
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(249,115,22,.15)', fontSize: 15 }}
              >
                ↓
              </div>
              <div className="flex flex-col">
                <span
                  className="font-bold uppercase font-sans"
                  style={{ fontSize: 10, letterSpacing: '.06em', color: 'rgba(255,255,255,.3)' }}
                >
                  Расходы · {periodLabel}
                </span>
                <span className="font-black text-coral" style={{ fontSize: 15 }}>{fmt(expense)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active goals */}
        <div
          className="rounded-3xl mb-[14px] border"
          style={{ padding: '18px 18px 14px', background: '#161B27', borderColor: 'rgba(255,255,255,.06)' }}
        >
          <div className="flex items-center justify-between mb-[14px]">
            <span className="font-black text-text" style={{ fontSize: 15 }}>Цели 🎯</span>
            <button
              onClick={() => navigate('/goals')}
              className="font-bold font-sans"
              style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', background: 'none', border: 'none' }}
            >
              Все →
            </button>
          </div>
          {activeGoals.length === 0 ? (
            <div className="text-center py-4">
              <div style={{ fontSize: 30, marginBottom: 8 }}>🎯</div>
              <div className="font-sans" style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', marginBottom: 14 }}>
                Нет активных целей
              </div>
              <button
                onClick={() => navigate('/goals/create')}
                className="font-bold"
                style={{
                  fontSize: 13, padding: '8px 20px', borderRadius: 12,
                  background: 'rgba(74,222,128,.15)', color: '#4ADE80', border: 'none',
                }}
              >
                + Создать цель
              </button>
            </div>
          ) : (
            activeGoals.slice(0, 2).map((goal) => {
              const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
              return (
                <div
                  key={goal.id}
                  className="cursor-pointer mb-[14px] last:mb-0"
                  onClick={() => navigate('/goals')}
                >
                  <div className="flex items-center justify-between mb-[7px]">
                    <div className="flex items-center" style={{ gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{goal.emoji}</span>
                      <span className="font-extrabold text-text" style={{ fontSize: 13 }}>{goal.name}</span>
                    </div>
                    <span className="font-extrabold" style={{ fontSize: 12, color: goal.color }}>
                      {Math.round(pct)}%
                    </span>
                  </div>
                  <div
                    className="rounded-full overflow-hidden"
                    style={{ height: 8, background: 'rgba(255,255,255,.07)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: goal.color }}
                    />
                  </div>
                  <div className="font-sans mt-1" style={{ fontSize: 11, color: 'rgba(255,255,255,.28)' }}>
                    {fmt(goal.currentAmount)} из {fmt(goal.targetAmount)}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Recent transactions */}
        <div
          className="rounded-3xl mb-[14px] border"
          style={{ padding: '18px 18px 14px', background: '#161B27', borderColor: 'rgba(255,255,255,.06)' }}
        >
          <div className="flex items-center justify-between mb-[14px]">
            <span className="font-black text-text" style={{ fontSize: 15 }}>Операции</span>
            <button
              onClick={() => navigate('/transactions')}
              className="font-bold font-sans"
              style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', background: 'none', border: 'none' }}
            >
              Все →
            </button>
          </div>

          {recentTxs.length === 0 ? (
            <div
              className="text-center font-sans py-2.5"
              style={{ fontSize: 13, color: 'rgba(255,255,255,.25)' }}
            >
              📭 Нет операций за период
            </div>
          ) : (
            recentTxs.map((tx, i) => (
              <button
                key={tx.id}
                onClick={() => navigate(`/transactions/${tx.id}`)}
                className="flex items-center justify-between w-full text-left"
                style={{
                  padding: '10px 0',
                  borderTop: i > 0 ? '1px solid rgba(255,255,255,.05)' : 'none',
                }}
              >
                <div className="flex items-center" style={{ gap: 11 }}>
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,.06)', fontSize: 17 }}
                  >
                    {tx.categoryEmoji}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-text" style={{ fontSize: 13 }}>{tx.category}</span>
                    <span className="font-sans" style={{ fontSize: 11, color: 'rgba(255,255,255,.28)' }}>
                      {fmtDateGroup(tx.date)}
                    </span>
                  </div>
                </div>
                <span
                  className="font-black"
                  style={{ fontSize: 14, color: tx.type === 'INCOME' ? '#4ADE80' : '#F97316' }}
                >
                  {tx.type === 'INCOME' ? '+' : '−'}{fmt(tx.amount)}
                </span>
              </button>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
