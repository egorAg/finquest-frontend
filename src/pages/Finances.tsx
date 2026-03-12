import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '../store'
import { getAnalyticsSummary } from '../api'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/layout/PageHeader'
import { fmt, currentMonth } from '../lib/utils'

type DayData = { date: string; income: number; expense: number }

function DayChart({ days }: { days: DayData[] }) {
  if (!days || days.length === 0) return null
  const W = 320
  const H = 100
  const barW = Math.max(4, Math.floor((W - days.length * 2) / days.length / 2))
  const gap = 2
  const maxVal = Math.max(...days.flatMap((d) => [d.income, d.expense]), 1)
  const slotW = Math.floor(W / days.length)

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      {days.map((d, i) => {
        const x = i * slotW + slotW / 2
        const ih = Math.max(2, (d.income / maxVal) * (H - 8))
        const eh = Math.max(2, (d.expense / maxVal) * (H - 8))
        return (
          <g key={d.date}>
            <rect
              x={x - barW - gap / 2}
              y={H - ih}
              width={barW}
              height={ih}
              rx={2}
              fill="#4ADE80"
              fillOpacity={0.8}
            />
            <rect
              x={x + gap / 2}
              y={H - eh}
              width={barW}
              height={eh}
              rx={2}
              fill="#F97316"
              fillOpacity={0.8}
            />
          </g>
        )
      })}
    </svg>
  )
}

export function Finances() {
  const { activeSpaceId } = useAppStore()
  const [month, setMonth] = useState(currentMonth())

  const { data } = useQuery({
    queryKey: ['analytics', activeSpaceId, month],
    queryFn: () => getAnalyticsSummary(activeSpaceId!, month),
    enabled: !!activeSpaceId,
  })

  return (
    <div>
      <PageHeader title="Финансы" />
      <div className="px-[18px] pt-4 space-y-[14px]">
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
          <span className="font-bold">
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

        {data ? (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="text-center">
                <div className="text-xs text-muted mb-1">Доходы</div>
                <div className="font-bold text-green text-sm">{fmt(data.income)}</div>
              </Card>
              <Card className="text-center">
                <div className="text-xs text-muted mb-1">Расходы</div>
                <div className="font-bold text-red text-sm">{fmt(data.expense)}</div>
              </Card>
              <Card className="text-center">
                <div className="text-xs text-muted mb-1">Баланс</div>
                <div className={`font-bold text-sm ${data.balance >= 0 ? 'text-green' : 'text-red'}`}>
                  {fmt(data.balance)}
                </div>
              </Card>
            </div>

            {/* Daily chart */}
            {data.byDay && data.byDay.length > 0 && (
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm">По дням</h3>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-green/80" />Доходы</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-coral/80" />Расходы</span>
                  </div>
                </div>
                <DayChart days={data.byDay} />
              </Card>
            )}

            {/* By category */}
            {data.byCategory.length > 0 && (
              <Card>
                <h3 className="font-bold mb-3">По категориям</h3>
                <div className="space-y-3">
                  {data.byCategory.map((cat) => (
                    <div key={cat.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{cat.emoji} {cat.category}</span>
                        <span className="font-bold">{fmt(cat.amount)}</span>
                      </div>
                      <div className="h-1.5 bg-card2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-coral rounded-full"
                          style={{ width: `${cat.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        ) : (
          <Card className="text-center py-8 text-muted">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-sm">Нет данных за период</div>
          </Card>
        )}
      </div>
    </div>
  )
}
