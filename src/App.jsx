import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LeaderboardProvider } from './context/LeaderboardContext';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import Lifecounter from './pages/Lifecounter';
import './index.css';

function App() {
  return (
    <LeaderboardProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Leaderboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/lifecounter" element={<Lifecounter />} />
        </Routes>

        {/* Hidden/Subtle Admin Link for Dev Convenience */}
        <footer style={{
          textAlign: 'center',
          padding: '2rem',
          opacity: 0.1,
          fontSize: '0.8rem',
          marginTop: 'auto'
        }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Leaderboard</Link>
          {' | '}
          <Link to="/lifecounter" style={{ color: 'inherit', textDecoration: 'none' }}>Lifecounter</Link>
          {' | '}
          <a href="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>Admin</a>
        </footer>
      </Router>
    </LeaderboardProvider>
  );
}

export default App;
