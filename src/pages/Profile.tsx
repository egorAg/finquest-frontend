import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAppStore } from '../store'
import { updateMe } from '../api'
import { Card } from '../components/ui/Card'
import { XpBar } from '../components/ui/XpBar'
import { PageHeader } from '../components/layout/PageHeader'

const AVATAR_EMOJIS = [
  '😀','😎','🤓','🧐','😏','🥸','🤩','😇','🥳','😈',
  '🐱','🐶','🐸','🦊','🐼','🦁','🐯','🐨','🐮','🐷',
  '🦄','🐙','🦋','🐬','🦅','🦉','🐲','🦝','🐺','🐧',
  '🧙','🧑‍💻','👨‍🚀','🧑‍🎨','🥷','👑','🎩','🤖','👾','💀',
]

export function Profile() {
  const navigate = useNavigate()
  const { user, setUser } = useAppStore()
  const [showPicker, setShowPicker] = useState(false)

  const openPicker = () => {
    window.Telegram?.WebApp?.disableVerticalSwipes?.()
    setShowPicker(true)
  }
  const closePicker = () => {
    window.Telegram?.WebApp?.enableVerticalSwipes?.()
    setShowPicker(false)
  }

  const { mutate: saveAvatar, isPending } = useMutation({
    mutationFn: (emoji: string) => updateMe({ avatarEmoji: emoji }),
    onSuccess: (updated) => {
      setUser(updated)
      closePicker()
    },
  })

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
            onClick={openPicker}
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

        <div className="h-4" />
      </div>

      {/* Avatar picker bottom sheet */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={closePicker} />
          <div
            className="relative rounded-t-3xl p-5"
            style={{ background: '#161B27' }}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-sm">Выбери аватарку</span>
              <button
                type="button"
                onClick={closePicker}
                className="text-muted text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div
            className="grid grid-cols-8 gap-2"
            style={{ maxHeight: '45vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
          >
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  disabled={isPending}
                  onClick={() => saveAvatar(emoji)}
                  className="flex items-center justify-center rounded-xl active:opacity-60"
                  style={{
                    height: 44, fontSize: 24,
                    background: emoji === user.avatarEmoji ? 'rgba(74,222,128,.2)' : 'rgba(255,255,255,.05)',
                    border: emoji === user.avatarEmoji ? '1.5px solid #4ADE80' : '1.5px solid transparent',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
