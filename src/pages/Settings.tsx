import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAppStore } from '../store'
import { updateMe } from '../api'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/layout/PageHeader'

export function Settings() {
  const { user, setUser } = useAppStore()

  // Local state for optimistic toggle feedback
  const [localSettings, setLocalSettings] = useState<{
    notifications: boolean
    botNotifications: boolean
    theme: 'dark' | 'light'
  } | null>(null)

  const { mutate } = useMutation({
    mutationFn: (data: Parameters<typeof updateMe>[0]) => updateMe(data),
    onSuccess: (updated) => {
      setUser(updated)
      setLocalSettings(null) // clear optimistic state
    },
    onError: () => setLocalSettings(null), // revert on error
  })

  if (!user) return null

  const settings = localSettings ?? {
    notifications: user.settings?.notifications ?? true,
    botNotifications: user.settings?.botNotifications ?? true,
    theme: (user.settings?.theme ?? 'dark') as 'dark' | 'light',
  }

  const toggle = (key: 'notifications' | 'botNotifications' | 'theme') => {
    if (key === 'notifications') {
      const next = !settings.notifications
      setLocalSettings({ ...settings, notifications: next })
      mutate({ settings: { notifications: next } })
    } else if (key === 'botNotifications') {
      const next = !settings.botNotifications
      setLocalSettings({ ...settings, botNotifications: next })
      mutate({ settings: { botNotifications: next } })
    } else {
      const next = settings.theme === 'dark' ? 'light' : 'dark'
      setLocalSettings({ ...settings, theme: next })
      mutate({ settings: { theme: next } })
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

        {/* Notifications */}
        <div>
          <h2 className="font-display font-bold px-1 mb-2">Уведомления</h2>
          <Card className="divide-y divide-border p-0 overflow-hidden">
            <ToggleRow
              label="В приложении"
              description="Уведомления внутри FinQuest"
              emoji="🔔"
              value={settings.notifications}
              onChange={() => toggle('notifications')}
            />
            <ToggleRow
              label="В Telegram"
              description="Пуши от бота о транзакциях и целях"
              emoji="✈️"
              value={settings.botNotifications}
              onChange={() => toggle('botNotifications')}
            />
          </Card>
        </div>

        {/* Preferences */}
        <div>
          <h2 className="font-display font-bold px-1 mb-2">Предпочтения</h2>
          <Card className="divide-y divide-border p-0 overflow-hidden">
            <ToggleRow
              label="Светлая тема"
              emoji="☀️"
              value={settings.theme === 'light'}
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
                  (user.settings?.currency ?? 'RUB') === c
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
  label, description, emoji, value, onChange,
}: {
  label: string; description?: string; emoji: string; value: boolean; onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-xl">{emoji}</span>
        <div>
          <div className="font-bold text-sm">{label}</div>
          {description && <div className="text-xs text-muted">{description}</div>}
        </div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${value ? 'bg-green' : 'bg-card2'}`}
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
