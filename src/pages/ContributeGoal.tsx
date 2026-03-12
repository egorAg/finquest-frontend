import { useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getGoals, getTransactions, createTransaction, updateGoal } from '../api'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { useFmt } from '../hooks/useFmt'
import type { Goal } from '../types'

export function ContributeGoal() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const qc = useQueryClient()
  const fmt = useFmt()

  const [amount, setAmount] = useState('')

  // Goal from router state or fetch
  const passedGoal = location.state?.goal as Goal | undefined

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => getGoals(),
    enabled: !passedGoal,
  })

  const goal = passedGoal ?? goals.find((g) => g.id === id)

  // Space balance
  const { data: txs = [] } = useQuery({
    queryKey: ['transactions', goal?.spaceId],
    queryFn: () => getTransactions({ spaceId: goal!.spaceId }),
    enabled: !!goal?.spaceId,
  })

  const income = txs.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const expense = txs.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
  const balance = income - expense

  const remaining = goal ? goal.targetAmount - goal.currentAmount : 0
  const parsedAmount = parseFloat(amount)

  const isValid = parsedAmount > 0 && parsedAmount <= balance && parsedAmount <= remaining

  const errorMsg = !amount ? null
    : parsedAmount <= 0 ? 'Введите сумму больше нуля'
    : parsedAmount > balance ? `Недостаточно средств (баланс: ${fmt(balance)})`
    : parsedAmount > remaining ? `Осталось накопить: ${fmt(remaining)}`
    : null

  const { mutate: doContribute, isPending } = useMutation({
    mutationFn: async () => {
      await createTransaction({
        spaceId: goal!.spaceId!,
        type: 'EXPENSE',
        amount: parsedAmount,
        category: 'Накопление на цель',
        categoryEmoji: goal!.emoji,
        date: new Date().toISOString().slice(0, 10),
        comment: goal!.name,
      })
      await updateGoal(goal!.id, { currentAmount: goal!.currentAmount + parsedAmount })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      navigate('/goals')
    },
  })

  if (!goal) {
    return (
      <div>
        <PageHeader title="Внести" back />
        <div className="flex items-center justify-center h-40 text-muted text-sm">Загрузка...</div>
      </div>
    )
  }

  const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)

  return (
    <div className="min-h-dvh flex flex-col">
      <PageHeader title="Внести в цель" back />

      <div className="flex-1 px-[18px] pt-4 pb-8 space-y-5">

        {/* Goal card */}
        <div
          className="rounded-2xl border p-4"
          style={{ background: '#161B27', borderColor: 'rgba(255,255,255,.06)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span style={{ fontSize: 28 }}>{goal.emoji}</span>
            <div>
              <div className="font-bold text-sm">{goal.name}</div>
              <div className="text-xs text-muted mt-0.5">
                {fmt(goal.currentAmount)} из {fmt(goal.targetAmount)}
              </div>
            </div>
          </div>
          <div className="rounded-full overflow-hidden" style={{ height: 6, background: 'rgba(255,255,255,.08)' }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: goal.color }} />
          </div>
          <div className="text-xs text-muted mt-1.5">Осталось: {fmt(remaining)}</div>
        </div>

        {/* Balance */}
        <div
          className="rounded-2xl border p-4 flex items-center justify-between"
          style={{ background: '#161B27', borderColor: 'rgba(255,255,255,.06)' }}
        >
          <span className="text-sm text-muted">Баланс пространства</span>
          <span className="font-bold text-green text-sm">{fmt(balance)}</span>
        </div>

        {/* Amount input */}
        <div>
          <div className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Сумма взноса</div>
          <input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            autoFocus
            className="w-full rounded-2xl px-4 py-4 font-black outline-none border"
            style={{
              background: '#161B27', fontSize: 28,
              borderColor: errorMsg ? '#F97316' : 'rgba(255,255,255,.06)',
            }}
          />
          {errorMsg && (
            <div className="text-xs mt-1.5" style={{ color: '#F97316' }}>{errorMsg}</div>
          )}
        </div>

        {/* Quick amounts */}
        <div className="flex gap-2">
          {[500, 1000, 5000].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(String(q))}
              className="flex-1 py-2 rounded-xl text-sm font-bold"
              style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.6)' }}
            >
              {q.toLocaleString('ru-RU')}
            </button>
          ))}
        </div>

      </div>

      <div className="px-[18px] pb-8">
        <Button size="lg" disabled={!isValid || isPending} onClick={() => doContribute()}>
          {isPending ? 'Сохранение...' : `Внести ${parsedAmount > 0 ? fmt(parsedAmount) : ''}`}
        </Button>
      </div>
    </div>
  )
}
