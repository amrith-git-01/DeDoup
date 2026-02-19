import { User, Menu } from 'lucide-react';
import type { HeaderProps } from '../../types/layout';

export function Header({ username, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl backdrop-saturate-150 border-b border-gray-200/60 shadow-sm h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
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
              <span className="text-gray-900/90">Doup</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-gray-700/90 font-medium">
              Hey, {username || 'User'}
            </span>
            <div className="ui-hover-icon w-9 h-9 rounded-full bg-primary-100/80 backdrop-blur-sm flex items-center justify-center cursor-pointer border border-primary-200/30">
              <User className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
