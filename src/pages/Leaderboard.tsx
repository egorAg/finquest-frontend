import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '../store'
import { getLeaderboard, getSeasonInfo } from '../api'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/layout/PageHeader'

const SEASON_DAYS = 14

function prevSeason(start: string) {
  const d = new Date(start)
  d.setDate(d.getDate() - SEASON_DAYS)
  return d.toISOString().slice(0, 10)
}

function nextSeason(start: string) {
  const d = new Date(start)
  d.setDate(d.getDate() + SEASON_DAYS)
  return d.toISOString().slice(0, 10)
}

function formatRange(start: string, end: string) {
  const s = new Date(start).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  const e = new Date(end).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  return `${s} — ${e}`
}

export function Leaderboard() {
  const { user } = useAppStore()

  const { data: seasonInfo } = useQuery({
    queryKey: ['season-info'],
    queryFn: getSeasonInfo,
  })

  const [season, setSeason] = useState<string | null>(null) // null = use current from seasonInfo

  const activeSeason = season ?? seasonInfo?.seasonStart?.slice(0, 10)
  const activeSeasonEnd = activeSeason
    ? new Date(new Date(activeSeason).getTime() + SEASON_DAYS * 86400000).toISOString().slice(0, 10)
    : null
  const isCurrent = activeSeason === seasonInfo?.seasonStart?.slice(0, 10)

  const { data: entries = [] } = useQuery({
    queryKey: ['leaderboard', activeSeason],
    queryFn: () => getLeaderboard({ season: activeSeason, limit: 50 }),
    enabled: !!activeSeason,
  })

  const myEntry = entries.find((e) => e.user.id === user?.id)
  const rewards = seasonInfo?.rewards ?? []

  return (
    <div>
      <PageHeader title="Рейтинг 🏆" back />
      <div className="px-[18px] pt-4 space-y-[14px]">

        {/* Season nav */}
        {activeSeason && activeSeasonEnd && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSeason(prevSeason(activeSeason))}
              className="w-9 h-9 bg-card2 rounded-xl flex items-center justify-center font-bold"
            >‹</button>
            <div className="text-center">
              <div className="font-bold text-sm">{formatRange(activeSeason, activeSeasonEnd)}</div>
              {isCurrent && seasonInfo && (
                <div className="text-xs text-yellow font-bold mt-0.5">
                  Сезон {seasonInfo.seasonNumber + 1} · {seasonInfo.daysLeft} дн. до конца
                </div>
              )}
              {!isCurrent && (
                <div className="text-xs text-muted mt-0.5">Прошедший сезон</div>
              )}
            </div>
            <button
              onClick={() => setSeason(nextSeason(activeSeason))}
              className="w-9 h-9 bg-card2 rounded-xl flex items-center justify-center font-bold"
            >›</button>
          </div>
        )}

        {/* Rewards */}
        {isCurrent && rewards.length > 0 && (
          <Card className="p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <span className="font-bold text-sm">Награды сезона</span>
            </div>
            <div className="flex divide-x divide-border">
              {rewards.map((r) => (
                <div key={r.place} className="flex-1 flex flex-col items-center py-3 gap-1">
                  <span className="text-2xl">{r.emoji}</span>
                  <span className="font-black text-yellow text-sm">{r.label}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

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
              const reward = rewards.find((r) => r.place === i + 1)
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
                      {entry.user.firstName}{isMe ? ' (ты)' : ''}
                    </div>
                    <div className="text-xs text-muted">Ур. {entry.user.level}</div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-sm font-bold text-yellow">{entry.xp} XP</span>
                    {reward && isCurrent && (
                      <span className="text-xs text-muted">{reward.label} награда</span>
                    )}
                  </div>
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
