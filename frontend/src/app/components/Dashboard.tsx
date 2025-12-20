import { Outlet, NavLink } from 'react-router-dom';
import { Button } from './ui/button';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl tracking-tight text-gray-900">
                YunoBall
              </h1>
              
              <div className="flex gap-1">
                <NavLink
                  to="/dashboard/home"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/dashboard/join"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  Join Debate
                </NavLink>
                <NavLink
                  to="/dashboard/create"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  Create Debate
                </NavLink>
                <NavLink
                  to="/dashboard/leaderboards"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  Leaderboards
                </NavLink>
              </div>
            </div>

            <Button variant="outline" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
