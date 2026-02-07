import { NavLink } from 'react-router-dom'
import { Download, Settings, LogOut } from 'lucide-react'
import clsx from 'clsx'
import { useAppDispatch } from '../../store/hooks'
import { clearAuth } from '../../store/slices/authSlice'

export function Sidebar() {
  const dispatch = useAppDispatch()
  const navItems = [
    { to: '/', icon: Download, label: 'Downloads' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]

  const handleLogout = () => {
    chrome.storage.sync.remove(['authToken', 'user', 'isAuthenticated'])
    dispatch(clearAuth())
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200',
                'text-gray-700 hover:bg-gray-100 hover:text-primary-600',
                isActive && 'bg-primary-50 text-primary-600'
              )
            }
            title={item.label}
          >
            {({ isActive }) => (
              <item.icon className={clsx('w-5 h-5', isActive && 'text-primary-600')} />
            )}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="ml-auto flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  )
}