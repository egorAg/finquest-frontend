import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store'
import { getTransactions, deleteTransaction } from '../api'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/layout/PageHeader'
import { fmt, fmtDateGroup, fmtDateTime, currentMonth } from '../lib/utils'
import type { Transaction } from '../types'

type Filter = 'ALL' | 'EXPENSE' | 'INCOME'

// ─── Transaction list ─────────────────────────────────────────────────────────

export function Transactions() {
  const navigate = useNavigate()
  const { activeSpaceId } = useAppStore()
  const [filter, setFilter] = useState<Filter>('ALL')
  const [month, setMonth] = useState(currentMonth())

  const { data: txs = [] } = useQuery({
    queryKey: ['transactions', activeSpaceId, month],
    queryFn: () => getTransactions({ spaceId: activeSpaceId ?? undefined, month }),
    enabled: !!activeSpaceId,
  })

  const filtered = filter === 'ALL' ? txs : txs.filter((t) => t.type === filter)
  const sorted = [...filtered].sort((a, b) =>
    b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  )

  // Group by date
  const groups: { label: string; date: string; items: Transaction[] }[] = []
  for (const tx of sorted) {
    const dateKey = tx.date.slice(0, 10)
    const last = groups.at(-1)
    if (last?.date === dateKey) {
      last.items.push(tx)
    } else {
      groups.push({ label: fmtDateGroup(dateKey), date: dateKey, items: [tx] })
    }
  }

  return (
    <div>
      <PageHeader title="Операции" back />
      <div className="px-4 space-y-3">
        {/* Month picker */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              const d = new Date(month + '-01')
              d.setMonth(d.getMonth() - 1)
              setMonth(d.toISOString().slice(0, 7))
            }}
            className="w-9 h-9 bg-card2 rounded-xl flex items-center justify-center"
          >‹</button>
          <span className="font-bold text-sm">
            {new Date(month + '-01').toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => {
              const d = new Date(month + '-01')
              d.setMonth(d.getMonth() + 1)
              setMonth(d.toISOString().slice(0, 7))
            }}
            className="w-9 h-9 bg-card2 rounded-xl flex items-center justify-center"
          >›</button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2">
          {(['ALL', 'EXPENSE', 'INCOME'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === f ? 'bg-green/20 text-green border border-green/30' : 'bg-card2 text-muted'
              }`}
            >
              {f === 'ALL' ? 'Все' : f === 'EXPENSE' ? 'Расходы' : 'Доходы'}
            </button>
          ))}
        </div>

        {/* Grouped list */}
        {groups.length === 0 ? (
          <Card className="text-center py-8 text-muted">
            <div className="text-3xl mb-2">📭</div>
            <div className="text-sm">Нет операций за период</div>
          </Card>
        ) : (
          groups.map((group) => {
            const dayIncome = group.items.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
            const dayExpense = group.items.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
            return (
              <div key={group.date}>
                <div className="flex items-center justify-between px-1 mb-1">
                  <span className="text-xs font-bold text-muted">{group.label}</span>
                  <div className="flex gap-2 text-xs">
                    {dayIncome > 0 && <span className="text-green">+{fmt(dayIncome)}</span>}
                    {dayExpense > 0 && <span className="text-red">-{fmt(dayExpense)}</span>}
                  </div>
                </div>
                <Card className="p-0 overflow-hidden">
                  {group.items.map((tx, i) => (
                    <button
                      key={tx.id}
                      onClick={() => navigate(`/transactions/${tx.id}`)}
                      className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors active:bg-card2 ${
                        i < group.items.length - 1 ? 'border-b border-border' : ''
                      }`}
                    >
                      <span className="text-2xl shrink-0">{tx.categoryEmoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm">{tx.category}</div>
                        {tx.comment && <div className="text-xs text-muted truncate">{tx.comment}</div>}
                      </div>
                      <span className={`font-bold text-sm shrink-0 ${tx.type === 'INCOME' ? 'text-green' : 'text-text'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{fmt(tx.amount)}
                      </span>
                    </button>
                  ))}
                </Card>
              </div>
            )
          })
        )}
        <div className="h-4" />
      </div>
    </div>
  )
}

// ─── Transaction detail ───────────────────────────────────────────────────────

export function TransactionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { activeSpaceId } = useAppStore()
  const [showConfirm, setShowConfirm] = useState(false)

  const { data: txs = [] } = useQuery({
    queryKey: ['transactions', activeSpaceId],
    queryFn: () => getTransactions({ spaceId: activeSpaceId ?? undefined }),
    enabled: !!activeSpaceId,
  })

  const tx = txs.find((t) => t.id === id)

  const { mutate: doDelete, isPending } = useMutation({
    mutationFn: () => deleteTransaction(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      navigate(-1)
    },
  })

  if (!tx) {
    return (
      <div>
        <PageHeader title="Операция" back />
        <div className="px-4 pt-8 text-center text-muted">Загрузка...</div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Операция" back />
      <div className="px-4 space-y-4">
        {/* Main card */}
        <Card className="text-center py-6">
          <div className="text-5xl mb-2">{tx.categoryEmoji}</div>
          <div className={`text-3xl font-display font-black mb-1 ${tx.type === 'INCOME' ? 'text-green' : 'text-coral'}`}>
            {tx.type === 'INCOME' ? '+' : '-'}{fmt(tx.amount)}
          </div>
          <div className="text-muted text-sm">{tx.category}</div>
        </Card>

        {/* Details */}
        <Card className="space-y-3 divide-y divide-border">
          <Row label="Тип" value={tx.type === 'INCOME' ? '📥 Доход' : '📤 Расход'} />
          <Row label="Дата операции" value={new Date(tx.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} />
          <Row label="Записано" value={fmtDateTime(tx.createdAt)} />
          {tx.comment && <Row label="Комментарий" value={tx.comment} />}
          <Row label="XP заработано" value={`+${tx.xpEarned} XP`} />
        </Card>

        {/* Delete */}
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full py-3 rounded-2xl border border-red/30 text-red font-bold text-sm"
        >
          🗑 Удалить операцию
        </button>

        <div className="h-4" />
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirm(false)} />
          <div className="relative w-full bg-card rounded-t-3xl p-6 space-y-4">
            <h3 className="font-display font-bold text-lg">Удалить операцию?</h3>
            <p className="text-sm text-muted">Это действие нельзя отменить.</p>
            <button
              onClick={() => doDelete()}
              disabled={isPending}
              className="w-full py-3 rounded-2xl bg-red/20 text-red font-bold"
            >
              {isPending ? 'Удаление...' : 'Удалить'}
            </button>
            <button onClick={() => setShowConfirm(false)} className="w-full py-3 text-muted text-sm">
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center pt-3 first:pt-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-bold text-right">{value}</span>
    </div>
  )
}
