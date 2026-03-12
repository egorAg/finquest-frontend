const CURRENCY_SYMBOLS: Record<string, string> = { RUB: '₽', USD: '$', EUR: '€' }

export function getCurrencySymbol(code?: string): string {
  return CURRENCY_SYMBOLS[code ?? 'RUB'] ?? '₽'
}

/** Форматировать сумму: 1234567 → "1 234 567 ₽" */
export function fmt(amount: number, currency = '₽') {
  return new Intl.NumberFormat('ru-RU').format(Math.round(amount)) + ' ' + currency
}

/** Форматировать дату для группировки: YYYY-MM-DD → "Сегодня" / "Вчера" / "10 марта" */
export function fmtDateGroup(dateStr: string) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Сегодня'
  if (date.toDateString() === yesterday.toDateString()) return 'Вчера'

  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

/** Форматировать дату транзакции: ISO → "10 марта, 14:32" */
export function fmtDateTime(isoStr: string) {
  return new Date(isoStr).toLocaleString('ru-RU', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  })
}

/** Текущий месяц в формате YYYY-MM */
export function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

/** cn — объединить классы (простой вариант без clsx) */
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

/** Название уровня по номеру */
export function levelName(level: number): string {
  const names = ['', 'Новичок', 'Копилка', 'Финансист', 'Аналитик', 'Инвестор', 'Мастер', 'Гуру', 'Легенда', 'Оракул', 'Архитектор']
  return names[Math.min(level, names.length - 1)] || 'Мастер'
}
