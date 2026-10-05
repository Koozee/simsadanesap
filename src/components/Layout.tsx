import { Outlet } from 'react-router'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

export function Layout() {
  return (
    <div className="bg-latar flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 overflow-x-hidden px-4 py-4 pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
