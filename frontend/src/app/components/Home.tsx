import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { myDebateHistory, recommendedDebates, type DebateHistoryDto, type DebateRoomDto } from '../services/api';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

export default function Home() {
  const [past, setPast] = useState<DebateHistoryDto[]>([]);
  const [ongoing, setOngoing] = useState<DebateRoomDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [h, r] = await Promise.all([myDebateHistory(), recommendedDebates()]);
        if (!cancelled) {
          setPast(h);
          setOngoing(r);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load dashboard data');
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

  return (
    <div className="space-y-8">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
      )}
      {loading && <p className="text-gray-500">Loading…</p>}

      <section>
        <h2 className="text-3xl mb-6 text-gray-900">Past Debates</h2>
        <p className="text-sm text-gray-600 mb-4">
          Completed debates where you were host or guest debater (with a guest on stage). Wins and losses update your
          profile.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {!loading &&
            past.map((debate) => (
              <Card key={debate.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{debate.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-gray-500">{formatDate(debate.debateEndedAt)}</span>
                      <Badge variant="outline">{debate.myRole}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Your result</span>
                      <Badge variant={debate.myResult === 'WIN' ? 'default' : 'destructive'}>
                        {debate.myResult === 'WIN' ? 'Win' : 'Loss'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400">Winner: {debate.winnerUsername}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {!loading && past.length === 0 && (
          <p className="text-gray-500 text-sm">No completed debates yet. Finish a live debate with a guest to see it here.</p>
        )}
      </section>

      <section>
        <h2 className="text-3xl mb-6 text-gray-900">Recommended Ongoing Debates</h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {!loading &&
            ongoing.map((debate) => (
              <Link key={debate.roomId} to={`/dashboard/room/${encodeURIComponent(debate.roomId)}`} className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{debate.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500 line-clamp-2">{debate.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {(debate.hashtags ?? []).map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>

        {!loading && ongoing.length === 0 && (
          <p className="text-gray-500 text-sm">No public debates right now. Create one from the sidebar.</p>
        )}
      </section>
    </div>
  );
}
