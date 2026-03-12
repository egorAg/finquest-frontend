import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '../store'
import { getAnalyticsSummary } from '../api'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/layout/PageHeader'
import { currentMonth, cn } from '../lib/utils'
import { useFmt } from '../hooks/useFmt'

type DayData = { date: string; income: number; expense: number }

function DayChart({ days }: { days: DayData[] }) {
  const [selected, setSelected] = useState<number | null>(null)
  const fmt = useFmt()
  if (!days || days.length === 0) return null

  const maxVal = Math.max(...days.flatMap((d) => [d.income, d.expense]), 1)
  const barH = 90
  const labelH = 18
  const tooltipH = 28

  const sel = selected !== null ? days[selected] : null

  return (
    <div>
      {/* Tooltip */}
      <div className={`flex items-center justify-center gap-3 text-xs mb-2 transition-opacity ${sel ? 'opacity-100' : 'opacity-0'}`} style={{ minHeight: tooltipH }}>
        {sel && (
          <>
            <span className="text-muted">{new Date(sel.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
            {sel.income > 0 && <span className="text-green font-semibold">+{fmt(sel.income)}</span>}
            {sel.expense > 0 && <span className="text-coral font-semibold">−{fmt(sel.expense)}</span>}
            {sel.income === 0 && sel.expense === 0 && <span className="text-muted">Нет операций</span>}
          </>
        )}
      </div>

      {/* Bars */}
      <div className="flex items-end gap-[2px]" style={{ height: barH }}>
        {days.map((d, i) => {
          const ih = d.income > 0 ? Math.max(4, (d.income / maxVal) * (barH - 4)) : 0
          const eh = d.expense > 0 ? Math.max(4, (d.expense / maxVal) * (barH - 4)) : 0
          const isActive = selected === i
          return (
            <div
              key={d.date}
              className="flex-1 flex items-end justify-center gap-[1px] cursor-pointer"
              style={{ height: '100%' }}
              onClick={() => setSelected(isActive ? null : i)}
            >
              {ih > 0 && (
                <div
                  className="rounded-sm transition-opacity"
                  style={{
                    width: '40%',
                    height: ih,
                    backgroundColor: '#4ADE80',
                    opacity: isActive ? 1 : 0.7,
                  }}
                />
              )}
              {eh > 0 && (
                <div
                  className="rounded-sm transition-opacity"
                  style={{
                    width: '40%',
                    height: eh,
                    backgroundColor: '#F97316',
                    opacity: isActive ? 1 : 0.7,
                  }}
                />
              )}
              {ih === 0 && eh === 0 && (
                <div
                  className="rounded-sm"
                  style={{ width: '60%', height: 2, backgroundColor: 'rgba(255,255,255,0.1)' }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Day labels */}
      <div className="flex gap-[2px]" style={{ height: labelH }}>
        {days.map((d, i) => {
          const day = new Date(d.date).getDate()
          const show = days.length <= 15 || day === 1 || day % 5 === 0 || i === days.length - 1
          return (
            <div
              key={d.date}
              className={`flex-1 text-center text-[9px] pt-1 ${selected === i ? 'text-white font-bold' : 'text-muted'}`}
            >
              {show ? day : ''}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Finances() {
  const { activeSpaceId, spaces } = useAppStore()
  const [month, setMonth] = useState(currentMonth())
  const fmt = useFmt()

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

            {/* Insight cards */}
            <InsightCards data={data} fmt={fmt} spaces={spaces} activeSpaceId={activeSpaceId} />

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

function InsightCards({ data, fmt, spaces, activeSpaceId }: {
  data: import('../types').AnalyticsSummary
  fmt: (n: number) => string
  spaces: import('../types').Space[]
  activeSpaceId: string | null
}) {
  const isCurrentMonth = data.daysElapsed < data.daysInMonth
  const remainingDays = data.daysInMonth - data.daysElapsed

  // Forecast
  const avgDailyExpense = data.daysElapsed > 0 ? data.expense / data.daysElapsed : 0
  const forecastedExpense = data.expense + avgDailyExpense * remainingDays

  // Comparison
  const incomeChange = data.prevMonth.income > 0
    ? ((data.income - data.prevMonth.income) / data.prevMonth.income) * 100
    : data.income > 0 ? 100 : 0
  const expenseChange = data.prevMonth.expense > 0
    ? ((data.expense - data.prevMonth.expense) / data.prevMonth.expense) * 100
    : data.expense > 0 ? 100 : 0

  // "Will money last?"
  const projectedBalance = data.balance - avgDailyExpense * remainingDays
  const activeSpace = spaces.find((s) => s.id === activeSpaceId)
  const budget = activeSpace?.monthlyBudget

  let status: 'green' | 'yellow' | 'red' = 'green'
  if (budget && budget > 0) {
    const usage = (forecastedExpense / budget) * 100
    if (usage > 110) status = 'red'
    else if (usage > 90) status = 'yellow'
  } else {
    if (projectedBalance < -avgDailyExpense * 3) status = 'red'
    else if (projectedBalance < 0) status = 'yellow'
  }

  const statusColors = {
    green: { text: 'text-green', bg: 'bg-green', border: 'border-green/30' },
    yellow: { text: 'text-yellow-400', bg: 'bg-yellow-400', border: 'border-yellow-400/30' },
    red: { text: 'text-red', bg: 'bg-red', border: 'border-red/30' },
  }
  const sc = statusColors[status]

  return (
    <>
      {/* Forecast */}
      {isCurrentMonth && data.daysElapsed > 0 && (
        <Card>
          <div className="text-xs text-muted mb-1">🔮 Прогноз расходов</div>
          <div className="font-bold text-lg">{fmt(forecastedExpense)}</div>
          <div className="text-xs text-muted mt-1">
            ~{fmt(avgDailyExpense)}/день · осталось {remainingDays} дн.
          </div>
        </Card>
      )}

      {/* Comparison */}
      {(data.prevMonth.income > 0 || data.prevMonth.expense > 0) && (
        <Card>
          <div className="text-xs text-muted mb-2">📊 Сравнение с прошлым месяцем</div>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="text-xs text-muted mb-1">Доходы</div>
              <div className={cn('font-bold text-sm', incomeChange >= 0 ? 'text-green' : 'text-red')}>
                {incomeChange >= 0 ? '↑' : '↓'} {Math.abs(Math.round(incomeChange))}%
              </div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted mb-1">Расходы</div>
              <div className={cn('font-bold text-sm', expenseChange <= 0 ? 'text-green' : 'text-red')}>
                {expenseChange >= 0 ? '↑' : '↓'} {Math.abs(Math.round(expenseChange))}%
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Will money last? */}
      {isCurrentMonth && data.daysElapsed > 0 && (
        <Card className={sc.border}>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('w-2.5 h-2.5 rounded-full', sc.bg)} />
            <span className="text-xs text-muted">Хватит ли денег?</span>
          </div>
          <div className={cn('font-bold text-lg', sc.text)}>
            {fmt(projectedBalance)}
          </div>
          <div className="text-xs text-muted mt-1">
            прогноз баланса на конец месяца
          </div>
          {budget && budget > 0 && (
            <div className="text-xs text-muted mt-1">
              Бюджет: {fmt(budget)} · расход: ~{Math.round((forecastedExpense / budget) * 100)}%
            </div>
          )}
        </Card>
      )}
    </>
  )
}
