import { useState } from 'react';
import Navbar from '../components/layout/Navbar';

const TestKnowledge = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const categories = [
    { id: 'sports', name: 'Sports', icon: '⚽', color: 'from-blue-500 to-blue-600' },
    { id: 'music', name: 'Music', icon: '🎵', color: 'from-purple-500 to-purple-600' },
    { id: 'movies', name: 'Movies', icon: '🎬', color: 'from-red-500 to-red-600' },
    { id: 'video-games', name: 'Video Games', icon: '🎮', color: 'from-green-500 to-green-600' },
  ];

  const mockQuestions: Record<string, Array<{
    question: string;
    options: string[];
    correct: number;
  }>> = {
    sports: [
      { question: 'Which team won the 2022 FIFA World Cup?', options: ['Brazil', 'France', 'Argentina', 'Germany'], correct: 2 },
      { question: 'Who holds the record for most NBA championships?', options: ['Michael Jordan', 'Bill Russell', 'Kobe Bryant', 'LeBron James'], correct: 1 },
      { question: 'In which sport is the term "Ace" commonly used?', options: ['Tennis', 'Golf', 'Basketball', 'Soccer'], correct: 0 },
    ],
    music: [
      { question: 'Which artist released the album "Midnights"?', options: ['Ariana Grande', 'Taylor Swift', 'Billie Eilish', 'Olivia Rodrigo'], correct: 1 },
      { question: 'What genre did The Beatles primarily play?', options: ['Jazz', 'Rock', 'Hip-Hop', 'Country'], correct: 1 },
      { question: 'Which instrument has 88 keys?', options: ['Guitar', 'Piano', 'Violin', 'Drums'], correct: 1 },
    ],
    movies: [
      { question: 'Which movie won the Oscar for Best Picture in 2023?', options: ['Everything Everywhere All at Once', 'Top Gun: Maverick', 'The Banshees of Inisherin', 'All Quiet on the Western Front'], correct: 0 },
      { question: 'Who directed "Inception"?', options: ['Steven Spielberg', 'Christopher Nolan', 'Martin Scorsese', 'Quentin Tarantino'], correct: 1 },
      { question: 'What is the highest-grossing film of all time?', options: ['Avatar', 'Avengers: Endgame', 'Titanic', 'Star Wars: The Force Awakens'], correct: 0 },
    ],
    'video-games': [
      { question: 'Which game is known for its battle royale mode?', options: ['Minecraft', 'Fortnite', 'Among Us', 'Fall Guys'], correct: 1 },
      { question: 'What year was "The Legend of Zelda: Breath of the Wild" released?', options: ['2015', '2016', '2017', '2018'], correct: 2 },
      { question: 'Which company developed "Elden Ring"?', options: ['Nintendo', 'FromSoftware', 'Bethesda', 'Ubisoft'], correct: 1 },
    ],
  };

  const questions = selectedCategory ? mockQuestions[selectedCategory] || [] : [];
  const currentQ = questions[currentQuestion];
  const categoryInfo = categories.find(c => c.id === selectedCategory);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setTimeout(() => {
      if (currentQ.correct === index) {
        setScore(score + 1);
      }
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const resetTest = () => {
    setSelectedCategory(null);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
              <h1 className="relative text-6xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Test Your Knowledge 🧠
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Choose a category and challenge yourself!
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative text-center">
                  <div className="text-7xl mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    {category.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-white transition-colors">
                    {category.name}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    const isExcellent = percentage >= 80;
    const isGood = percentage >= 60;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-primary-600/20 to-primary-500/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-8xl mb-6 animate-bounce">{isExcellent ? '🎉' : isGood ? '👍' : '💪'}</div>
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                Test Complete!
              </h2>
              <div className="mb-6">
                <div className={`text-7xl font-extrabold mb-2 bg-gradient-to-r ${categoryInfo?.color} bg-clip-text text-transparent`}>
                  {score}/{questions.length}
                </div>
                <div className={`text-3xl font-bold ${isExcellent ? 'text-green-600' : isGood ? 'text-yellow-600' : 'text-orange-600'}`}>
                  {percentage}% Correct
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-8 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${categoryInfo?.color} transition-all duration-1000`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetTest}
                  className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-bold hover:from-primary-700 hover:to-primary-600 transform hover:scale-105 transition-all shadow-lg"
                >
                  Try Another Category
                </button>
                <button
                  onClick={() => {
                    resetTest();
                    setSelectedCategory(selectedCategory);
                  }}
                  className="px-8 py-4 border-2 border-primary-600 text-primary-600 dark:text-primary-400 rounded-xl font-bold hover:bg-primary-50 dark:hover:bg-primary-900/20 transform hover:scale-105 transition-all"
                >
                  Retry This Category
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="text-4xl">{categoryInfo?.icon}</span>
              {categoryInfo?.name}
            </h2>
            <span className="text-lg font-semibold text-gray-600 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className={`h-full bg-gradient-to-r ${categoryInfo?.color} transition-all duration-500`}
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-primary-600/10 to-primary-500/10 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
              {currentQ.question}
            </h3>
            <div className="space-y-4">
              {currentQ.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = currentQ.correct === index;
                const showResult = selectedAnswer !== null;
                
                return (
                  <button
                    key={index}
                    onClick={() => !showResult && handleAnswer(index)}
                    disabled={showResult}
                    className={`w-full text-left px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
                      showResult
                        ? isCorrect
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                          : isSelected
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:scale-105 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showResult && isCorrect && <span className="text-2xl">✓</span>}
                      {showResult && isSelected && !isCorrect && <span className="text-2xl">✗</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestKnowledge;
