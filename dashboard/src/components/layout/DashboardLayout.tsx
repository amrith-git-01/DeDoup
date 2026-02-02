import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { useNavigate } from 'react-router-dom'
import { clearAuth } from '../../store/slices/authSlice'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function DashboardLayout() {
  const { user } = useAppSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    dispatch(clearAuth())
    navigate('/login')
  }

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header username={user?.username} onMenuClick={toggleSidebar} />

      <div className="flex">
        <Sidebar 
          onLogout={handleLogout} 
          isOpen={isSidebarOpen} 
          onClose={closeSidebar} 
        />

        {/* Main Content - Outlet renders child routes here */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}