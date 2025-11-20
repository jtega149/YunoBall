import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { interestCategories, interestSpecifics } from '../../data/mockData';

const InterestSelection = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSpecifics, setSelectedSpecifics] = useState<Record<string, string[]>>({});
  const [currentStep, setCurrentStep] = useState<'categories' | 'specifics'>('categories');

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        const newCategories = prev.filter(id => id !== categoryId);
        const newSpecifics = { ...selectedSpecifics };
        delete newSpecifics[categoryId];
        setSelectedSpecifics(newSpecifics);
        return newCategories;
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleSpecificToggle = (categoryId: string, specific: string) => {
    setSelectedSpecifics(prev => {
      const categorySpecifics = prev[categoryId] || [];
      if (categorySpecifics.includes(specific)) {
        return {
          ...prev,
          [categoryId]: categorySpecifics.filter(s => s !== specific)
        };
      } else {
        return {
          ...prev,
          [categoryId]: [...categorySpecifics, specific]
        };
      }
    });
  };

  const handleContinue = () => {
    if (currentStep === 'categories') {
      if (selectedCategories.length === 0) {
        alert('Please select at least one interest category');
        return;
      }
      setCurrentStep('specifics');
    } else {
      const allHaveSpecifics = selectedCategories.every(
        cat => selectedSpecifics[cat] && selectedSpecifics[cat].length > 0
      );
      
      if (!allHaveSpecifics) {
        alert('Please select at least one option for each category you chose');
        return;
      }

      updateUser({
        interests: {
          categories: selectedCategories,
          specifics: selectedSpecifics
        }
      });
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep === 'specifics') {
      setCurrentStep('categories');
    }
  };

  const getCategoryColor = (categoryId: string) => {
    const colors: Record<string, string> = {
      'sports': 'from-blue-500 to-blue-600',
      'music': 'from-purple-500 to-purple-600',
      'movies': 'from-red-500 to-red-600',
      'video-games': 'from-green-500 to-green-600',
    };
    return colors[categoryId] || 'from-primary-500 to-primary-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-50">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20 relative">
          <div className="text-center mb-10 relative z-10">
            <div className="inline-block mb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/50 to-primary-600/50 rounded-2xl blur-xl pointer-events-none"></div>
              <h1 className="relative text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 bg-clip-text text-transparent">
                Welcome to YunoBall! 🎉
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-semibold">
              {currentStep === 'categories'
                ? "Let's get to know you better. What are you interested in?"
                : 'Select your favorites from each category'}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <div className={`h-3 w-16 rounded-full transition-all ${currentStep === 'categories' ? 'bg-gradient-to-r from-primary-600 to-primary-500 shadow-lg' : 'bg-gray-300 dark:bg-gray-600'}`} />
              <div className={`h-3 w-16 rounded-full transition-all ${currentStep === 'specifics' ? 'bg-gradient-to-r from-primary-600 to-primary-500 shadow-lg' : 'bg-gray-300 dark:bg-gray-600'}`} />
            </div>
          </div>

          {currentStep === 'categories' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 relative z-10">
              {interestCategories.map(category => {
                const isSelected = selectedCategories.includes(category.id);
                const color = getCategoryColor(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`group relative overflow-hidden p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      isSelected
                        ? `bg-gradient-to-br ${color} border-transparent shadow-2xl scale-105`
                        : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 hover:border-primary-300'
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 ${isSelected ? 'opacity-100' : 'group-hover:opacity-20'} transition-opacity pointer-events-none`}></div>
                    <div className="relative text-center">
                      <div className={`text-6xl mb-4 transform ${isSelected ? 'scale-110 rotate-6' : 'group-hover:scale-110 group-hover:rotate-6'} transition-all duration-300`}>
                        {category.icon}
                      </div>
                      <div className={`font-extrabold text-lg ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {category.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-8 mb-10 max-h-[500px] overflow-y-auto pr-2 relative z-10">
              {selectedCategories.map(categoryId => {
                const category = interestCategories.find(c => c.id === categoryId);
                const specifics = interestSpecifics[categoryId] || [];
                const selected = selectedSpecifics[categoryId] || [];
                const color = getCategoryColor(categoryId);

                return (
                  <div key={categoryId} className="border-b-2 border-gray-200 dark:border-gray-700 pb-8 last:border-0">
                    <h3 className="text-2xl font-extrabold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                      <span className="text-4xl">{category?.icon}</span>
                      <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        {category?.label}
                      </span>
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {specifics.map(specific => {
                        const isSelected = selected.includes(specific);
                        return (
                          <button
                            key={specific}
                            onClick={() => handleSpecificToggle(categoryId, specific)}
                            className={`px-5 py-3 rounded-full text-sm font-bold transition-all transform hover:scale-105 relative z-10 ${
                              isSelected
                                ? `bg-gradient-to-r ${color} text-white shadow-xl scale-105`
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-transparent hover:border-primary-300'
                            }`}
                          >
                            {specific}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-between gap-4 relative z-10">
            {currentStep === 'specifics' && (
              <button
                onClick={handleBack}
                className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all transform hover:scale-105 shadow-lg relative z-10"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleContinue}
              className={`px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-extrabold text-lg hover:from-primary-700 hover:to-primary-600 transform hover:scale-105 transition-all shadow-xl hover:shadow-2xl relative z-10 ${
                currentStep === 'categories' ? 'ml-auto' : 'flex-1'
              }`}
            >
              {currentStep === 'categories' ? 'Continue →' : 'Complete Setup ✨'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestSelection;
