import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store'
import { Card } from '../components/ui/Card'
import { XpBar } from '../components/ui/XpBar'
import { PageHeader } from '../components/layout/PageHeader'

export function Profile() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  if (!user) return null

  return (
    <div>
      <PageHeader title="Профиль" right={
        <button onClick={() => navigate('/settings')} className="text-xl">⚙️</button>
      } />
      <div className="px-[18px] space-y-[14px]">
        <Card className="text-center py-6">
          <div className="text-5xl mb-2">{user.avatarEmoji}</div>
          <div className="font-display font-bold text-xl">{user.firstName} {user.lastName}</div>
          {user.username && <div className="text-sm text-muted">@{user.username}</div>}
          <div className="mt-3 text-sm text-muted">🔥 Серия {user.streakDays} дней</div>
        </Card>

        <XpBar xp={user.xp} xpToNext={user.xpToNext} level={user.level} streakDays={user.streakDays} />

        <div className="grid grid-cols-2 gap-3">
          <Card className="text-center cursor-pointer" onClick={() => navigate('/achievements')}>
            <div className="text-2xl mb-1">🏆</div>
            <div className="font-bold">{user.achievements.length}</div>
            <div className="text-xs text-muted">Достижений</div>
          </Card>
          <Card className="text-center cursor-pointer" onClick={() => navigate('/notifications')}>
            <div className="text-2xl mb-1">🔔</div>
            <div className="font-bold">—</div>
            <div className="text-xs text-muted">Уведомления</div>
          </Card>
        </div>

        <div className="h-4" />
      </div>
    </div>
  )
}
