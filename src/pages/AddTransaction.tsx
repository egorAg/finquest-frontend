import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../store'
import { createTransaction, getSpaces } from '../api'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'

const EXPENSE_CATS = [
  { name: 'Продукты', emoji: '🛒' }, { name: 'Транспорт', emoji: '🚌' },
  { name: 'Кафе', emoji: '☕' },     { name: 'Жильё', emoji: '🏠' },
  { name: 'Здоровье', emoji: '💊' }, { name: 'Развлечения', emoji: '🎬' },
  { name: 'Одежда', emoji: '👕' },   { name: 'Образование', emoji: '📚' },
  { name: 'Связь', emoji: '📱' },    { name: 'Другое', emoji: '📦' },
]
const INCOME_CATS = [
  { name: 'Зарплата', emoji: '💼' }, { name: 'Фриланс', emoji: '💻' },
  { name: 'Инвестиции', emoji: '📈' }, { name: 'Подарок', emoji: '🎁' },
  { name: 'Другое', emoji: '💰' },
]

export function AddTransaction() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { activeSpaceId, setUser } = useAppStore()

  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [categoryEmoji, setCategoryEmoji] = useState('')
  const [comment, setComment] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [spaceId, setSpaceId] = useState(activeSpaceId ?? '')

  const { data: spaces = [] } = useQuery({ queryKey: ['spaces'], queryFn: getSpaces })

  const { mutate, isPending } = useMutation({
    mutationFn: () => createTransaction({
      spaceId, type, amount: parseFloat(amount),
      category, categoryEmoji, comment, date,
    }),
    onSuccess: (res) => {
      setUser(res.user)
      qc.invalidateQueries({ queryKey: ['transactions'] })
      navigate(-1)
    },
  })

  const cats = type === 'EXPENSE' ? EXPENSE_CATS : INCOME_CATS
  const canSubmit = !!amount && parseFloat(amount) > 0 && !!category && !!spaceId

  return (
    <div>
      <PageHeader title="Новая операция" back />
      <div className="px-[18px] pt-4 space-y-[14px]">

        {/* Type toggle */}
        <div className="flex bg-card2 rounded-2xl p-1 gap-1">
          {(['EXPENSE', 'INCOME'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setType(t); setCategory(''); setCategoryEmoji('') }}
              className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
                type === t
                  ? t === 'EXPENSE' ? 'bg-coral/20 text-coral' : 'bg-green/20 text-green'
                  : 'text-muted'
              }`}
            >
              {t === 'EXPENSE' ? 'Расход' : 'Доход'}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="text-xs text-muted mb-1">Сумма</div>
          <input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent text-3xl font-display font-black outline-none"
            inputMode="decimal"
          />
        </div>

        {/* Categories */}
        <div>
          <div className="text-xs text-muted mb-2">Категория</div>
          <div className="grid grid-cols-4 gap-2">
            {cats.map((c) => (
              <button
                key={c.name}
                onClick={() => { setCategory(c.name); setCategoryEmoji(c.emoji) }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                  category === c.name
                    ? 'border-green/50 bg-green/10'
                    : 'border-border bg-card2'
                }`}
              >
                <span className="text-2xl">{c.emoji}</span>
                <span className="text-xs text-center leading-tight">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Space selector */}
        {spaces.length > 1 && (
          <div>
            <div className="text-xs text-muted mb-2">Пространство</div>
            <div className="flex gap-2">
              {spaces.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSpaceId(s.id)}
                  className={`px-3 py-2 rounded-xl text-sm font-bold border transition-all ${
                    spaceId === s.id ? 'border-green/50 bg-green/10' : 'border-border bg-card2'
                  }`}
                >
                  {s.emoji} {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comment */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <input
            placeholder="Комментарий (необязательно)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>

        {/* Date */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="text-xs text-muted mb-1">Дата</div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent outline-none font-bold"
          />
        </div>

        <Button
          size="lg"
          onClick={() => mutate()}
          disabled={!canSubmit || isPending}
          className="font-display"
        >
          {isPending ? 'Сохранение...' : 'Добавить'}
        </Button>

        <div className="h-4" />
      </div>
    </div>
  )
}
