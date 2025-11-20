export const interestCategories = [
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'movies', label: 'Movies', icon: '🎬' },
  { id: 'video-games', label: 'Video Games', icon: '🎮' }
];

export const interestSpecifics: Record<string, string[]> = {
  sports: [
    'Basketball', 'Football', 'Soccer', 'Baseball', 'Tennis',
    'Golf', 'Hockey', 'Volleyball', 'Swimming', 'Boxing',
    'MMA', 'Cricket', 'Rugby', 'Formula 1', 'Cycling'
  ],
  music: [
    'Rock', 'Hip-Hop', 'Pop', 'Jazz', 'Classical',
    'Electronic', 'Country', 'R&B', 'Reggae', 'Metal',
    'Indie', 'Blues', 'Folk', 'Latin', 'K-Pop'
  ],
  movies: [
    'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi',
    'Thriller', 'Romance', 'Documentary', 'Animation', 'Fantasy',
    'Crime', 'Western', 'Musical', 'War', 'Mystery'
  ],
  'video-games': [
    'FPS', 'RPG', 'MOBA', 'Racing', 'Sports',
    'Strategy', 'Puzzle', 'Fighting', 'Adventure', 'Simulation',
    'Platformer', 'Battle Royale', 'MMO', 'Indie', 'Horror'
  ]
};

