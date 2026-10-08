import React, { useState, useEffect } from 'react';
import NoticesPage from './pages/NoticesPage';
import AuthPage from './pages/AuthPage';
import CreateNoticePage from './pages/CreateNoticePage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('notices'); // 'notices' | 'login' | 'create'
  const [notices, setNotices] = useState([]);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campus_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Fetch notices
  const fetchNotices = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notices`);
      if (res.ok) {
        const data = await res.json();
        setNotices(data);
      }
    } catch (err) {
      console.error('Failed to load notices:', err);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('campus_user', JSON.stringify(userData));
    setCurrentPage('notices');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('campus_user');
    setCurrentPage('notices');
  };

  const handleCreateNotice = async (noticePayload) => {
    const res = await fetch(`${API_BASE_URL}/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noticePayload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to post notice.');
    }

    const created = await res.json();
    setNotices((prev) => [created, ...prev]);
    setCurrentPage('notices');
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/notices/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setNotices((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete notice:', err);
    }
  };

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <nav className="navbar">
        <div className="brand" onClick={() => setCurrentPage('notices')}>
          <span>📌 Campus Board</span>
          <span className="brand-badge">Mini</span>
        </div>

        <div className="nav-links">
          <button
            className={`nav-btn ${currentPage === 'notices' ? 'active' : ''}`}
            onClick={() => setCurrentPage('notices')}
          >
            Notices
          </button>

          {user && (
            <button
              className={`nav-btn ${currentPage === 'create' ? 'active' : ''}`}
              onClick={() => setCurrentPage('create')}
            >
              Post Notice
            </button>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="user-pill">
                👤 {user.name} ({user.role})
              </span>
              <button className="nav-btn secondary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <button
              className={`nav-btn ${currentPage === 'login' ? 'active' : ''}`}
              onClick={() => setCurrentPage('login')}
            >
              Login / OTP
            </button>
          )}
        </div>
      </nav>

      {/* Main Pages Router (Max 3 pages) */}
      <main>
        {currentPage === 'notices' && (
          <NoticesPage
            notices={notices}
            user={user}
            onDeleteNotice={handleDeleteNotice}
            onNavigateCreate={() => (user ? setCurrentPage('create') : setCurrentPage('login'))}
          />
        )}

        {currentPage === 'login' && (
          <AuthPage
            apiBaseUrl={API_BASE_URL}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentPage === 'create' && (
          <CreateNoticePage
            user={user}
            onNoticeCreated={handleCreateNotice}
            onNavigateBack={() => setCurrentPage('notices')}
            onRequireLogin={() => setCurrentPage('login')}
          />
        )}
      </main>
    </div>
  );
}
