import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Navbar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <Sidebar />
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  )
}
