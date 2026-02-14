import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { clearAuth } from '../../store/slices/authSlice';

export function Navbar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(clearAuth());
    navigate('/login');
  };

  const navItems = [
    { to: '/home', label: 'Home' },
    { to: '/downloads', label: 'Downloads' },
    { to: '/settings', label: 'Settings' },
  ];

  return (
    <div className="sticky top-16 z-40 bg-white/50 backdrop-blur-xl backdrop-saturate-150 border-b border-gray-200/60 flex-none">
      <div className="w-full px-12 sm:px-14 lg:px-16">
        <div className="flex items-center h-14">
          <nav className="flex items-center gap-4 w-full">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative flex flex-col items-center px-3 py-2 text-sm font-medium cursor-pointer transition-colors duration-200 ${
                    isActive ? 'text-primary-600' : 'text-gray-600/90 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="group flex flex-col items-center relative">
                    <span className="drop-shadow-sm">{item.label}</span>
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600 rounded-full shadow-sm" />
                    )}
                    <span
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-full transition-all duration-200 ease-out bg-primary-600/90 rounded-full origin-center"
                      style={{ maxWidth: isActive ? 0 : '100%' }}
                    />
                  </div>
                )}
              </NavLink>
            ))}

            <button
              onClick={handleLogout}
              className="relative flex flex-col items-center px-3 py-2 text-sm font-medium text-gray-600/90 hover:text-red-600 cursor-pointer ml-auto transition-colors duration-200"
            >
              <div className="group flex flex-col items-center relative">
                <span className="drop-shadow-sm">Logout</span>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-full transition-all duration-200 ease-out bg-red-500/90 rounded-full origin-center" />
              </div>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
