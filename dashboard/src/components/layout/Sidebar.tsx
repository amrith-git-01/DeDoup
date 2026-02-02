import { NavLink } from 'react-router-dom'
import { Home, Download, Settings, LogOut, X } from 'lucide-react'
import clsx from 'clsx'

interface SidebarProps {
  onLogout?: () => void
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ onLogout, isOpen = true, onClose }: SidebarProps) {
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/downloads', icon: Download, label: 'Downloads' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]

  const handleNavClick = () => {
    if (onClose) onClose()
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-50',
          'w-55 bg-white border-r border-gray-200',
          'transform transition-transform duration-300 ease-in-out lg:transform-none',
          'min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-4rem)]',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-lg origin-center',
                    'transition-all duration-200 ease-out',
                    'transform-gpu [backface-visibility:hidden] will-change-transform',
                    'text-gray-700 hover:bg-gray-50 hover:text-primary-600 hover:scale-[1.02] active:scale-[0.98]',
                    isActive && 'bg-primary-50 text-primary-600 font-medium'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={clsx('w-5 h-5', isActive && 'text-primary-600')} />
                    <span className="text-base font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg origin-center mt-auto",
                "transition-all duration-200 ease-out",
                "transform-gpu [backface-visibility:hidden] will-change-transform",
                "text-gray-700 hover:bg-red-50 hover:text-red-600 hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              <LogOut className="w-5 h-5" />
              <span className="text-base font-medium">Logout</span>
            </button>
          )}
        </nav>
      </aside>
    </>
  )
}