import { Outlet } from 'react-router'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-latar">
      <Header />
      <main className="flex-1 overflow-x-hidden px-4 py-4 pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
