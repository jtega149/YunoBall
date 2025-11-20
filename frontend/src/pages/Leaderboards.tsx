import { useState } from 'react';
import Navbar from '../components/layout/Navbar';

interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  wins: number;
  debates: number;
  tests: number;
  avatar?: string;
}

const Leaderboards = () => {
  const [timeframe, setTimeframe] = useState<'all' | 'week' | 'month'>('all');
  const [category, setCategory] = useState<'overall' | 'sports' | 'music' | 'movies' | 'video-games'>('overall');

  const mockLeaderboard: LeaderboardEntry[] = [
    { rank: 1, username: 'DebateMaster', points: 15420, wins: 89, debates: 120, tests: 45 },
    { rank: 2, username: 'KnowledgeKing', points: 14230, wins: 76, debates: 98, tests: 67 },
    { rank: 3, username: 'TriviaTitan', points: 13890, wins: 82, debates: 110, tests: 52 },
    { rank: 4, username: 'ArgumentAce', points: 12980, wins: 71, debates: 95, tests: 38 },
    { rank: 5, username: 'QuizQueen', points: 12540, wins: 68, debates: 87, tests: 61 },
    { rank: 6, username: 'SportsSavant', points: 11890, wins: 65, debates: 92, tests: 43 },
    { rank: 7, username: 'MusicMaestro', points: 11450, wins: 59, debates: 78, tests: 55 },
    { rank: 8, username: 'CinemaCritic', points: 10980, wins: 54, debates: 85, tests: 41 },
    { rank: 9, username: 'GamingGuru', points: 10560, wins: 61, debates: 88, tests: 39 },
    { rank: 10, username: 'DebateDynamo', points: 10230, wins: 57, debates: 82, tests: 48 },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankGradient = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 via-yellow-500 to-yellow-600';
    if (rank === 2) return 'from-gray-300 via-gray-400 to-gray-500';
    if (rank === 3) return 'from-orange-400 via-orange-500 to-orange-600';
    return 'from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-primary-500/20 to-yellow-500/20 rounded-full blur-3xl"></div>
            <h1 className="relative text-5xl font-extrabold mb-2 bg-gradient-to-r from-yellow-600 via-primary-600 to-yellow-600 bg-clip-text text-transparent">
              Leaderboards 🏆
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            See who's dominating the YunoBall community
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-lg font-bold text-gray-700 dark:text-gray-300">Timeframe:</span>
            {(['all', 'week', 'month'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 capitalize ${
                  timeframe === tf
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-xl scale-105'
                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-primary-300 shadow-lg'
                }`}
              >
                {tf === 'all' ? 'All Time' : tf}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-lg font-bold text-gray-700 dark:text-gray-300">Category:</span>
            {(['overall', 'sports', 'music', 'movies', 'video-games'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 capitalize ${
                  category === cat
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-xl scale-105'
                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-primary-300 shadow-lg'
                }`}
              >
                {cat.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-primary-600/10 to-primary-500/10 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-primary-500/20 via-primary-600/20 to-primary-500/20">
                  <tr>
                    <th className="px-8 py-5 text-left text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-8 py-5 text-left text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-8 py-5 text-right text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-8 py-5 text-right text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                      Wins
                    </th>
                    <th className="px-8 py-5 text-right text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                      Debates
                    </th>
                    <th className="px-8 py-5 text-right text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                      Tests
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mockLeaderboard.map((entry) => (
                    <tr
                      key={entry.rank}
                      className={`hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-300 ${
                        entry.rank <= 3 ? `bg-gradient-to-r ${getRankGradient(entry.rank)}/20` : ''
                      }`}
                    >
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-3xl font-extrabold">
                          {getRankIcon(entry.rank)}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${entry.rank === 1 ? 'from-yellow-400 to-yellow-600' : entry.rank === 2 ? 'from-gray-300 to-gray-500' : entry.rank === 3 ? 'from-orange-400 to-orange-600' : 'from-primary-500 to-primary-600'} flex items-center justify-center text-white font-bold text-lg shadow-lg mr-4`}>
                            {entry.username[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="text-lg font-extrabold text-gray-900 dark:text-white">
                              {entry.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        <div className="text-lg font-extrabold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                          {entry.points.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {entry.wins}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {entry.debates}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {entry.tests}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Your Rank */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-primary-600/20 to-primary-500/20 rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-extrabold mb-2">Your Current Rank</h3>
                <p className="text-primary-100 text-lg">Keep participating to climb the leaderboard!</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-extrabold mb-2">#42</div>
                <div className="text-xl text-primary-100 font-semibold">1,240 points</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboards;
