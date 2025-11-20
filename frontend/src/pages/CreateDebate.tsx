import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

const CreateDebate = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(20);
  const [error, setError] = useState('');

  const categories = [
    { id: 'sports', name: 'Sports', icon: '⚽', color: 'from-blue-500 to-blue-600' },
    { id: 'music', name: 'Music', icon: '🎵', color: 'from-purple-500 to-purple-600' },
    { id: 'movies', name: 'Movies', icon: '🎬', color: 'from-red-500 to-red-600' },
    { id: 'video-games', name: 'Video Games', icon: '🎮', color: 'from-green-500 to-green-600' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter a debate title');
      return;
    }

    if (!category) {
      setError('Please select a category');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    console.log('Creating debate:', { title, category, description, maxParticipants });
    alert('Debate created successfully! (This is a mock - backend integration needed)');
    navigate('/joindebate');
  };

  const selectedCategoryInfo = categories.find(c => c.id === category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-primary-500/20 to-green-500/20 rounded-full blur-3xl"></div>
            <h1 className="relative text-5xl font-extrabold mb-2 bg-gradient-to-r from-green-600 via-primary-600 to-green-600 bg-clip-text text-transparent">
              Create a Debate ✨
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Start a new debate and invite others to join the conversation
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-primary-600/10 to-primary-500/10 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl font-semibold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Debate Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Is Messi the GOAT?"
                  className="w-full px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg transition-all shadow-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">
                  Category *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`relative overflow-hidden p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                        category === cat.id
                          ? `border-transparent bg-gradient-to-br ${cat.color} shadow-xl scale-105`
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 bg-white dark:bg-gray-700'
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 ${category === cat.id ? 'opacity-20' : 'group-hover:opacity-10'} transition-opacity`}></div>
                      <div className="relative text-center">
                        <div className={`text-5xl mb-3 transform ${category === cat.id ? 'scale-110 rotate-6' : ''} transition-all`}>
                          {cat.icon}
                        </div>
                        <div className={`text-sm font-bold ${category === cat.id ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {cat.name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this debate is about..."
                  rows={6}
                  className="w-full px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg transition-all resize-none shadow-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">
                  Max Participants: <span className="text-primary-600 dark:text-primary-400 text-2xl">{maxParticipants}</span>
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Number(e.target.value))}
                    className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2 font-semibold">
                    <span>5</span>
                    <span>50</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/joindebate')}
                  className="flex-1 px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-8 py-4 rounded-xl font-bold text-lg transform hover:scale-105 transition-all shadow-xl ${
                    selectedCategoryInfo
                      ? `bg-gradient-to-r ${selectedCategoryInfo.color} text-white hover:shadow-2xl`
                      : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white'
                  }`}
                >
                  Create Debate ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDebate;
