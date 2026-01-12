import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Landing from './components/Landing';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import JoinDebate from './components/JoinDebate';
import CreateDebate from './components/CreateDebate';
import Leaderboards from './components/Leaderboards';

function App() {
  // Simple auth state - in production, this will be managed by your Spring Boot backend
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      })

      if (!res.ok) {
        console.log("Error logging out")
        return
      }
      setIsAuthenticated(false);
    } catch (e) {
      console.log("Error in logout:", e)
    }
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to="/dashboard/home" />} />
        <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard/home" />} />
        <Route path="/signup" element={!isAuthenticated ? <Signup onSignup={handleLogin} /> : <Navigate to="/dashboard/home" />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/" />}>
          <Route path="home" element={<Home />} />
          <Route path="join" element={<JoinDebate />} />
          <Route path="create" element={<CreateDebate />} />
          <Route path="leaderboards" element={<Leaderboards />} />
          <Route index element={<Navigate to="home" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
