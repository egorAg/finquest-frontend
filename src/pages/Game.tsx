import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store'
import { getChallenges, getLeaderboard } from '../api'
import { XpBar } from '../components/ui/XpBar'
import { PageHeader } from '../components/layout/PageHeader'

// card wrapper style shared in this page
const CARD_STYLE = {
  background: 'var(--color-card)',
  borderColor: 'var(--color-border)',
  padding: '18px 18px 14px',
}

export function Game() {
  const navigate = useNavigate()
  const { user } = useAppStore()

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: getChallenges,
  })

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => getLeaderboard({ limit: 5 }),
  })

  const active = challenges.filter((c) => !c.isCompleted).slice(0, 3)

  return (
    <div>
      <PageHeader title="Игра" />
      <div className="px-[18px] pt-4 space-y-[14px]">

        {/* XP card */}
        {user && (
          <XpBar xp={user.xp} xpToNext={user.xpToNext} level={user.level} streakDays={user.streakDays} />
        )}

        {/* Challenges */}
        <div className="rounded-3xl border" style={CARD_STYLE}>
          <div className="flex items-center justify-between mb-[14px]">
            <span className="font-black text-text" style={{ fontSize: 15 }}>Челленджи 🔥</span>
            <button
              onClick={() => navigate('/challenges')}
              className="font-bold font-sans"
              style={{ fontSize: 12, color: 'var(--color-muted)', background: 'none', border: 'none' }}
            >
              Все →
            </button>
          </div>

          {active.length === 0 ? (
            <div className="text-center py-2 font-sans" style={{ fontSize: 13, color: 'var(--color-muted)' }}>
              Нет активных челленджей
            </div>
          ) : (
            active.map((ch) => {
              const pct = Math.min((ch.currentValue / ch.targetValue) * 100, 100)
              const daysLeft = Math.max(0, Math.floor((new Date(ch.deadline).getTime() - Date.now()) / 86400000))
              return (
                <div
                  key={ch.id}
                  className="flex items-center gap-3 rounded-2xl mb-[10px] last:mb-0 border"
                  style={{
                    padding: '13px 14px',
                    background: 'var(--color-card2)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <span className="flex-shrink-0" style={{ fontSize: 24 }}>{ch.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-text mb-1" style={{ fontSize: 13 }}>{ch.title}</div>
                    <div className="flex justify-between mb-[5px]">
                      <span className="font-sans truncate pr-2" style={{ fontSize: 11, color: 'var(--color-muted)' }}>
                        {ch.description}
                      </span>
                      <span className="font-extrabold text-yellow flex-shrink-0" style={{ fontSize: 11 }}>
                        {Math.round(pct)}%
                      </span>
                    </div>
                    <div className="rounded-full overflow-hidden" style={{ height: 6, background: 'var(--color-track)' }}>
                      <div className="h-full rounded-full bg-yellow" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0" style={{ gap: 2 }}>
                    <span className="font-black text-yellow" style={{ fontSize: 13 }}>+{ch.xpReward} XP</span>
                    <span className="font-sans" style={{ fontSize: 10, color: 'var(--color-muted)' }}>{daysLeft} дн.</span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Leaderboard preview */}
        <div className="rounded-3xl border" style={CARD_STYLE}>
          <div className="flex items-center justify-between mb-[14px]">
            <span className="font-black text-text" style={{ fontSize: 15 }}>Рейтинг 🏆</span>
            <button
              onClick={() => navigate('/leaderboard')}
              className="font-bold font-sans"
              style={{ fontSize: 12, color: 'var(--color-muted)', background: 'none', border: 'none' }}
            >
              Все →
            </button>
          </div>

          {leaderboard.length === 0 ? (
            <div className="text-center py-2 font-sans" style={{ fontSize: 13, color: 'var(--color-muted)' }}>
              Нет данных
            </div>
          ) : (
            leaderboard.map((entry, i) => (
              <div
                key={entry.user.id}
                className="flex items-center mb-[10px] last:mb-0 rounded-2xl"
                style={{
                  gap: 12, padding: '10px 12px',
                  background: 'var(--color-card2)',
                }}
              >
                <span className="font-black w-6 text-center flex-shrink-0" style={{ fontSize: 16 }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${entry.rank}`}
                </span>
                <span className="flex-shrink-0" style={{ fontSize: 20 }}>{entry.user.avatarEmoji}</span>
                <span className="flex-1 font-extrabold text-text" style={{ fontSize: 13 }}>{entry.user.firstName}</span>
                <span className="font-black text-yellow flex-shrink-0" style={{ fontSize: 13 }}>{entry.xp} XP</span>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
