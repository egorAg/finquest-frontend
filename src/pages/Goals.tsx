import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../store'
import { getGoals, updateGoal, createGoal } from '../api'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/layout/PageHeader'
import { fmt } from '../lib/utils'

export function Goals() {
  const qc = useQueryClient()
  const { activeSpaceId } = useAppStore()
  const [tab, setTab] = useState<'active' | 'archived'>('active')
  const [showAdd, setShowAdd] = useState(false)
  const [contribute, setContribute] = useState<{ id: string; name: string } | null>(null)
  const [contributeAmount, setContributeAmount] = useState('')

  // New goal form
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('🎯')
  const [newTarget, setNewTarget] = useState('')

  const { data: goals = [] } = useQuery({
    queryKey: ['goals', activeSpaceId],
    queryFn: () => getGoals(activeSpaceId ?? undefined),
    enabled: !!activeSpaceId,
  })

  const { mutate: doUpdate } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateGoal(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })

  const { mutate: doCreate, isPending } = useMutation({
    mutationFn: () => createGoal({ spaceId: activeSpaceId!, name: newName, emoji: newEmoji, targetAmount: parseFloat(newTarget) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['goals'] }); setShowAdd(false); setNewName(''); setNewTarget('') },
  })

  const filtered = goals.filter((g) => tab === 'active' ? !g.isCompleted : g.isCompleted)

  return (
    <div>
      <PageHeader
        title="Цели"
        right={
          <button onClick={() => setShowAdd(true)} className="text-green text-xl font-bold">+</button>
        }
      />
      <div className="px-[18px] space-y-[14px]">
        {/* Tabs */}
        <div className="flex bg-card2 rounded-2xl p-1 gap-1">
          {(['active', 'archived'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${tab === t ? 'bg-card text-text' : 'text-muted'}`}
            >
              {t === 'active' ? 'Активные' : 'Архивные'}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <Card className="text-center py-8 text-muted">
            <div className="text-3xl mb-2">{tab === 'active' ? '🎯' : '✅'}</div>
            <div className="text-sm">{tab === 'active' ? 'Нет активных целей' : 'Нет выполненных целей'}</div>
          </Card>
        ) : (
          filtered.map((goal) => {
            const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
            return (
              <Card key={goal.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{goal.emoji}</span>
                  <span className="font-bold flex-1">{goal.name}</span>
                  {goal.isCompleted && <span className="text-green text-sm">✓ Выполнена</span>}
                </div>
                <div className="h-2 bg-card2 rounded-full overflow-hidden mb-1">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: goal.color }} />
                </div>
                <div className="flex justify-between text-xs text-muted mb-3">
                  <span>{fmt(goal.currentAmount)}</span>
                  <span>{fmt(goal.targetAmount)}</span>
                </div>
                {!goal.isCompleted && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => { setContribute({ id: goal.id, name: goal.name }); setContributeAmount('') }}>
                      💙 Внести
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => doUpdate({ id: goal.id, data: { currentAmount: goal.targetAmount } })}>
                      ✓
                    </Button>
                  </div>
                )}
              </Card>
            )
          })
        )}
      </div>

      {/* Contribute bottom sheet */}
      {contribute && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setContribute(null)} />
          <div className="relative w-full bg-card rounded-t-3xl p-6 space-y-4">
            <h3 className="font-display font-bold text-lg">Внести в «{contribute.name}»</h3>
            <input
              type="number"
              placeholder="Сумма"
              value={contributeAmount}
              onChange={(e) => setContributeAmount(e.target.value)}
              className="w-full bg-card2 rounded-2xl px-4 py-3 text-xl font-bold outline-none border border-border"
              inputMode="decimal"
              autoFocus
            />
            <Button
              size="lg"
              disabled={!contributeAmount}
              onClick={() => {
                const goal = goals.find((g) => g.id === contribute.id)!
                doUpdate({ id: contribute.id, data: { currentAmount: goal.currentAmount + parseFloat(contributeAmount) } })
                setContribute(null)
              }}
            >
              Внести
            </Button>
          </div>
        </div>
      )}

      {/* Add goal bottom sheet */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAdd(false)} />
          <div className="relative w-full bg-card rounded-t-3xl p-6 space-y-4">
            <h3 className="font-display font-bold text-lg">Новая цель</h3>
            <div className="flex gap-2">
              <input value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)}
                className="w-14 bg-card2 rounded-2xl text-center text-2xl border border-border outline-none py-3" />
              <input placeholder="Название цели" value={newName} onChange={(e) => setNewName(e.target.value)}
                className="flex-1 bg-card2 rounded-2xl px-4 py-3 font-bold outline-none border border-border" />
            </div>
            <input type="number" placeholder="Целевая сумма" value={newTarget} onChange={(e) => setNewTarget(e.target.value)}
              className="w-full bg-card2 rounded-2xl px-4 py-3 font-bold outline-none border border-border"
              inputMode="decimal" />
            <Button size="lg" disabled={!newName || !newTarget || isPending} onClick={() => doCreate()}>
              {isPending ? 'Создание...' : 'Создать цель'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
