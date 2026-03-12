import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '../store'
import { getLeaderboard } from '../api'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/layout/PageHeader'
import { currentMonth } from '../lib/utils'

export function Leaderboard() {
  const { user } = useAppStore()
  const [season, setSeason] = useState(currentMonth())

  const { data: entries = [] } = useQuery({
    queryKey: ['leaderboard', season],
    queryFn: () => getLeaderboard({ season, limit: 50 }),
  })

  const myEntry = entries.find((e) => e.user.id === user?.id)

  return (
    <div>
      <PageHeader title="Рейтинг" back />
      <div className="px-[18px] pt-4 space-y-[14px]">
        {/* Season picker */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              const d = new Date(season + '-01')
              d.setMonth(d.getMonth() - 1)
              setSeason(d.toISOString().slice(0, 7))
            }}
            className="w-9 h-9 bg-card2 rounded-xl flex items-center justify-center"
          >‹</button>
          <span className="font-bold text-sm">
            {new Date(season + '-01').toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => {
              const d = new Date(season + '-01')
              d.setMonth(d.getMonth() + 1)
              setSeason(d.toISOString().slice(0, 7))
            }}
            className="w-9 h-9 bg-card2 rounded-xl flex items-center justify-center"
          >›</button>
        </div>

        {/* My position */}
        {myEntry && (
          <Card className="flex items-center gap-3 border-green/30 bg-green/5">
            <span className="text-lg font-bold w-6 text-center text-green">#{myEntry.rank}</span>
            <span className="text-2xl">{myEntry.user.avatarEmoji}</span>
            <div className="flex-1">
              <div className="font-bold text-sm">Ты</div>
              <div className="text-xs text-muted">Ур. {myEntry.user.level}</div>
            </div>
            <span className="font-bold text-yellow text-sm">{myEntry.xp} XP</span>
          </Card>
        )}

        {/* Full list */}
        {entries.length === 0 ? (
          <Card className="text-center py-8 text-muted">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-sm">Нет данных за период</div>
          </Card>
        ) : (
          <Card className="p-0 overflow-hidden">
            {entries.map((entry, i) => {
              const isMe = entry.user.id === user?.id
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
              return (
                <div
                  key={entry.user.id}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 ${
                    isMe ? 'bg-green/5' : ''
                  }`}
                >
                  <span className="text-base w-7 text-center font-bold text-muted shrink-0">
                    {medal ?? `#${entry.rank}`}
                  </span>
                  <span className="text-xl shrink-0">{entry.user.avatarEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-sm ${isMe ? 'text-green' : ''}`}>
                      {entry.user.firstName}
                      {isMe && ' (ты)'}
                    </div>
                    <div className="text-xs text-muted">Ур. {entry.user.level}</div>
                  </div>
                  <span className="text-sm font-bold text-yellow shrink-0">{entry.xp} XP</span>
                </div>
              )
            })}
          </Card>
        )}

        <div className="h-4" />
      </div>
    </div>
  )
}
