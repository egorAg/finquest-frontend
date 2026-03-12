import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store'
import { PageHeader } from '../components/layout/PageHeader'
import { levelName } from '../lib/utils'

// Total XP required to REACH each level
// xpToNext(lvl) = lvl * 200, so totalToReach(n) = 100 * (n-1) * n
function totalXpToReach(level: number) {
  return 100 * (level - 1) * level
}

const LEVEL_EMOJIS = ['', '🌱', '🐣', '📊', '🔍', '📈', '⚙️', '🧘', '🌟', '🔮', '🏛️']

const LEVELS = Array.from({ length: 10 }, (_, i) => {
  const lvl = i + 1
  return {
    level: lvl,
    name: levelName(lvl),
    emoji: LEVEL_EMOJIS[lvl] ?? '⭐',
    totalToReach: totalXpToReach(lvl),
    xpForLevel: lvl * 200, // XP needed within this level to advance
  }
})

export function LevelProgress() {
  const navigate = useNavigate()
  const { user } = useAppStore()

  if (!user) return null

  const totalEarned = user.totalXpEarned
  const currentLevel = user.level

  return (
    <div>
      <PageHeader title="Уровни" back />

      <div className="px-[18px] pt-4 space-y-[10px] pb-8">

        {/* Current level banner */}
        <div
          className="rounded-2xl border p-4 flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, #1B3A2D 0%, #0F2218 100%)',
            borderColor: 'rgba(74,222,128,.25)',
          }}
        >
          <div
            className="flex items-center justify-center font-black flex-shrink-0"
            style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #4ADE80, #15803D)',
              color: '#052e16', fontSize: 20,
              boxShadow: '0 4px 14px rgba(74,222,128,.35)',
            }}
          >
            {currentLevel}
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(74,222,128,.6)' }}>
              Твой уровень
            </div>
            <div className="font-black text-text text-base">{levelName(currentLevel)}</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,.35)' }}>
              {totalEarned} XP заработано всего
            </div>
          </div>
        </div>

        {/* Level list */}
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,.06)', background: '#161B27' }}>
          {LEVELS.map((lvl, i) => {
            const isCurrentLevel = lvl.level === currentLevel
            const isUnlocked = lvl.level < currentLevel
            const isLocked = lvl.level > currentLevel

            // Progress within current level
            const progressPct = isCurrentLevel
              ? Math.min((user.xp / user.xpToNext) * 100, 100)
              : isUnlocked ? 100 : 0

            return (
              <div
                key={lvl.level}
                className={`px-4 py-3 border-b border-border last:border-0 ${isCurrentLevel ? 'bg-green/5' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {/* Level badge */}
                  <div
                    className="flex items-center justify-center font-black flex-shrink-0"
                    style={{
                      width: 38, height: 38, borderRadius: 11,
                      background: isUnlocked
                        ? 'rgba(74,222,128,.2)'
                        : isCurrentLevel
                          ? 'linear-gradient(135deg, #4ADE80, #15803D)'
                          : 'rgba(255,255,255,.06)',
                      color: isUnlocked ? '#4ADE80' : isCurrentLevel ? '#052e16' : 'rgba(255,255,255,.3)',
                      fontSize: 14,
                    }}
                  >
                    {isUnlocked ? '✓' : lvl.level}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontSize: 14 }}>{lvl.emoji}</span>
                      <span
                        className={`font-bold text-sm ${isCurrentLevel ? 'text-green' : isLocked ? 'text-muted' : 'text-text'}`}
                      >
                        {lvl.name}
                      </span>
                      {isCurrentLevel && (
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                          style={{ background: 'rgba(74,222,128,.15)', color: '#4ADE80', fontSize: 10 }}
                        >
                          сейчас
                        </span>
                      )}
                    </div>

                    {/* XP threshold label */}
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,.3)' }}>
                      {lvl.totalToReach === 0 ? 'Начальный уровень' : `от ${lvl.totalToReach.toLocaleString('ru-RU')} XP`}
                    </div>

                    {/* Progress bar for current level */}
                    {isCurrentLevel && (
                      <div className="mt-2">
                        <div
                          className="rounded-full overflow-hidden"
                          style={{ height: 5, background: 'rgba(255,255,255,.08)' }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${progressPct}%`,
                              background: 'linear-gradient(90deg, #4ADE80, #86EFAC)',
                            }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-green font-bold">{user.xp} XP</span>
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,.3)' }}>
                            {user.xpToNext} XP до ур. {currentLevel + 1}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: level number small */}
                  {!isCurrentLevel && (
                    <span
                      className="text-xs font-bold flex-shrink-0"
                      style={{ color: isLocked ? 'rgba(255,255,255,.2)' : 'rgba(74,222,128,.5)' }}
                    >
                      Ур. {lvl.level}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* XP earning tips */}
        <div className="rounded-2xl border p-4" style={{ borderColor: 'rgba(255,255,255,.06)', background: '#161B27' }}>
          <div className="font-bold text-sm mb-3">Как зарабатывать XP</div>
          <div className="space-y-2">
            {[
              { emoji: '💸', label: 'Запись транзакции', xp: '+10 XP' },
              { emoji: '🆕', label: 'Первая транзакция', xp: '+30 XP' },
              { emoji: '🎯', label: 'Достижение цели', xp: '+100 XP' },
              { emoji: '🔥', label: 'Стрик 7 дней', xp: '+70 XP' },
              { emoji: '🏆', label: 'Стрик 30 дней', xp: '+300 XP' },
              { emoji: '📚', label: 'Статья базы знаний', xp: '+XP' },
              { emoji: '⚡', label: 'Выполнение челленджа', xp: '+XP' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 15 }}>{item.emoji}</span>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,.6)' }}>{item.label}</span>
                </div>
                <span className="text-xs font-bold text-yellow">{item.xp}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
