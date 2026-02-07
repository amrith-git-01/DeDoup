import { User, ExternalLink } from 'lucide-react'
import { useAppSelector } from '../../store/hooks'

export function Header() {
  const username = useAppSelector((state) => state.auth.user?.username)
  
  const handleOpenDashboard = () => {
    chrome.tabs.create({
      url: 'http://localhost:5173/dashboard',
    })
  }
  
  return (
    <header className="bg-white border-b border-gray-200 w-full">
      <div className="px-4 py-3 flex justify-between items-center">
          <button
          onClick={handleOpenDashboard}
          className="flex items-center gap-2 text-lg font-bold cursor-pointer"
        >
          <span className="text-gray-900"><span className="text-primary-600">De</span>Doup</span>
          <ExternalLink className="w-4 h-4 text-primary-600" />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700 font-medium">
            Hey, {username || 'User'}
          </span>
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600" />
          </div>
        </div>
      </div>
    </header>
  )
}