import { useMutation } from '@tanstack/react-query'
import { useAppStore } from '../store'
import { updateMe } from '../api'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/layout/PageHeader'

export function Settings() {
  const { user, setUser } = useAppStore()

  const { mutate } = useMutation({
    mutationFn: (data: Parameters<typeof updateMe>[0]) => updateMe(data),
    onSuccess: (updated) => setUser(updated),
  })

  if (!user) return null

  const toggle = (key: 'notifications' | 'theme') => {
    if (key === 'notifications') {
      mutate({ settings: { notifications: !user.settings.notifications } })
    } else {
      mutate({ settings: { theme: user.settings.theme === 'dark' ? 'light' : 'dark' } })
    }
  }

  return (
    <div>
      <PageHeader title="Настройки" back />
      <div className="px-[18px] pt-4 space-y-[14px]">
        {/* Profile */}
        <Card className="flex items-center gap-3">
          <div className="text-4xl">{user.avatarEmoji}</div>
          <div>
            <div className="font-bold">{user.firstName} {user.lastName}</div>
            {user.username && <div className="text-sm text-muted">@{user.username}</div>}
          </div>
        </Card>

        {/* Preferences */}
        <div>
          <h2 className="font-display font-bold px-1 mb-2">Предпочтения</h2>
          <Card className="divide-y divide-border p-0 overflow-hidden">
            <ToggleRow
              label="Уведомления"
              emoji="🔔"
              value={user.settings.notifications}
              onChange={() => toggle('notifications')}
            />
            <ToggleRow
              label="Светлая тема"
              emoji="☀️"
              value={user.settings.theme === 'light'}
              onChange={() => toggle('theme')}
            />
          </Card>
        </div>

        {/* Currency */}
        <div>
          <h2 className="font-display font-bold px-1 mb-2">Валюта</h2>
          <Card className="flex gap-2">
            {['RUB', 'USD', 'EUR'].map((c) => (
              <button
                key={c}
                onClick={() => mutate({ settings: { currency: c } })}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  user.settings.currency === c
                    ? 'bg-green/20 text-green border border-green/30'
                    : 'bg-card2 text-muted'
                }`}
              >
                {c === 'RUB' ? '₽ RUB' : c === 'USD' ? '$ USD' : '€ EUR'}
              </button>
            ))}
          </Card>
        </div>

        {/* App info */}
        <Card className="text-center text-muted text-xs py-4">
          <div className="text-2xl mb-1">💰</div>
          <div className="font-bold text-text">FinQuest</div>
          <div>v1.0.0 · Дипломный проект</div>
        </Card>

        <div className="h-4" />
      </div>
    </div>
  )
}

function ToggleRow({
  label, emoji, value, onChange,
}: {
  label: string; emoji: string; value: boolean; onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-xl">{emoji}</span>
        <span className="font-bold text-sm">{label}</span>
      </div>
      <button
        onClick={onChange}
        className={`w-12 h-6 rounded-full transition-all relative ${value ? 'bg-green' : 'bg-card2'}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
            value ? 'left-6' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  )
}
