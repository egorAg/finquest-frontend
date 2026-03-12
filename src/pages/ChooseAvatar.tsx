import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAppStore } from '../store'
import { updateMe } from '../api'
import { PageHeader } from '../components/layout/PageHeader'

const AVATAR_EMOJIS = [
  '😀','😎','🤓','🧐','😏','🥸','🤩','😇','🥳','😈',
  '🐱','🐶','🐸','🦊','🐼','🦁','🐯','🐨','🐮','🐷',
  '🦄','🐙','🦋','🐬','🦅','🦉','🐲','🦝','🐺','🐧',
  '🧙','🧑‍💻','👨‍🚀','🧑‍🎨','🥷','👑','🎩','🤖','👾','💀',
]

export function ChooseAvatar() {
  const navigate = useNavigate()
  const { user, setUser } = useAppStore()

  const { mutate: saveAvatar, isPending } = useMutation({
    mutationFn: (emoji: string) => updateMe({ avatarEmoji: emoji }),
    onSuccess: (updated) => {
      setUser(updated)
      navigate(-1)
    },
  })

  return (
    <div className="min-h-dvh flex flex-col">
      <PageHeader title="Выбери аватарку" back />

      <div className="flex-1 px-[18px] pt-4 pb-8">
        <div className="grid grid-cols-5 gap-3">
          {AVATAR_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              disabled={isPending}
              onClick={() => saveAvatar(emoji)}
              className="flex items-center justify-center rounded-2xl active:opacity-60"
              style={{
                height: 64, fontSize: 30,
                background: emoji === user?.avatarEmoji ? 'rgba(74,222,128,.2)' : 'rgba(255,255,255,.05)',
                border: emoji === user?.avatarEmoji ? '1.5px solid #4ADE80' : '1.5px solid transparent',
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
