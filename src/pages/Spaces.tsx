import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store'
import { getSpaces, createSpace, createSpaceInvite, joinSpaceByToken } from '../api'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/layout/PageHeader'
import type { Space } from '../types'

const SPACE_EMOJIS = ['👤', '👨‍👩‍👧‍👦', '💼', '🏠', '🎓', '✈️', '🏋️', '🎮']
const SPACE_COLORS = ['#4ADE80', '#38BDF8', '#A78BFA', '#FACC15', '#F97316', '#F87171']

export function Spaces() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { activeSpaceId, setActiveSpaceId } = useAppStore()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('👤')
  const [color, setColor] = useState('#4ADE80')
  const [type, setType] = useState<Space['type']>('PERSONAL')

  const { data: spaces = [] } = useQuery({
    queryKey: ['spaces'],
    queryFn: getSpaces,
  })

  // Auto-join if opened via invite deep link
  useEffect(() => {
    const startParam = (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param as string | undefined
    if (startParam?.startsWith('invite_')) {
      const token = startParam.replace('invite_', '')
      joinByToken(token)
    }
  }, [])

  const { mutate: joinByToken } = useMutation({
    mutationFn: joinSpaceByToken,
    onSuccess: (space) => {
      if (space) {
        qc.invalidateQueries({ queryKey: ['spaces'] })
        setActiveSpaceId(space.id)
        navigate(-1)
      }
    },
  })

  const { mutate: doInvite } = useMutation({
    mutationFn: (spaceId: string) => createSpaceInvite(spaceId),
    onSuccess: (data) => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(data.inviteUrl).catch(() => {})
      }
      alert(`Ссылка скопирована!\n\n${data.inviteUrl}`)
    },
  })

  const { mutate: doCreate, isPending } = useMutation({
    mutationFn: () => createSpace({ name, emoji, type, color }),
    onSuccess: (space) => {
      qc.invalidateQueries({ queryKey: ['spaces'] })
      setActiveSpaceId(space.id)
      setShowCreate(false)
      setName('')
      navigate(-1)
    },
  })

  const typeLabels: Record<Space['type'], string> = {
    PERSONAL: 'Личное',
    FAMILY: 'Семейное',
    WORK: 'Рабочее',
  }

  return (
    <div>
      <PageHeader title="Пространства" back />
      <div className="px-4 pt-4 space-y-3">
        {spaces.map((space) => (
          <Card
            key={space.id}
            className={`flex items-center gap-3 cursor-pointer transition-all ${activeSpaceId === space.id ? 'ring-2 ring-green/40' : ''}`}
            onClick={() => { setActiveSpaceId(space.id); navigate(-1) }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: space.color + '22' }}
            >
              {space.emoji}
            </div>
            <div className="flex-1">
              <div className="font-bold">{space.name}</div>
              <div className="text-xs text-muted">{typeLabels[space.type]}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); doInvite(space.id) }}
                className="text-xs text-muted bg-card2 rounded-xl px-3 py-1.5 font-bold"
              >
                Invite
              </button>
              {activeSpaceId === space.id && (
                <div className="text-green font-bold text-lg">✓</div>
              )}
            </div>
          </Card>
        ))}

        <Button variant="secondary" size="lg" onClick={() => setShowCreate(true)} className="w-full">
          + Новое пространство
        </Button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreate(false)} />
          <div className="relative w-full bg-card rounded-t-3xl p-6 space-y-4">
            <h3 className="font-display font-bold text-lg">Новое пространство</h3>

            {/* Emoji + Name */}
            <div className="flex gap-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {SPACE_EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`w-11 h-11 rounded-2xl text-xl flex items-center justify-center transition-all ${emoji === e ? 'bg-green/20 ring-2 ring-green/40' : 'bg-card2'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <input
              placeholder="Название пространства"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-card2 rounded-2xl px-4 py-3 font-bold outline-none border border-border"
            />

            {/* Type */}
            <div className="flex gap-2">
              {(['PERSONAL', 'FAMILY', 'WORK'] as Space['type'][]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${type === t ? 'bg-green/20 text-green' : 'bg-card2 text-muted'}`}
                >
                  {typeLabels[t]}
                </button>
              ))}
            </div>

            {/* Color */}
            <div className="flex gap-3">
              {SPACE_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-full transition-all ${color === c ? 'ring-2 ring-white/50 scale-110' : ''}`}
                  style={{ background: c }}
                />
              ))}
            </div>

            <Button size="lg" disabled={!name || isPending} onClick={() => doCreate()}>
              {isPending ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
