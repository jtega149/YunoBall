import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Landing from './components/Landing';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import JoinDebate from './components/JoinDebate';
import CreateDebate from './components/CreateDebate';
import Leaderboards from './components/Leaderboards';
import TestRoom from './components/TestRoom';

const API = import.meta.env.VITE_API_URL;

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/api/auth/me`, { credentials: 'include' });
        if (cancelled) {
          return;
        }
        if (res.ok) {
          const data = (await res.json()) as { username?: string };
          if (data.username) {
            localStorage.setItem('username', data.username);
          }
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('username');
          setIsAuthenticated(false);
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem('username');
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) {
          setAuthChecked(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
      localStorage.removeItem('username');
      setIsAuthenticated(false);
    } catch (e) {
      console.log("Error in logout:", e)
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

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
          <Route path="join" element={<JoinDebate />}/>
          <Route path="create" element={<CreateDebate />} />
          <Route path="leaderboards" element={<Leaderboards />} />
          <Route path="room/:roomId" element={<TestRoom />} />
          <Route index element={<Navigate to="home" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
