import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../store'
import { createRecurringTransaction, getSpaces } from '../api'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'

const EXPENSE_CATS = [
  { name: 'Продукты', emoji: '🛒' }, { name: 'Транспорт', emoji: '🚌' },
  { name: 'Кафе', emoji: '☕' },     { name: 'Жильё', emoji: '🏠' },
  { name: 'Здоровье', emoji: '💊' }, { name: 'Развлечения', emoji: '🎬' },
  { name: 'Одежда', emoji: '👕' },   { name: 'Образование', emoji: '📚' },
  { name: 'Связь', emoji: '📱' },    { name: 'Подписка', emoji: '🔄' },
  { name: 'Другое', emoji: '📦' },
]
const INCOME_CATS = [
  { name: 'Зарплата', emoji: '💼' }, { name: 'Фриланс', emoji: '💻' },
  { name: 'Инвестиции', emoji: '📈' }, { name: 'Подарок', emoji: '🎁' },
  { name: 'Другое', emoji: '💰' },
]

const FREQ_OPTIONS = [
  { value: 'DAILY' as const, label: 'Ежедневно' },
  { value: 'WEEKLY' as const, label: 'Еженедельно' },
  { value: 'MONTHLY' as const, label: 'Ежемесячно' },
]

export function AddRecurring() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { activeSpaceId } = useAppStore()

  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [categoryEmoji, setCategoryEmoji] = useState('')
  const [comment, setComment] = useState('')
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('MONTHLY')
  const [nextRunDate, setNextRunDate] = useState(new Date().toISOString().slice(0, 10))
  const [spaceId, setSpaceId] = useState(activeSpaceId ?? '')
  const [isCustom, setIsCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customEmoji, setCustomEmoji] = useState('')

  const EMOJI_OPTIONS = ['🏷️','🎮','🐾','✈️','💄','🔧','🎵','🏋️','🚗','🍕','📝','🎁','💳','🏦','📊','⭐']

  const { data: spaces = [] } = useQuery({ queryKey: ['spaces'], queryFn: getSpaces })

  const { mutate, isPending } = useMutation({
    mutationFn: () => createRecurringTransaction({
      spaceId, type, amount: parseFloat(amount),
      category, categoryEmoji, comment, frequency, nextRunDate,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring'] })
      navigate(-1)
    },
  })

  const cats = type === 'EXPENSE' ? EXPENSE_CATS : INCOME_CATS
  const canSubmit = !!amount && parseFloat(amount) > 0 && !!category && !!spaceId

  return (
    <div>
      <PageHeader title="Новая подписка" back />
      <div className="px-[18px] pt-4 space-y-[14px]">

        {/* Type toggle */}
        <div className="flex bg-card2 rounded-2xl p-1 gap-1">
          {(['EXPENSE', 'INCOME'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setType(t); setCategory(''); setCategoryEmoji(''); setIsCustom(false); setCustomName(''); setCustomEmoji('') }}
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
                onClick={() => { setCategory(c.name); setCategoryEmoji(c.emoji); setIsCustom(false) }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                  category === c.name && !isCustom
                    ? 'border-green/50 bg-green/10'
                    : 'border-border bg-card2'
                }`}
              >
                <span className="text-2xl">{c.emoji}</span>
                <span className="text-xs text-center leading-tight">{c.name}</span>
              </button>
            ))}
            <button
              onClick={() => {
                setIsCustom(true)
                setCategory(customName)
                setCategoryEmoji(customEmoji || '🏷️')
                if (!customEmoji) setCustomEmoji('🏷️')
              }}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                isCustom ? 'border-green/50 bg-green/10' : 'border-border bg-card2 border-dashed'
              }`}
            >
              <span className="text-2xl">✏️</span>
              <span className="text-xs text-center leading-tight">Своя</span>
            </button>
          </div>

          {isCustom && (
            <div className="mt-3 space-y-2">
              <input
                placeholder="Название категории"
                value={customName}
                onChange={(e) => { setCustomName(e.target.value); setCategory(e.target.value) }}
                className="w-full bg-card2 rounded-xl border border-border px-3 py-2 text-sm outline-none"
                autoFocus
              />
              <div>
                <div className="text-xs text-muted mb-1">Иконка</div>
                <div className="flex flex-wrap gap-1">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      onClick={() => { setCustomEmoji(e); setCategoryEmoji(e) }}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                        customEmoji === e ? 'bg-green/20 border border-green/50' : 'bg-card2 border border-border'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Frequency */}
        <div>
          <div className="text-xs text-muted mb-2">Частота</div>
          <div className="flex gap-2">
            {FREQ_OPTIONS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFrequency(f.value)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                  frequency === f.value ? 'border-green/50 bg-green/10 text-green' : 'border-border bg-card2 text-muted'
                }`}
              >
                {f.label}
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

        {/* Start date */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="text-xs text-muted mb-1">Дата начала</div>
          <input
            type="date"
            value={nextRunDate}
            onChange={(e) => setNextRunDate(e.target.value)}
            className="w-full bg-transparent outline-none font-bold"
          />
        </div>

        <Button
          size="lg"
          onClick={() => mutate()}
          disabled={!canSubmit || isPending}
          className="font-display"
        >
          {isPending ? 'Сохранение...' : 'Создать подписку'}
        </Button>

        <div className="h-4" />
      </div>
    </div>
  )
}
