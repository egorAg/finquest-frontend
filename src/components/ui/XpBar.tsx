interface XpBarProps {
  xp: number
  xpToNext: number
  level: number
  className?: string
}

export function XpBar({ xp, xpToNext, level, className }: XpBarProps) {
  const pct = Math.min((xp / xpToNext) * 100, 100)
  return (
    <div className={className}>
      <div className="flex justify-between text-xs text-muted mb-1">
        <span>Ур. {level}</span>
        <span>{xp} / {xpToNext} XP</span>
      </div>
      <div className="h-2 bg-card2 rounded-full overflow-hidden">
        <div
          className="h-full bg-green rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
