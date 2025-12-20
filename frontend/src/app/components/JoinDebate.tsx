import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

// Mock data - In production, this will come from your Spring Boot backend API
const recommendedDebates = [
  {
    id: 1,
    title: 'Digital Privacy Rights',
    participants: 18,
    hashtags: ['#privacy', '#technology', '#rights'],
    roomId: 'DPR-2024-001'
  },
  {
    id: 2,
    title: 'Renewable Energy Transition',
    participants: 22,
    hashtags: ['#energy', '#climate', '#sustainability'],
    roomId: 'RET-2024-002'
  },
  {
    id: 3,
    title: 'Healthcare System Reform',
    participants: 14,
    hashtags: ['#healthcare', '#policy', '#reform'],
    roomId: 'HSR-2024-003'
  },
  {
    id: 4,
    title: 'Artificial Intelligence Ethics',
    participants: 25,
    hashtags: ['#AI', '#ethics', '#technology'],
    roomId: 'AIE-2024-004'
  }
];

export default function JoinDebate() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roomId, setRoomId] = useState('');
  const [searchResults, setSearchResults] = useState(recommendedDebates);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this will call your Spring Boot backend API
    const filtered = recommendedDebates.filter(debate =>
      debate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      debate.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setSearchResults(filtered);
  };

  const handleJoinByRoomId = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this will call your Spring Boot backend API to join the debate
    alert(`Joining debate with Room ID: ${roomId}`);
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
          {/* Search Box */}
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
                <Button type="submit">Search</Button>
              </form>
            </CardContent>
          </Card>

          {/* Recommended Debates */}
          <section>
            <h3 className="text-2xl mb-4 text-gray-900">
              {searchQuery ? 'Search Results' : 'Recommended Debates'}
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((debate) => (
                <Card key={debate.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{debate.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-gray-500">
                        {debate.participants} participants
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {debate.hashtags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-gray-400">
                        Room ID: {debate.roomId}
                      </div>
                      <Button className="w-full">Join Debate</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {searchResults.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No debates found. Try a different search term.
              </p>
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
                <div className="space-y-2">
                  <label htmlFor="roomid" className="text-sm">
                    Enter Room ID
                  </label>
                  <Input
                    id="roomid"
                    type="text"
                    placeholder="e.g., DPR-2024-001"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Enter the unique room ID to join any debate directly
                  </p>
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
