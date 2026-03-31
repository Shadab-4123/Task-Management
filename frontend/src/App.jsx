import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './services/api';
import Login from './components/Login';
import Signup from './components/Signup';
import TaskList from './components/TaskList';
import ThemeToggle from './components/ThemeToggle';
import HomePage from './components/HomePage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.checkAuth();
      if (response.authenticated) {
        setUser(response.user);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      window.location.replace('/');
    } catch (err) {
      console.error('Logout failed:', err);
      setUser(null);
      window.location.replace('/');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={
              user ? <Navigate to="/tasks" replace /> : <Login onLogin={handleLogin} />
            }
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/tasks" replace /> : <Signup />}
          />
          <Route
            path="/tasks"
            element={
              user ? (
                <>
                  <div className="app-header">
                    <div className="app-header-inner">
                      <h1>Task Management</h1>
                      <div className="user-info">
                        <ThemeToggle />
                        <span>{user.username}</span>
                        <div className="user-avatar">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <button onClick={handleLogout} className="btn btn-secondary">
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                  <TaskList user={user} />
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

