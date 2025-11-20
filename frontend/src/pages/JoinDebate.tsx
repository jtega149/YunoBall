import { useState } from 'react';
import Navbar from '../components/layout/Navbar';

interface Debate {
  id: string;
  title: string;
  category: string;
  participants: number;
  maxParticipants: number;
  createdBy: string;
  timeAgo: string;
  description: string;
}

const JoinDebate = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Debates', icon: '🌐', color: 'from-gray-500 to-gray-600' },
    { id: 'sports', name: 'Sports', icon: '⚽', color: 'from-blue-500 to-blue-600' },
    { id: 'music', name: 'Music', icon: '🎵', color: 'from-purple-500 to-purple-600' },
    { id: 'movies', name: 'Movies', icon: '🎬', color: 'from-red-500 to-red-600' },
    { id: 'video-games', name: 'Video Games', icon: '🎮', color: 'from-green-500 to-green-600' },
  ];

  const mockDebates: Debate[] = [
    {
      id: '1',
      title: 'Is Messi the Greatest Football Player of All Time?',
      category: 'sports',
      participants: 24,
      maxParticipants: 30,
      createdBy: 'SoccerFan99',
      timeAgo: '2 hours ago',
      description: 'Debating whether Messi deserves the GOAT title over other legends like Ronaldo, Pelé, and Maradona.',
    },
    {
      id: '2',
      title: 'Rock vs Hip-Hop: Which Genre Has More Cultural Impact?',
      category: 'music',
      participants: 18,
      maxParticipants: 25,
      createdBy: 'MusicLover',
      timeAgo: '5 hours ago',
      description: 'A deep dive into the cultural significance and impact of these two iconic music genres.',
    },
    {
      id: '3',
      title: 'Marvel vs DC: Which Universe is Better?',
      category: 'movies',
      participants: 42,
      maxParticipants: 50,
      createdBy: 'CinemaBuff',
      timeAgo: '1 day ago',
      description: 'The ultimate showdown between Marvel and DC cinematic universes.',
    },
    {
      id: '4',
      title: 'PC Gaming vs Console Gaming',
      category: 'video-games',
      participants: 15,
      maxParticipants: 20,
      createdBy: 'GamerPro',
      timeAgo: '3 hours ago',
      description: 'Which platform offers the superior gaming experience?',
    },
    {
      id: '5',
      title: 'Is Basketball More Exciting Than Football?',
      category: 'sports',
      participants: 8,
      maxParticipants: 15,
      createdBy: 'SportsEnthusiast',
      timeAgo: '6 hours ago',
      description: 'Comparing the excitement and entertainment value of these two popular sports.',
    },
    {
      id: '6',
      title: 'Classical Music vs Modern Pop',
      category: 'music',
      participants: 12,
      maxParticipants: 18,
      createdBy: 'MelodyMaster',
      timeAgo: '1 day ago',
      description: 'Which style of music has more artistic merit and lasting value?',
    },
  ];

  const filteredDebates = mockDebates.filter(debate => {
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || debate.category === selectedCategory;
    const matchesSearch = debate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         debate.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleJoinDebate = (debateId: string) => {
    alert(`Joining debate: ${mockDebates.find(d => d.id === debateId)?.title}`);
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || categories[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-primary-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
            <h1 className="relative text-5xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 via-primary-600 to-blue-600 bg-clip-text text-transparent">
              Join a Debate 💬
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Find and join active debates on topics you care about
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-2xl blur-xl"></div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search debates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-12 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-900 dark:text-white text-lg shadow-lg"
              />
              <span className="absolute left-4 top-4 text-2xl text-gray-400">🔍</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
                  selectedCategory === category.id
                    ? `bg-gradient-to-r ${category.color} text-white shadow-xl scale-105`
                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-primary-300 shadow-lg'
                }`}
              >
                <span className="mr-2 text-xl">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Debates List */}
        <div className="space-y-6">
          {filteredDebates.length === 0 ? (
            <div className="text-center py-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-600 dark:text-gray-400 text-xl">
                No debates found. Try adjusting your filters or create a new debate!
              </p>
            </div>
          ) : (
            filteredDebates.map((debate) => {
              const categoryInfo = getCategoryInfo(debate.category);
              const progress = (debate.participants / debate.maxParticipants) * 100;
              const isFull = debate.participants >= debate.maxParticipants;
              
              return (
                <div
                  key={debate.id}
                  className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${categoryInfo.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{categoryInfo.icon}</span>
                        <span className={`px-4 py-1.5 bg-gradient-to-r ${categoryInfo.color} text-white rounded-full text-sm font-bold shadow-lg`}>
                          {debate.category.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
                        {debate.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                        {debate.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-xl">
                        <span className="text-lg">👤</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{debate.createdBy}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-xl">
                        <span className="text-lg">⏰</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{debate.timeAgo}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-xl">
                        <span className="text-lg">👥</span>
                        <span className="font-bold text-gray-900 dark:text-white">{debate.participants}/{debate.maxParticipants}</span>
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${categoryInfo.color} transition-all duration-500`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinDebate(debate.id)}
                      disabled={isFull}
                      className={`px-8 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg ${
                        isFull
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : `bg-gradient-to-r ${categoryInfo.color} text-white hover:shadow-xl`
                      }`}
                    >
                      {isFull ? 'Full' : 'Join Debate →'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinDebate;
