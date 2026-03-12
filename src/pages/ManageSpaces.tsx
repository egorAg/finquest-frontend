import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../store'
import { getSpaces, updateSpace, deleteSpace, leaveSpace } from '../api'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import type { Space } from '../types'

const SPACE_EMOJIS = ['👤','👨‍👩‍👧','💼','🏠','🚀','💰','🎯','🌟','🎮','🌱','🐾','✈️','🎨','📚','⚽']

const TYPE_LABEL: Record<Space['type'], string> = {
  PERSONAL: 'Личное',
  FAMILY: 'Семейное',
  WORK: 'Рабочее',
}

export function ManageSpaces() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user, activeSpaceId, setActiveSpaceId } = useAppStore()

  const [editing, setEditing] = useState<Space | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmoji, setEditEmoji] = useState('')

  const { data: spaces = [] } = useQuery({
    queryKey: ['spaces'],
    queryFn: getSpaces,
  })

  const { mutate: doUpdate, isPending: updating } = useMutation({
    mutationFn: () => updateSpace(editing!.id, { name: editName, emoji: editEmoji }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['spaces'] })
      setEditing(null)
    },
  })

  const { mutate: doDelete } = useMutation({
    mutationFn: (id: string) => deleteSpace(id),
    onSuccess: (_, id) => {
      if (activeSpaceId === id) setActiveSpaceId(null)
      qc.invalidateQueries({ queryKey: ['spaces'] })
    },
  })

  const { mutate: doLeave } = useMutation({
    mutationFn: (id: string) => leaveSpace(id),
    onSuccess: (_, id) => {
      if (activeSpaceId === id) setActiveSpaceId(null)
      qc.invalidateQueries({ queryKey: ['spaces'] })
    },
  })

  const openEdit = (space: Space) => {
    setEditName(space.name)
    setEditEmoji(space.emoji)
    setEditing(space)
  }

  const confirmDelete = (space: Space) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    if (tg?.showConfirm) {
      tg.showConfirm(`Удалить пространство «${space.name}»? Все данные будут удалены.`, (ok: boolean) => {
        if (ok) doDelete(space.id)
      })
    } else if (window.confirm(`Удалить «${space.name}»?`)) {
      doDelete(space.id)
    }
  }

  const confirmLeave = (space: Space) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    if (tg?.showConfirm) {
      tg.showConfirm(`Покинуть пространство «${space.name}»?`, (ok: boolean) => {
        if (ok) doLeave(space.id)
      })
    } else if (window.confirm(`Покинуть «${space.name}»?`)) {
      doLeave(space.id)
    }
  }

  // Edit page
  if (editing) {
    return (
      <div className="min-h-dvh flex flex-col">
        <PageHeader title="Редактировать" back={() => setEditing(null)} />
        <div className="flex-1 px-[18px] pt-4 pb-8 space-y-5">

          <div>
            <div className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Название</div>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-2xl px-4 py-3 font-bold outline-none border border-border"
              style={{ background: '#161B27', fontSize: 15 }}
            />
          </div>

          <div>
            <div className="text-xs font-bold text-muted uppercase tracking-widest mb-2">
              Иконка · выбрано {editEmoji}
            </div>
            <div className="grid grid-cols-5 gap-3">
              {SPACE_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEditEmoji(e)}
                  className="flex items-center justify-center rounded-2xl active:opacity-60"
                  style={{
                    height: 56, fontSize: 26,
                    background: e === editEmoji ? 'rgba(74,222,128,.2)' : 'rgba(255,255,255,.05)',
                    border: e === editEmoji ? '1.5px solid #4ADE80' : '1.5px solid transparent',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

        </div>
        <div className="px-[18px] pb-8">
          <Button size="lg" disabled={!editName.trim() || updating} onClick={() => doUpdate()}>
            {updating ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Мои пространства" back />
      <div className="px-[18px] pt-4 pb-8 space-y-3">
        {spaces.map((space) => {
          const isOwner = space.ownerId === user?.id
          const isPersonal = space.type === 'PERSONAL'

          return (
            <div
              key={space.id}
              className="rounded-2xl border p-4"
              style={{ background: '#161B27', borderColor: 'rgba(255,255,255,.06)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span style={{ fontSize: 26 }}>{space.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{space.name}</div>
                  <div className="text-xs text-muted mt-0.5">
                    {TYPE_LABEL[space.type]} · {space.members.length} участн.
                    {isOwner && <span className="text-green ml-1">· владелец</span>}
                  </div>
                </div>
              </div>

              {!isPersonal && (
                <div className="flex gap-2">
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => openEdit(space)}
                      className="flex-1 py-2 rounded-xl text-sm font-bold"
                      style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.7)' }}
                    >
                      ✎ Изменить
                    </button>
                  )}
                  {isOwner ? (
                    <button
                      type="button"
                      onClick={() => confirmDelete(space)}
                      className="py-2 px-4 rounded-xl text-sm font-bold"
                      style={{ background: 'rgba(249,115,22,.12)', color: '#F97316' }}
                    >
                      🗑
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => confirmLeave(space)}
                      className="flex-1 py-2 rounded-xl text-sm font-bold"
                      style={{ background: 'rgba(249,115,22,.12)', color: '#F97316' }}
                    >
                      Покинуть
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
