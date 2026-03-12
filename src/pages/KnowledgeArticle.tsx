import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getKnowledgeArticle } from '../api'
import { PageHeader } from '../components/layout/PageHeader'

export function KnowledgeArticle() {
  const { id } = useParams<{ id: string }>()

  const { data: article, isLoading } = useQuery({
    queryKey: ['knowledge-article', id],
    queryFn: () => getKnowledgeArticle(id!),
    enabled: !!id,
  })

  // Разбиваем markdown-контент на параграфы и жирный текст
  function renderContent(text: string) {
    return text.split('\n\n').map((block, i) => {
      if (block.startsWith('**') && block.endsWith('**')) {
        return (
          <h3 key={i} className="font-display font-bold text-base mt-4 mb-1">
            {block.slice(2, -2)}
          </h3>
        )
      }
      // inline **bold**
      const parts = block.split(/(\*\*.*?\*\*)/g)
      return (
        <p key={i} className="text-sm text-muted leading-relaxed">
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j} className="text-text font-bold">{part.slice(2, -2)}</strong>
              : part,
          )}
        </p>
      )
    })
  }

  if (isLoading || !article) {
    return (
      <div>
        <PageHeader title="" back />
        <div className="px-4 pt-8 text-center text-muted">Загрузка...</div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="" back />
      <div className="px-4 space-y-4 pb-8">
        {/* Hero */}
        <div className="text-center py-4">
          <div className="text-5xl mb-3">{article.emoji}</div>
          <h1 className="font-display font-black text-xl leading-tight mb-2">{article.title}</h1>
          <div className="text-xs text-muted">{article.readTime} мин · +{article.xpReward} XP</div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {article.content && renderContent(article.content)}
        </div>
      </div>
    </div>
  )
}
