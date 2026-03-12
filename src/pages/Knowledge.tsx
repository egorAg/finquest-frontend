import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getKnowledgeArticles } from '../api'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/layout/PageHeader'

const CATEGORIES = [
  { id: 'all',        label: 'Все' },
  { id: 'basics',     label: 'Основы' },
  { id: 'savings',    label: 'Накопления' },
  { id: 'budgeting',  label: 'Бюджет' },
  { id: 'investing',  label: 'Инвестиции' },
  { id: 'psychology', label: 'Психология' },
]

export function Knowledge() {
  const navigate = useNavigate()
  const [cat, setCat] = useState('all')

  const { data: articles = [] } = useQuery({
    queryKey: ['knowledge', cat],
    queryFn: () => getKnowledgeArticles(cat === 'all' ? undefined : cat),
  })

  return (
    <div>
      <PageHeader title="База знаний" />
      <div className="px-[18px] pt-4 space-y-[14px]">
        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                cat === c.id
                  ? 'bg-blue/20 text-blue border border-blue/30'
                  : 'bg-card2 text-muted'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Articles */}
        <div className="space-y-[10px]">
          {articles.map((a) => (
            <Card
              key={a.id}
              className="cursor-pointer flex items-center"
              style={{ gap: 14, padding: '14px 16px' }}
              onClick={() => navigate(`/knowledge/${a.id}`)}
            >
              <span className="flex-shrink-0" style={{ fontSize: 28 }}>{a.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-text leading-tight" style={{ fontSize: 13 }}>{a.title}</div>
                <div className="font-sans mt-1" style={{ fontSize: 11, color: 'rgba(255,255,255,.28)' }}>
                  {a.readTime} мин · +{a.xpReward} XP
                </div>
              </div>
              <span className="text-muted flex-shrink-0" style={{ fontSize: 18 }}>›</span>
            </Card>
          ))}
        </div>
        <div className="h-4" />
      </div>
    </div>
  )
}
