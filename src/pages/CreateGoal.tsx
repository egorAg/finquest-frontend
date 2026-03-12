import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../store'
import { createGoal } from '../api'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'

const GOAL_EMOJIS = [
  '🎯','🏠','🚗','✈️','💻','📱','🎓','💍',
  '👶','🏋️','🎸','🎮','🛒','🏖️','🏔️','💰',
  '🎁','🐾','🌱','🍕','🎨','📚','🎬','🚀',
  '💊','🏥','🐶','🐱','⌚','🛋️','🧳','🎪',
]

export function CreateGoal() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { activeSpaceId } = useAppStore()

  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🎯')
  const [target, setTarget] = useState('')

  const { mutate: doCreate, isPending } = useMutation({
    mutationFn: () => createGoal({
      spaceId: activeSpaceId!,
      name,
      emoji,
      targetAmount: parseFloat(target),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      navigate('/goals')
    },
  })

  const valid = name.trim().length > 0 && parseFloat(target) > 0 && !!activeSpaceId

  return (
    <div className="min-h-dvh flex flex-col">
      <PageHeader title="Новая цель" back />

      <div className="flex-1 px-[18px] pt-4 pb-8 space-y-5">

        {/* Name */}
        <div>
          <div className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Название</div>
          <input
            placeholder="Например: Новый ноутбук"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl px-4 py-3 font-bold outline-none border border-border"
            style={{ background: '#161B27', fontSize: 15 }}
          />
        </div>

        {/* Target amount */}
        <div>
          <div className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Целевая сумма</div>
          <input
            type="number"
            placeholder="0"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-2xl px-4 py-3 font-bold outline-none border border-border"
            style={{ background: '#161B27', fontSize: 15 }}
          />
        </div>

        {/* Emoji picker */}
        <div>
          <div className="text-xs font-bold text-muted uppercase tracking-widest mb-2">
            Иконка · выбрано {emoji}
          </div>
          <div className="grid grid-cols-8 gap-2">
            {GOAL_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className="flex items-center justify-center rounded-xl active:opacity-60"
                style={{
                  height: 44, fontSize: 22,
                  background: e === emoji ? 'rgba(74,222,128,.2)' : 'rgba(255,255,255,.05)',
                  border: e === emoji ? '1.5px solid #4ADE80' : '1.5px solid transparent',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

      </div>

      <div className="px-[18px] pb-8">
        <Button size="lg" disabled={!valid || isPending} onClick={() => doCreate()}>
          {isPending ? 'Создание...' : 'Создать цель'}
        </Button>
      </div>
    </div>
  )
}
