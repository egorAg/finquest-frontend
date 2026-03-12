import { NavLink, useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'

const NAV_ITEMS = [
  { to: '/',           icon: '🏠' },
  { to: '/finances',   icon: '📊' },
  { to: '/game',       icon: '🎮' },
  { to: '/knowledge',  icon: '📚' },
]

export function BottomNav() {
  const navigate = useNavigate()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 h-[68px] px-2 pb-2"
      style={{ background: 'linear-gradient(to top, var(--color-bg) 75%, transparent)' }}
    >
      <div className="flex items-center justify-around h-full max-w-sm mx-auto">
        {NAV_ITEMS.slice(0, 2).map(({ to, icon }) => (
          <NavItem key={to} to={to} icon={icon} />
        ))}

        {/* Add transaction button */}
        <button
          onClick={() => navigate('/add-transaction')}
          className="flex items-center justify-center flex-shrink-0 font-black active:scale-95 transition-transform"
          style={{
            width: 52, height: 52, borderRadius: 18,
            background: 'linear-gradient(135deg, #4ADE80, #15803D)',
            fontSize: 26, color: '#fff', border: 'none',
            boxShadow: '0 8px 20px rgba(74,222,128,.35)',
            marginBottom: 8,
          }}
        >
          +
        </button>

        {NAV_ITEMS.slice(2).map(({ to, icon }) => (
          <NavItem key={to} to={to} icon={icon} />
        ))}
      </div>
    </nav>
  )
}

function NavItem({ to, icon }: { to: string; icon: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex items-center justify-center flex-1 py-2 rounded-[14px] transition-all',
          isActive ? 'bg-green/10' : 'opacity-45',
        )
      }
    >
      <span className="text-2xl leading-none">{icon}</span>
    </NavLink>
  )
}
