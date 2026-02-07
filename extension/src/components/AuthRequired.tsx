import { ExternalLink } from 'lucide-react'

export function AuthRequired() {
    const handleOpenDashboard =() =>{
        chrome.tabs.create({
            url: 'http://localhost:5173/login',
        })
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
          <div className="max-w-sm w-full text-center">
            <h1 className="text-3xl font-bold mb-2">
              Welcome to <span className="text-primary-600">De</span>
              <span className="text-gray-900">Doup</span>
            </h1>
            
            <p className="text-gray-600 mb-6">Your intelligent Web acitivity tracker</p>
    
            <p className="text-base text-gray-700 mb-4">
              Want to start using?{' '}
              <button
                onClick={handleOpenDashboard}
                className="inline-flex items-center gap-1 text-primary-600 font-semibold transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5"
              >
                Login here
                <ExternalLink className="w-4 h-4" />
              </button>
            </p>
    
            <p className="text-sm text-gray-500 mt-8">
              Click to login to the dashboard and start tracking your web surfing
            </p>
          </div>
        </div>
      ) 

}