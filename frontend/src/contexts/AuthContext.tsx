import { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  interests?: {
    categories: string[];
    specifics: Record<string, string[]>;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('yunoball_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email: string, _password: string) => {
    // Mock login - in real app, this would call your backend
    const mockUser: User = {
      id: '1',
      username: 'TestUser',
      email,
      profilePicture: undefined,
      interests: {
        categories: ['sports', 'music'],
        specifics: {
          sports: ['Basketball', 'Football'],
          music: ['Rock', 'Hip-Hop']
        }
      }
    };
    setUser(mockUser);
    localStorage.setItem('yunoball_user', JSON.stringify(mockUser));
  };

  const signup = async (username: string, email: string, _password: string) => {
    // Mock signup - in real app, this would call your backend
    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      profilePicture: undefined,
      interests: undefined
    };
    setUser(newUser);
    localStorage.setItem('yunoball_user', JSON.stringify(newUser));
    // Don't navigate here - let the component handle it to show onboarding
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('yunoball_user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('yunoball_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateUser,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

