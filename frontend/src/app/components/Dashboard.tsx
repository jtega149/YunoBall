import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Button } from './ui/button';

interface DashboardProps {
  onLogout: () => void;
}

const navLinks = [
  { to: '/dashboard/home', label: 'Home' },
  { to: '/dashboard/join', label: 'Join Debate' },
  { to: '/dashboard/create', label: 'Create Debate' },
  { to: '/dashboard/leaderboards', label: 'Leaderboards' },
] as const;

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-2 rounded-md transition-colors ${
    isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
  }`;

export default function Dashboard({ onLogout }: DashboardProps) {
  const { pathname } = useLocation();
  const isRoomRoute = pathname.includes('/room/');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('room-page', isRoomRoute);
    document.body.classList.toggle('room-page', isRoomRoute);
    return () => {
      document.documentElement.classList.remove('room-page');
      document.body.classList.remove('room-page');
    };
  }, [isRoomRoute]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [mobileMenuOpen]);

  return (
    <div className={`min-h-screen flex flex-col ${isRoomRoute ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8" ref={menuRef}>
              <h1 className="text-xl sm:text-2xl tracking-tight text-gray-900">
                YunoBall
              </h1>

              {/* Desktop nav - hidden on small screens */}
              <div className="hidden md:flex gap-1">
                {navLinks.map(({ to, label }) => (
                  <NavLink key={to} to={to} className={navLinkClass}>
                    {label}
                  </NavLink>
                ))}
              </div>

              {/* Mobile dropdown button - only on small screens */}
              <div className="relative md:hidden">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMobileMenuOpen((o) => !o)}
                  className="gap-1.5"
                  aria-expanded={mobileMenuOpen}
                  aria-haspopup="true"
                >
                  <span className="sr-only">Menu</span>
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span>Menu</span>
                </Button>
                {mobileMenuOpen && (
                  <div className="absolute left-0 top-full mt-1 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg z-50">
                    {navLinks.map(({ to, label }) => (
                      <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => `text-sm ${navLinkClass({ isActive })}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button variant="outline" onClick={onLogout} className="shrink-0">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content - flex-1 so room can fill viewport below navbar; dark bg when in room to avoid white overscroll */}
      <main className={`flex-1 flex flex-col min-h-0 ${isRoomRoute ? 'bg-gray-950' : ''}`}>
        <div className="flex-1 flex flex-col min-h-0 max-w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
