import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export function SettingsLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isNested = location.pathname !== '/settings' && location.pathname !== '/settings/';

  return (
    <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
      {isNested && (
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg cursor-pointer"
          aria-label="Back to settings"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to settings
        </button>
      )}

      {/* List of cards (index) or nested page content – full width for nested pages */}
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
}
