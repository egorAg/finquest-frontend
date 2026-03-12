import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getChallenges, joinChallenge } from '../api'
import { PageHeader } from '../components/layout/PageHeader'
import type { Challenge } from '../types'

type Tab = 'active' | 'all' | 'done'

function challengeLabel(type: Challenge['type']): string {
  switch (type) {
    case 'SPENDING_LIMIT': return 'Лимит трат'
    case 'MIN_SPENDING':   return 'Минимум трат'
    case 'CATEGORY_AVOID': return 'Избегай категории'
    case 'STREAK':         return 'Стрик'
    case 'GOAL_COMPLETE':  return 'Достигни цели'
  }
}

function progressLabel(ch: Challenge): string {
  if (ch.isFailed) return 'Провалено'
  if (ch.isCompleted) return 'Выполнено!'
  switch (ch.type) {
    case 'SPENDING_LIMIT':
      return `${ch.currentValue.toLocaleString('ru')} / ${ch.targetValue.toLocaleString('ru')} ₽`
    case 'MIN_SPENDING':
      return `${ch.currentValue.toLocaleString('ru')} / ${ch.targetValue.toLocaleString('ru')} ₽`
    case 'CATEGORY_AVOID':
      return `${ch.currentValue} / ${ch.targetValue} дн.`
    case 'STREAK':
      return `${ch.currentValue} / ${ch.targetValue} дн.`
    case 'GOAL_COMPLETE':
      return `${ch.currentValue} / ${ch.targetValue} целей`
  }
}

function pct(ch: Challenge): number {
  if (ch.targetValue === 0) return 0
  const raw = (ch.currentValue / ch.targetValue) * 100
  // For SPENDING_LIMIT invert — more spent = worse (bar fills red)
  return Math.min(raw, 100)
}

function barColor(ch: Challenge): string {
  if (ch.isFailed) return '#F87171'
  if (ch.isCompleted) return '#4ADE80'
  if (ch.type === 'SPENDING_LIMIT') {
    const p = pct(ch)
    if (p > 80) return '#F97316'
    return '#38BDF8'
  }
  return '#FACC15'
}

function daysLeft(deadline: string): number {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000))
}

export function Challenges() {
  const [tab, setTab] = useState<Tab>('active')
  const qc = useQueryClient()

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: getChallenges,
  })

  const { mutate: doJoin, isPending: joining } = useMutation({
    mutationFn: (id: string) => joinChallenge(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['challenges'] }),
  })

  const filtered = challenges.filter((ch) => {
    if (tab === 'active') return ch.joined && !ch.isCompleted && !ch.isFailed
    if (tab === 'done') return ch.isCompleted || ch.isFailed
    return true // all
  })

  const tabs: { key: Tab; label: string }[] = [
    { key: 'active', label: 'Активные' },
    { key: 'all', label: 'Все' },
    { key: 'done', label: 'Завершённые' },
  ]

  return (
    <div>
      <PageHeader title="Челленджи 🔥" back />

      {/* Tabs */}
      <div className="flex gap-2 px-4 pt-4 pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
              tab === t.key ? 'bg-yellow/20 text-yellow' : 'bg-card2 text-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3 pb-6">
        {isLoading && (
          <div className="text-center py-12 text-muted text-sm">Загрузка...</div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🏆</div>
            <div className="text-muted text-sm">
              {tab === 'active' ? 'Нет активных челленджей — вступи в любой!' : 'Пусто'}
            </div>
          </div>
        )}

        {filtered.map((ch) => {
          const p = pct(ch)
          const color = barColor(ch)
          const left = daysLeft(ch.deadline)

          return (
            <div
              key={ch.id}
              className="rounded-3xl border p-4"
              style={{ background: '#161B27', borderColor: 'rgba(255,255,255,.06)' }}
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl flex-shrink-0">{ch.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm leading-tight mb-0.5">{ch.title}</div>
                  <div className="text-xs text-muted">{challengeLabel(ch.type)}</div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="font-black text-yellow text-sm">+{ch.xpReward} XP</span>
                  <span className="text-xs text-muted">{left} дн.</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-muted mb-3 leading-relaxed">{ch.description}</p>

              {/* Progress */}
              {ch.joined && (
                <>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted">{progressLabel(ch)}</span>
                    <span className="font-bold" style={{ color }}>
                      {ch.isFailed ? '✗' : ch.isCompleted ? '✓' : `${Math.round(p)}%`}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,.07)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${p}%`, backgroundColor: color }}
                    />
                  </div>
                </>
              )}

              {/* Action */}
              {!ch.joined && (
                <button
                  type="button"
                  disabled={joining}
                  onClick={() => doJoin(ch.id)}
                  className="w-full py-2.5 rounded-2xl font-bold text-sm bg-yellow/20 text-yellow active:opacity-70 disabled:opacity-40"
                >
                  {joining ? '...' : 'Принять участие'}
                </button>
              )}

              {ch.joined && ch.isFailed && (
                <div className="text-center text-xs text-red/70 font-bold py-1">
                  Провалено — попробуй снова в следующий раз
                </div>
              )}

              {ch.joined && ch.isCompleted && (
                <div className="text-center text-xs font-bold py-1" style={{ color: '#4ADE80' }}>
                  Завершено!
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
