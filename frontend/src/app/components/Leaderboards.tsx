import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

// Mock data - In production, this will come from your Spring Boot backend API
const leaderboardData = [
  {
    rank: 1,
    username: 'DebateMaster99',
    wins: 47,
    losses: 12,
    totalDebates: 59,
    winRate: 79.7
  },
  {
    rank: 2,
    username: 'LogicWarrior',
    wins: 42,
    losses: 15,
    totalDebates: 57,
    winRate: 73.7
  },
  {
    rank: 3,
    username: 'RhetoricalGenius',
    wins: 38,
    losses: 10,
    totalDebates: 48,
    winRate: 79.2
  },
  {
    rank: 4,
    username: 'ArgumentAce',
    wins: 35,
    losses: 18,
    totalDebates: 53,
    winRate: 66.0
  },
  {
    rank: 5,
    username: 'PersuasionPro',
    wins: 33,
    losses: 14,
    totalDebates: 47,
    winRate: 70.2
  },
  {
    rank: 6,
    username: 'DebateChamp',
    wins: 31,
    losses: 11,
    totalDebates: 42,
    winRate: 73.8
  },
  {
    rank: 7,
    username: 'ReasonableOne',
    wins: 29,
    losses: 16,
    totalDebates: 45,
    winRate: 64.4
  },
  {
    rank: 8,
    username: 'EloquentSpeaker',
    wins: 28,
    losses: 13,
    totalDebates: 41,
    winRate: 68.3
  },
  {
    rank: 9,
    username: 'ThinkTankPro',
    wins: 26,
    losses: 12,
    totalDebates: 38,
    winRate: 68.4
  },
  {
    rank: 10,
    username: 'WittyDebater',
    wins: 24,
    losses: 14,
    totalDebates: 38,
    winRate: 63.2
  }
];

const getRankBadgeVariant = (rank: number) => {
  if (rank === 1) return 'default';
  if (rank === 2) return 'secondary';
  if (rank === 3) return 'outline';
  return 'secondary';
};

export default function Leaderboards() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl text-gray-900 mb-2">Global Leaderboards</h2>
        <p className="text-gray-600">Top debaters ranked by total wins</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Debaters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {/* Header */}
            <div className="grid grid-cols-6 gap-4 px-4 py-3 text-sm border-b">
              <div className="col-span-1">Rank</div>
              <div className="col-span-2">Username</div>
              <div className="col-span-1 text-center">Wins</div>
              <div className="col-span-1 text-center">Losses</div>
              <div className="col-span-1 text-center">Win Rate</div>
            </div>

            {/* Leaderboard Rows */}
            {leaderboardData.map((user) => (
              <div
                key={user.rank}
                className={`grid grid-cols-6 gap-4 px-4 py-4 items-center hover:bg-gray-50 rounded-lg transition-colors ${
                  user.rank <= 3 ? 'bg-gray-50' : ''
                }`}
              >
                <div className="col-span-1">
                  <Badge variant={getRankBadgeVariant(user.rank)}>
                    #{user.rank}
                  </Badge>
                </div>
                <div className="col-span-2">
                  {user.username}
                </div>
                <div className="col-span-1 text-center text-green-600">
                  {user.wins}
                </div>
                <div className="col-span-1 text-center text-red-600">
                  {user.losses}
                </div>
                <div className="col-span-1 text-center">
                  {user.winRate.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Debates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">
              {leaderboardData.reduce((sum, user) => sum + user.totalDebates, 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Across all users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{leaderboardData[0].username}</p>
            <p className="text-sm text-gray-500 mt-1">
              {leaderboardData[0].totalDebates} total debates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Highest Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">
              {Math.max(...leaderboardData.map(u => u.winRate)).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {leaderboardData.find(u => u.winRate === Math.max(...leaderboardData.map(u => u.winRate)))?.username}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
