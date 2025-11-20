import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Signup from './auth/Signup';
import Login from './auth/Login';
import InterestSelection from './components/onboarding/InterestSelection';
import Dashboard from './pages/Dashboard';
import TestKnowledge from './pages/TestKnowledge';
import JoinDebate from './pages/JoinDebate';
import CreateDebate from './pages/CreateDebate';
import Leaderboards from './pages/Leaderboards';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/onboarding" replace /> : <Signup />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <InterestSelection />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireOnboarding>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/testknowledge"
        element={
          <ProtectedRoute requireOnboarding>
            <TestKnowledge />
          </ProtectedRoute>
        }
      />
      <Route
        path="/joindebate"
        element={
          <ProtectedRoute requireOnboarding>
            <JoinDebate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/createdebate"
        element={
          <ProtectedRoute requireOnboarding>
            <CreateDebate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboards"
        element={
          <ProtectedRoute requireOnboarding>
            <Leaderboards />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
