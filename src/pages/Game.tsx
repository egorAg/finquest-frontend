import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store'
import { getChallenges, getLeaderboard } from '../api'
import { Card } from '../components/ui/Card'
import { XpBar } from '../components/ui/XpBar'
import { PageHeader } from '../components/layout/PageHeader'

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
      <div className="px-[18px] space-y-[14px]">
        {/* XP card */}
        {user && (
          <XpBar xp={user.xp} xpToNext={user.xpToNext} level={user.level} streakDays={user.streakDays} />
        )}

        {/* Active challenges */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-bold">Челленджи</h2>
            <button onClick={() => navigate('/challenges')} className="text-xs text-muted">Все →</button>
          </div>
          <div className="space-y-2">
            {active.map((ch) => {
              const pct = Math.min((ch.currentValue / ch.targetValue) * 100, 100)
              return (
                <Card key={ch.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{ch.emoji}</span>
                      <div>
                        <div className="font-bold text-sm">{ch.title}</div>
                        <div className="text-xs text-muted">{ch.description}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-yellow">+{ch.xpReward} XP</span>
                  </div>
                  <div className="h-1.5 bg-card2 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-right text-xs text-muted mt-1">{Math.round(pct)}%</div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Leaderboard preview */}
        {leaderboard.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display font-bold">Рейтинг</h2>
              <button onClick={() => navigate('/leaderboard')} className="text-xs text-muted">Все →</button>
            </div>
            <Card className="p-0 overflow-hidden">
              {leaderboard.map((entry, i) => (
                <div key={entry.user.id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
                  <span className="text-lg w-6 text-center font-bold text-muted">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : entry.rank}
                  </span>
                  <span className="text-xl">{entry.user.avatarEmoji}</span>
                  <span className="flex-1 font-bold text-sm">{entry.user.firstName}</span>
                  <span className="text-xs text-yellow font-bold">{entry.xp} XP</span>
                </div>
              ))}
            </Card>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  )
}
