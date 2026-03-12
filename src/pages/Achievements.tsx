import { useQuery } from '@tanstack/react-query'
import { getAchievements } from '../api'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/layout/PageHeader'
import { fmtDateTime } from '../lib/utils'

export function Achievements() {
  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: getAchievements,
  })

  const unlocked = achievements.filter((a) => a.isUnlocked)
  const locked = achievements.filter((a) => !a.isUnlocked)

  return (
    <div>
      <PageHeader title="Достижения" back />
      <div className="px-4 space-y-4">
        {/* Progress */}
        <Card className="flex items-center gap-4">
          <div className="text-4xl">🏆</div>
          <div className="flex-1">
            <div className="font-display font-bold mb-1">
              {unlocked.length} из {achievements.length}
            </div>
            <div className="h-2 bg-card2 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow rounded-full transition-all"
                style={{ width: achievements.length ? `${(unlocked.length / achievements.length) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </Card>

        {/* Unlocked */}
        {unlocked.length > 0 && (
          <div>
            <h2 className="font-display font-bold mb-2 px-1">Получены</h2>
            <div className="space-y-2">
              {unlocked.map((a) => (
                <Card key={a.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-yellow/20 flex items-center justify-center text-2xl shrink-0">
                    {a.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">{a.name}</div>
                    <div className="text-xs text-muted">{a.description}</div>
                    {a.unlockedAt && (
                      <div className="text-xs text-yellow mt-0.5">{fmtDateTime(a.unlockedAt)}</div>
                    )}
                  </div>
                  {a.xpReward > 0 && (
                    <span className="text-xs font-bold text-yellow shrink-0">+{a.xpReward} XP</span>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <div>
            <h2 className="font-display font-bold mb-2 px-1 text-muted">Ещё не получены</h2>
            <div className="space-y-2">
              {locked.map((a) => (
                <Card key={a.id} className="flex items-center gap-3 opacity-50">
                  <div className="w-12 h-12 rounded-2xl bg-card2 flex items-center justify-center text-2xl shrink-0 grayscale">
                    {a.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">{a.name}</div>
                    <div className="text-xs text-muted">{a.description}</div>
                  </div>
                  {a.xpReward > 0 && (
                    <span className="text-xs font-bold text-muted shrink-0">+{a.xpReward} XP</span>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  )
}
