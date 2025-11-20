import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Debates Joined', value: '12', icon: '💬', color: 'from-blue-500 via-blue-600 to-blue-700', bgColor: 'bg-blue-500/10 dark:bg-blue-500/20' },
    { label: 'Knowledge Tests', value: '8', icon: '🧠', color: 'from-purple-500 via-purple-600 to-purple-700', bgColor: 'bg-purple-500/10 dark:bg-purple-500/20' },
    { label: 'Wins', value: '7', icon: '🏆', color: 'from-yellow-500 via-yellow-600 to-yellow-700', bgColor: 'bg-yellow-500/10 dark:bg-yellow-500/20' },
    { label: 'Points', value: '1,240', icon: '⭐', color: 'from-green-500 via-green-600 to-green-700', bgColor: 'bg-green-500/10 dark:bg-green-500/20' },
  ];

  const quickActions = [
    { title: 'Test Your Knowledge', description: 'Challenge yourself with trivia questions', link: '/testknowledge', icon: '🧠', color: 'from-purple-500 via-purple-600 to-purple-700', hoverColor: 'hover:from-purple-600 hover:via-purple-700 hover:to-purple-800' },
    { title: 'Join a Debate', description: 'Find and join active debates', link: '/joindebate', icon: '💬', color: 'from-blue-500 via-blue-600 to-blue-700', hoverColor: 'hover:from-blue-600 hover:via-blue-700 hover:to-blue-800' },
    { title: 'Create a Debate', description: 'Start your own debate topic', link: '/createdebate', icon: '✨', color: 'from-green-500 via-green-600 to-green-700', hoverColor: 'hover:from-green-600 hover:via-green-700 hover:to-green-800' },
    { title: 'Leaderboards', description: 'See top performers', link: '/leaderboards', icon: '🏆', color: 'from-yellow-500 via-yellow-600 to-yellow-700', hoverColor: 'hover:from-yellow-600 hover:via-yellow-700 hover:to-yellow-800' },
  ];

  const recentActivity = [
    { type: 'debate', text: 'Won debate: "Is Messi the GOAT?"', time: '2 hours ago', color: 'from-blue-500 to-blue-600' },
    { type: 'test', text: 'Completed: Sports Knowledge Test', time: '5 hours ago', color: 'from-purple-500 to-purple-600' },
    { type: 'debate', text: 'Joined debate: "Best Movie Genre"', time: '1 day ago', color: 'from-green-500 to-green-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section - Enhanced */}
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-primary-600/20 to-primary-500/20 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
            <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 bg-clip-text text-transparent">
              Welcome back, {user?.username}! 👋
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Ready to test your knowledge and join some debates?
            </p>
          </div>
        </div>

        {/* Stats Grid - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{stat.value}</p>
                </div>
                <div className={`text-5xl p-4 rounded-2xl ${stat.bgColor} transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions - Enhanced */}
        <div className="mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="bg-gradient-to-r from-primary-500 to-primary-600 w-1 h-8 rounded-full"></span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} ${action.hoverColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative p-6">
                  <div className={`bg-gradient-to-br ${action.color} w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    {action.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-white transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm group-hover:text-white/90 transition-colors">
                    {action.description}
                  </p>
                  <div className="absolute bottom-4 right-4 text-2xl opacity-0 group-hover:opacity-100 transform group-hover:translate-x-2 transition-all duration-300 text-white">
                    →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity & Interests - Enhanced */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-3xl">📊</span>
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${activity.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl transform group-hover:scale-110 transition-transform">
                      {activity.type === 'debate' ? '💬' : '🧠'}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium">{activity.text}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Interests */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-3xl">🎯</span>
              Your Interests
            </h2>
            {user?.interests?.categories && user.interests.categories.length > 0 ? (
              <div className="space-y-6">
                {user.interests.categories.map((category) => {
                  const specifics = user.interests?.specifics?.[category] || [];
                  return (
                    <div key={category} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 capitalize flex items-center gap-2">
                        <span className="text-2xl">
                          {category === 'sports' ? '⚽' : category === 'music' ? '🎵' : category === 'movies' ? '🎬' : '🎮'}
                        </span>
                        {category.replace('-', ' ')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {specifics.map((specific) => (
                          <span
                            key={specific}
                            className="px-4 py-2 bg-gradient-to-r from-primary-500/20 to-primary-600/20 dark:from-primary-500/30 dark:to-primary-600/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold border border-primary-500/30 hover:from-primary-500/30 hover:to-primary-600/30 hover:scale-105 transition-all cursor-default"
                          >
                            {specific}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">No interests selected yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
