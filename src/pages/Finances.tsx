import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '../store'
import { getAnalyticsSummary } from '../api'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/layout/PageHeader'
import { fmt, currentMonth } from '../lib/utils'

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
      <div className="px-4 space-y-4">
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
