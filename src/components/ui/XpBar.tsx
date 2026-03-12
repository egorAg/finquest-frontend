import { levelName } from '../../lib/utils'

interface XpBarProps {
  xp: number
  xpToNext: number
  level: number
  streakDays?: number
  className?: string
}

export function XpBar({ xp, xpToNext, level, streakDays = 0, className }: XpBarProps) {
  const pct = Math.min((xp / xpToNext) * 100, 100)

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border ${className ?? ''}`}
      style={{
        padding: '18px 20px 16px',
        background: 'linear-gradient(135deg, #1B3A2D 0%, #0F2218 100%)',
        borderColor: 'rgba(74,222,128,.18)',
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          top: -40, right: -40, width: 160, height: 160,
          background: 'radial-gradient(circle, rgba(74,222,128,.18) 0%, transparent 70%)',
        }}
      />

      {/* Top row: level badge + streak */}
      <div className="flex items-center justify-between mb-2.5 relative">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center font-black"
            style={{
              width: 42, height: 42, borderRadius: 14, flexShrink: 0,
              background: 'linear-gradient(135deg, #4ADE80, #15803D)',
              color: '#052e16', fontSize: 18,
              boxShadow: '0 4px 14px rgba(74,222,128,.35)',
            }}
          >
            {level}
          </div>
          <div className="flex flex-col">
            <span
              className="font-bold uppercase font-sans"
              style={{ fontSize: 11, letterSpacing: '.08em', color: 'rgba(74,222,128,.6)' }}
            >
              Уровень
            </span>
            <span className="font-black text-text" style={{ fontSize: 15 }}>
              {levelName(level)}
            </span>
          </div>
        </div>

        <div
          className="flex items-center gap-1 rounded-full font-extrabold border"
          style={{
            padding: '5px 11px', fontSize: 12,
            background: 'rgba(249,115,22,.15)',
            color: '#F97316',
            borderColor: 'rgba(249,115,22,.25)',
          }}
        >
          🔥 {streakDays} дн.
        </div>
      </div>

      {/* XP bar labels */}
      <div className="flex justify-between mb-1.5 relative">
        <span className="font-extrabold text-green" style={{ fontSize: 13 }}>{xp} XP</span>
        <span className="font-semibold font-sans" style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>
          до ур. {level + 1} → {xpToNext} XP
        </span>
      </div>

      {/* XP bar */}
      <div
        className="rounded-full overflow-hidden relative"
        style={{ height: 10, background: 'rgba(255,255,255,.08)' }}
      >
        <div
          className="h-full rounded-full relative overflow-hidden"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #4ADE80, #86EFAC)',
          }}
        >
          <div className="xp-bar-shine" />
        </div>
      </div>
    </div>
  )
}
