import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store'
import { updateMe } from '../api'

const SLIDES = [
  {
    glow1: 'rgba(74,222,128,.18)',
    glow2: 'rgba(74,222,128,.09)',
    accent: '#4ADE80',
    accentBg: 'rgba(74,222,128,.12)',
    accentBorder: 'rgba(74,222,128,.25)',
    tag: '💰 Учёт финансов',
    title: ['Контролируй каждую ', 'копейку'],
    desc: 'Фиксируй доходы и расходы по категориям — и смотри куда уходят деньги в наглядной аналитике',
    btnGradient: 'linear-gradient(135deg, #4ADE80, #15803D)',
    btnColor: '#052e16',
    btnShadow: 'rgba(74,222,128,.35)',
  },
  {
    glow1: 'rgba(250,204,21,.14)',
    glow2: 'rgba(167,139,250,.10)',
    accent: '#FACC15',
    accentBg: 'rgba(250,204,21,.12)',
    accentBorder: 'rgba(250,204,21,.25)',
    tag: '🎮 Геймификация',
    title: ['Зарабатывай ', 'опыт', ' и прокачивай уровень'],
    desc: 'Ачивки, сезонные рейтинги и ежедневные челленджи превращают финансовую дисциплину в игру',
    btnGradient: 'linear-gradient(135deg, #FACC15, #F97316)',
    btnColor: '#1a0a00',
    btnShadow: 'rgba(250,204,21,.35)',
  },
  {
    glow1: 'rgba(56,189,248,.14)',
    glow2: 'rgba(244,114,182,.09)',
    accent: '#38BDF8',
    accentBg: 'rgba(56,189,248,.12)',
    accentBorder: 'rgba(56,189,248,.25)',
    tag: '👥 Совместный бюджет',
    title: ['Ведите финансы ', 'вместе', ' — семьёй или с друзьями'],
    desc: 'Создавай пространства, приглашай участников и распределяй роли — общий бюджет всегда под контролем',
    btnGradient: 'linear-gradient(135deg, #38BDF8, #0284C7)',
    btnColor: '#0c1a26',
    btnShadow: 'rgba(56,189,248,.35)',
  },
]

function IllusFinance() {
  return (
    <div style={{ position: 'relative', width: 300, height: 250 }}>
      {/* Main card */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 230, background: '#161B27',
        borderRadius: 20, padding: '16px 18px',
        border: '1px solid rgba(255,255,255,.07)',
        boxShadow: '0 20px 48px rgba(0,0,0,.5)',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>Баланс за май</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#F0F4FF', marginBottom: 12 }}>₽ 84 500</div>
        {[
          { dot: '#4ADE80', name: 'Зарплата', val: '+95 000 ₽', color: '#4ADE80' },
          { dot: '#F97316', name: 'Продукты', val: '−8 400 ₽', color: '#F97316' },
          { dot: '#38BDF8', name: 'Транспорт', val: '−2 100 ₽', color: '#38BDF8' },
        ].map((row) => (
          <div key={row.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,.04)', borderRadius: 9, padding: '6px 9px', marginBottom: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: row.dot }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.65)' }}>{row.name}</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: row.color }}>{row.val}</span>
          </div>
        ))}
      </div>
      {/* Floating badges */}
      <div style={{
        position: 'absolute', top: 10, right: 0,
        background: 'linear-gradient(135deg,#166534,#14532D)',
        border: '1px solid rgba(74,222,128,.3)',
        borderRadius: 13, padding: '8px 12px',
        fontSize: 11, fontWeight: 800, color: '#4ADE80',
        display: 'flex', alignItems: 'center', gap: 6,
        animation: 'obFloat 5.5s ease-in-out infinite',
        boxShadow: '0 8px 24px rgba(0,0,0,.3)',
      }}>↑ Доход +95K</div>
      <div style={{
        position: 'absolute', bottom: 20, left: 0,
        background: 'linear-gradient(135deg,#7F1D1D,#6B1616)',
        border: '1px solid rgba(249,115,22,.3)',
        borderRadius: 13, padding: '8px 12px',
        fontSize: 11, fontWeight: 800, color: '#F97316',
        display: 'flex', alignItems: 'center', gap: 6,
        animation: 'obFloat 6.5s ease-in-out infinite',
        animationDelay: '-2s',
        boxShadow: '0 8px 24px rgba(0,0,0,.3)',
      }}>↓ Расход −10.5K</div>
    </div>
  )
}

function IllusGame() {
  const r = 70, circ = 2 * Math.PI * r
  const progress = 0.8
  return (
    <div style={{ position: 'relative', width: 300, height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* XP Ring */}
      <div style={{ position: 'relative', width: 156, height: 156, flexShrink: 0 }}>
        <svg viewBox="0 0 164 164" style={{ width: '100%', height: '100%' }}>
          <circle cx="82" cy="82" r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="12" />
          <circle cx="82" cy="82" r={r} fill="none" stroke="url(#xpGrad)" strokeWidth="12"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
            strokeLinecap="round" transform="rotate(-90 82 82)" />
          <defs>
            <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
          </defs>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: '#F0F4FF', lineHeight: 1 }}>12</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Уровень</div>
        </div>
      </div>
      {/* Achievement badges */}
      {[
        { icon: '🏆', name: 'Первый бюджет', xp: '+50 XP', style: { top: 0, left: 0 }, delay: '0s', dur: '5s', color: '#FACC15', border: 'rgba(250,204,21,.25)' },
        { icon: '💎', name: 'Месяц в плюсе', xp: '+120 XP', style: { bottom: 14, right: 0 }, delay: '-2.5s', dur: '6.5s', color: '#4ADE80', border: 'rgba(74,222,128,.25)' },
        { icon: '⚡', name: 'Быстрый старт', xp: '+30 XP', style: { top: 24, right: 14 }, delay: '-1s', dur: '7s', color: '#A78BFA', border: 'rgba(167,139,250,.25)' },
      ].map((b) => (
        <div key={b.name} style={{
          position: 'absolute', ...b.style,
          background: '#1A1F2E', border: `1px solid ${b.border}`,
          borderRadius: 13, padding: '8px 11px',
          display: 'flex', alignItems: 'center', gap: 7,
          animation: `obFloat ${b.dur} ease-in-out infinite`,
          animationDelay: b.delay,
          boxShadow: '0 8px 24px rgba(0,0,0,.3)',
        }}>
          <span style={{ fontSize: 17 }}>{b.icon}</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: b.color }}>{b.name}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{b.xp}</div>
          </div>
        </div>
      ))}
      {/* Streak */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        background: '#1A1F2E', border: '1px solid rgba(249,115,22,.25)',
        borderRadius: 100, padding: '6px 14px',
        fontSize: 12, fontWeight: 800, color: '#F97316',
        whiteSpace: 'nowrap',
      }}>🔥 7 дней подряд</div>
    </div>
  )
}

function IllusShared() {
  return (
    <div style={{ position: 'relative', width: 300, height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: 230, background: '#161B27',
        borderRadius: 20, padding: '15px 17px',
        border: '1px solid rgba(255,255,255,.07)',
        boxShadow: '0 20px 48px rgba(0,0,0,.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#F0F4FF' }}>Семья 🏠</span>
          <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(56,189,248,.15)', color: '#38BDF8', borderRadius: 100, padding: '2px 8px' }}>Совместное</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#F0F4FF', marginBottom: 10 }}>₽ 124 800</div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          {['😊', '👩', '👦'].map((av, i) => (
            <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, marginRight: -5, border: '2px solid #161B27', background: ['linear-gradient(135deg,#4ADE80,#16A34A)', 'linear-gradient(135deg,#F472B6,#DB2777)', 'linear-gradient(135deg,#38BDF8,#0284C7)'][i] }}>
              {av}
            </div>
          ))}
          <div style={{ fontSize: 10, fontWeight: 800, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.5)', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>+1</div>
        </div>
        {[
          { emoji: '🛒', name: 'Продукты', who: 'Анна', val: '−4 200 ₽', color: '#F97316' },
          { emoji: '💼', name: 'Зарплата', who: 'Михаил', val: '+65 000 ₽', color: '#4ADE80' },
        ].map((op) => (
          <div key={op.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,.04)', borderRadius: 9, padding: '6px 9px', marginBottom: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 13 }}>{op.emoji}</span>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)' }}>{op.name}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{op.who}</div>
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: op.color }}>{op.val}</span>
          </div>
        ))}
      </div>
      {/* Floating badges */}
      <div style={{
        position: 'absolute', top: 8, right: 0,
        background: 'linear-gradient(135deg,#1e1533,#2a1f45)',
        border: '1px solid rgba(167,139,250,.3)',
        borderRadius: 13, padding: '8px 12px',
        fontSize: 11, fontWeight: 800, color: '#A78BFA',
        display: 'flex', alignItems: 'center', gap: 7,
        animation: 'obFloat 5.5s ease-in-out infinite',
        boxShadow: '0 8px 24px rgba(0,0,0,.3)',
      }}>
        <span style={{ fontSize: 15 }}>👥</span>
        <div>
          <div>Пригласить</div>
          <div style={{ fontSize: 10, opacity: .6 }}>по ссылке</div>
        </div>
      </div>
      <div style={{
        position: 'absolute', bottom: 16, left: 0,
        background: 'linear-gradient(135deg,#1a2215,#1f2d18)',
        border: '1px solid rgba(74,222,128,.25)',
        borderRadius: 13, padding: '8px 12px',
        fontSize: 11, fontWeight: 800, color: '#4ADE80',
        display: 'flex', alignItems: 'center', gap: 7,
        animation: 'obFloat 6s ease-in-out infinite',
        animationDelay: '-3s',
        boxShadow: '0 8px 24px rgba(0,0,0,.3)',
      }}>
        <span style={{ fontSize: 15 }}>🎯</span>
        <div>
          <div>Совместный челлендж</div>
          <div style={{ fontSize: 10, opacity: .6 }}>7 дней без доставки</div>
        </div>
      </div>
    </div>
  )
}

const ILLUS = [IllusFinance, IllusGame, IllusShared]

export function Onboarding() {
  const navigate = useNavigate()
  const { setUser } = useAppStore()
  const [step, setStep] = useState(0)
  const slide = SLIDES[step]

  const finish = () => {
    updateMe({ onboardingDone: true }).then(setUser).catch(() => {})
    navigate('/', { replace: true })
  }

  const next = () => step < 2 ? setStep(step + 1) : finish()
  const back = () => setStep(step - 1)

  const Illus = ILLUS[step]

  return (
    <div className="h-dvh flex flex-col overflow-hidden" style={{ background: '#0D1117', position: 'relative' }}>
      <style>{`
        @keyframes obFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
      `}</style>

      {/* Background glows */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 380px 300px at 50% -60px, ${slide.glow1} 0%, transparent 65%)`, transition: 'background .4s' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 240px 200px at 90% 75%, ${slide.glow2} 0%, transparent 60%)`, transition: 'background .4s' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      {/* Top bar */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 24px 14px' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {SLIDES.map((_, i) => (
            <div key={i} style={{
              height: 6, borderRadius: 3,
              width: i === step ? 28 : 6,
              background: i === step ? slide.accent : 'rgba(255,255,255,.12)',
              transition: 'all .4s cubic-bezier(.34,1.56,.64,1)',
            }} />
          ))}
        </div>
        <button type="button" onClick={finish} style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.35)', background: 'none', border: 'none', padding: '6px 0' }}>
          Пропустить
        </button>
      </div>

      {/* Illustration */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 5 }}>
        <Illus />
      </div>

      {/* Text */}
      <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', padding: '0 28px 20px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          borderRadius: 100, padding: '5px 14px', marginBottom: 12,
          fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase',
          background: slide.accentBg, border: `1px solid ${slide.accentBorder}`, color: slide.accent,
        }}>
          {slide.tag}
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#F0F4FF', lineHeight: 1.25, marginBottom: 10, letterSpacing: '-.3px' }}>
          {slide.title.map((part, i) =>
            i % 2 === 1
              ? <span key={i} style={{ color: slide.accent }}>{part}</span>
              : <span key={i}>{part}</span>
          )}
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,.42)', fontFamily: 'Nunito Sans, sans-serif' }}>
          {slide.desc}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ position: 'relative', zIndex: 5, display: 'flex', gap: 12, padding: '0 24px 44px' }}>
        {step > 0 && (
          <button
            type="button"
            onClick={back}
            style={{
              width: 56, borderRadius: 18, border: 'none', fontSize: 20,
              background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            ←
          </button>
        )}
        <button
          type="button"
          onClick={next}
          style={{
            flex: 1, padding: 17, borderRadius: 18, border: 'none',
            fontSize: 15, fontWeight: 900, cursor: 'pointer',
            background: slide.btnGradient, color: slide.btnColor,
            boxShadow: `0 8px 24px ${slide.btnShadow}`,
          }}
        >
          {step < 2 ? 'Далее →' : 'Начать →'}
        </button>
      </div>
    </div>
  )
}
