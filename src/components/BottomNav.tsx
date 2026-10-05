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
    <nav className="fixed bottom-0 left-0 right-0 bg-permukaan border-t border-garis pb-[env(safe-area-inset-bottom)] z-50">
      <ul className="flex justify-around items-center h-[56px]">
        {navItems.map((item) => (
          <li key={item.path} className="flex-1 h-full">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center h-full w-full py-1 ${
                  isActive ? 'text-biru-600 font-semibold' : 'text-slate-600 font-normal'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-full ${isActive ? 'bg-biru-50' : 'bg-transparent'}`}>
                    <item.icon size={20} strokeWidth={1.75} />
                  </div>
                  <span className="text-[11px] font-judul mt-0.5 leading-none">{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
