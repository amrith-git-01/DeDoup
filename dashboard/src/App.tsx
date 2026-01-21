function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                DeDoup
              </h1>
            </div>
            <nav className="flex items-center space-x-4">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Settings
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Welcome to DeDoup Dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            Your intelligent download manager with AI-powered organization.
          </p>
          
          <div className="flex space-x-4">
            <button className="btn-primary">
              Get Started
            </button>
            <button className="btn-secondary">
              Learn More
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App