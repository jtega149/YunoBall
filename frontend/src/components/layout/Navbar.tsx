import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const defaultProfilePic = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.username || 'User') + '&background=0ea5e9&color=fff&size=128';

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Title - Enhanced */}
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-3 group relative"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 rounded-xl shadow-lg transform group-hover:scale-105 transition-all duration-300">
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  YunoBall
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation Links - Enhanced */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/testknowledge"
              className={`relative px-5 py-2.5 font-semibold rounded-xl transition-all duration-300 ${
                isActive('/testknowledge')
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/50'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-purple-600/10 dark:hover:from-purple-500/20 dark:hover:to-purple-600/20 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              🧠 Test Your Knowledge
            </Link>
            <Link
              to="/joindebate"
              className={`relative px-5 py-2.5 font-semibold rounded-xl transition-all duration-300 ${
                isActive('/joindebate')
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-blue-600/10 dark:hover:from-blue-500/20 dark:hover:to-blue-600/20 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              💬 Join a Debate
            </Link>
            <Link
              to="/createdebate"
              className={`relative px-5 py-2.5 font-semibold rounded-xl transition-all duration-300 ${
                isActive('/createdebate')
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/50'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-green-600/10 dark:hover:from-green-500/20 dark:hover:to-green-600/20 hover:text-green-600 dark:hover:text-green-400'
              }`}
            >
              ✨ Create a Debate
            </Link>
            <Link
              to="/leaderboards"
              className={`relative px-5 py-2.5 font-semibold rounded-xl transition-all duration-300 ${
                isActive('/leaderboards')
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/50'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-yellow-500/10 hover:to-yellow-600/10 dark:hover:from-yellow-500/20 dark:hover:to-yellow-600/20 hover:text-yellow-600 dark:hover:text-yellow-400'
              }`}
            >
              🏆 Leaderboards
            </Link>
          </div>

          {/* Profile Dropdown - Enhanced */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="relative focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
              <img
                src={user?.profilePicture || defaultProfilePic}
                alt={user?.username || 'User'}
                className="relative w-12 h-12 rounded-full border-3 border-primary-500 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-500/10 to-primary-600/10 dark:from-primary-500/20 dark:to-primary-600/20">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all flex items-center space-x-3 group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">⚙️</span>
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      toggleTheme();
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all flex items-center space-x-3 group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">{isDarkMode ? '☀️' : '🌙'}</span>
                    <span>{isDarkMode ? 'Switch to Light Mode' : 'Switch to Night Mode'}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/20 dark:hover:to-red-800/20 transition-all flex items-center space-x-3 group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu - Enhanced */}
      <div className="md:hidden border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50">
        <div className="flex flex-col space-y-2">
          <Link
            to="/testknowledge"
            className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              isActive('/testknowledge')
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-purple-500/10 dark:hover:bg-purple-500/20'
            }`}
          >
            🧠 Test Your Knowledge
          </Link>
          <Link
            to="/joindebate"
            className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              isActive('/joindebate')
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-blue-500/10 dark:hover:bg-blue-500/20'
            }`}
          >
            💬 Join a Debate
          </Link>
          <Link
            to="/createdebate"
            className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              isActive('/createdebate')
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-green-500/10 dark:hover:bg-green-500/20'
            }`}
          >
            ✨ Create a Debate
          </Link>
          <Link
            to="/leaderboards"
            className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              isActive('/leaderboards')
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-yellow-500/10 dark:hover:bg-yellow-500/20'
            }`}
          >
            🏆 Leaderboards
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
