import { NavLink } from 'react-router'
import { Home, CalendarCheck, FileSpreadsheet, Wallet } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Beranda', icon: Home },
  { path: '/absensi', label: 'Absensi', icon: CalendarCheck },
  { path: '/nilai', label: 'Nilai', icon: FileSpreadsheet },
  { path: '/kas', label: 'Kas', icon: Wallet },
]

export function BottomNav() {
  return (
    <nav className="bg-surface border-divider fixed right-0 bottom-0 left-0 z-50 border-t pb-[env(safe-area-inset-bottom)]">
      <ul className="flex h-[56px] items-center justify-around">
        {navItems.map((item) => (
          <li key={item.path} className="h-full flex-1">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex h-full w-full flex-col items-center justify-center py-1 ${
                  isActive ? 'text-primary-600 font-semibold' : 'font-normal text-slate-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`rounded-full p-1 ${isActive ? 'bg-primary-50' : 'bg-transparent'}`}
                  >
                    <item.icon size={20} strokeWidth={1.75} />
                  </div>
                  <span className="font-heading mt-0.5 text-[11px] leading-none">{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
