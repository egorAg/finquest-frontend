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
      <div className="px-[18px] pt-4 space-y-[14px]">
        <Card className="text-center py-6">
          <button
            type="button"
            onClick={() => navigate('/profile/avatar')}
            className="relative inline-block mb-2 active:opacity-70"
          >
            <span className="text-5xl">{user.avatarEmoji ?? '👤'}</span>
            <span
              className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full text-xs font-bold"
              style={{ width: 20, height: 20, background: '#4ADE80', color: '#052e16' }}
            >
              ✎
            </span>
          </button>
          <div className="font-display font-bold text-xl">{user.firstName} {user.lastName}</div>
          {user.username && <div className="text-sm text-muted">@{user.username}</div>}
          <div className="mt-3 text-sm text-muted">🔥 Серия {user.streakDays ?? 0} дней</div>
        </Card>

        <XpBar xp={user.xp ?? 0} xpToNext={user.xpToNext ?? 200} level={user.level ?? 1} streakDays={user.streakDays ?? 0} />

        <div className="grid grid-cols-2 gap-3">
          <Card className="text-center cursor-pointer" onClick={() => navigate('/achievements')}>
            <div className="text-2xl mb-1">🏆</div>
            <div className="font-bold">{user.achievements?.length ?? 0}</div>
            <div className="text-xs text-muted">Достижений</div>
          </Card>
          <Card className="text-center cursor-pointer" onClick={() => navigate('/notifications')}>
            <div className="text-2xl mb-1">🔔</div>
            <div className="font-bold">—</div>
            <div className="text-xs text-muted">Уведомления</div>
          </Card>
        </div>

        <Card className="cursor-pointer" onClick={() => navigate('/profile/spaces')}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏠</span>
            <div className="flex-1">
              <div className="font-bold text-sm">Мои пространства</div>
              <div className="text-xs text-muted">Управление, редактирование, удаление</div>
            </div>
            <span className="text-muted text-sm">›</span>
          </div>
        </Card>

        <div className="h-4" />
      </div>
    </div>
  )
}
