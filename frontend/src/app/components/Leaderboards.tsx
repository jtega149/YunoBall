import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { leaderboard, type LeaderboardDto, type LeaderboardRow } from '../services/api';

const getRankBadgeVariant = (rank: number) => {
  if (rank === 1) return 'default';
  if (rank === 2) return 'secondary';
  if (rank === 3) return 'outline';
  return 'secondary';
};

export default function Leaderboards() {
  const [data, setData] = useState<LeaderboardDto | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await leaderboard();
        if (!cancelled) {
          setData(res);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load leaderboard');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const leaderboardData: LeaderboardRow[] = data?.top ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl text-gray-900 mb-2">Global Leaderboards</h2>
        <p className="text-gray-600">Top debaters by total wins. Your stats appear at the bottom.</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
      )}
      {loading && <p className="text-gray-500">Loading…</p>}

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Debaters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="grid grid-cols-6 gap-4 px-4 py-3 text-sm border-b">
              <div className="col-span-1">Rank</div>
              <div className="col-span-2">Username</div>
              <div className="col-span-1 text-center">Wins</div>
              <div className="col-span-1 text-center">Losses</div>
              <div className="col-span-1 text-center">Win Rate</div>
            </div>

            {leaderboardData.map((user) => (
              <div
                key={`${user.rank}-${user.username}`}
                className={`grid grid-cols-6 gap-4 px-4 py-4 items-center hover:bg-gray-50 rounded-lg transition-colors ${
                  user.rank <= 3 ? 'bg-gray-50' : ''
                }`}
              >
                <div className="col-span-1">
                  <Badge variant={getRankBadgeVariant(user.rank)}>#{user.rank}</Badge>
                </div>
                <div className="col-span-2">{user.username}</div>
                <div className="col-span-1 text-center text-green-600">{user.wins}</div>
                <div className="col-span-1 text-center text-red-600">{user.losses}</div>
                <div className="col-span-1 text-center">{user.winRate.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {data?.me && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Your stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Global rank</p>
                <p className="text-2xl font-semibold">#{data.me.rank}</p>
              </div>
              <div>
                <p className="text-gray-500">Username</p>
                <p className="text-lg font-medium">{data.me.username}</p>
              </div>
              <div>
                <p className="text-gray-500">Wins</p>
                <p className="text-2xl text-green-700">{data.me.wins}</p>
              </div>
              <div>
                <p className="text-gray-500">Losses</p>
                <p className="text-2xl text-red-700">{data.me.losses}</p>
              </div>
              <div>
                <p className="text-gray-500">Total debates</p>
                <p className="text-2xl">{data.me.totalDebates}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
