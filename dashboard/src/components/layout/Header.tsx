import { User, Menu } from 'lucide-react'

interface HeaderProps {
  username?: string
  onMenuClick?: () => void
}

export function Header({ username, onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <h1 className="text-xl font-bold">
  <span className="text-primary-600">De</span>
  <span className="text-gray-900">Doup</span>
</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-gray-700 font-medium">
              Hey, {username || 'User'}
            </span>
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center cursor-pointer transition-all duration-200 ease-out hover:scale-110 active:scale-95 origin-center transform-gpu">
  <User className="w-5 h-5 text-primary-600" />
</div>
          </div>
        </div>
      </div>
    </header>
  )
}