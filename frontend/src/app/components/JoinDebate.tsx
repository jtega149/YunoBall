import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useNavigate } from 'react-router-dom';
import { getDebate, recommendedDebates, searchDebates, type DebateRoomDto } from '../services/api';

export default function JoinDebate() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roomId, setRoomId] = useState('');
  const [list, setList] = useState<DebateRoomDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [joinError, setJoinError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await recommendedDebates();
        if (!cancelled) {
          setList(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load debates');
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setError('');
    try {
      const data = await searchDebates(searchQuery);
      setList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleJoinByRoomId = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    const id = roomId.trim();
    if (!id) {
      setJoinError('Enter a Room ID');
      return;
    }
    try {
      await getDebate(id);
      navigate(`/dashboard/room/${encodeURIComponent(id)}`);
    } catch {
      setJoinError('No active debate found for that Room ID, or you may not have access.');
    }
  };

  const goToRoom = (id: string) => {
    navigate(`/dashboard/room/${encodeURIComponent(id)}`);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl text-gray-900">Join a Debate</h2>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="browse">Browse Debates</TabsTrigger>
          <TabsTrigger value="roomid">Join by Room ID</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Debates</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Search by name or hashtag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={searching}>
                  {searching ? 'Searching…' : 'Search'}
                </Button>
              </form>
              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </CardContent>
          </Card>

          <section>
            <h3 className="text-2xl mb-4 text-gray-900">
              {searchQuery.trim() ? 'Search Results' : 'Recommended Debates'}
            </h3>

            {loading ? (
              <p className="text-gray-500">Loading…</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {list.map((debate) => (
                  <Card key={debate.roomId} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{debate.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-xs text-gray-400 line-clamp-2">{debate.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {(debate.hashtags ?? []).map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-gray-400">Room ID: {debate.roomId}</div>
                        <Button type="button" className="w-full" onClick={() => goToRoom(debate.roomId)}>
                          Join Debate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && list.length === 0 && (
              <p className="text-center text-gray-500 py-8">No public debates match your search.</p>
            )}
          </section>
        </TabsContent>

        <TabsContent value="roomid">
          <Card>
            <CardHeader>
              <CardTitle>Join by Room ID</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinByRoomId} className="space-y-4">
                {joinError && <p className="text-sm text-red-600">{joinError}</p>}
                <div className="space-y-2">
                  <label htmlFor="roomid" className="text-sm">
                    Enter Room ID
                  </label>
                  <Input
                    id="roomid"
                    type="text"
                    placeholder="e.g., DBT-ABC123"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">Private debates are only listed if you have the Room ID.</p>
                </div>
                <Button type="submit" className="w-full">
                  Join Debate
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
