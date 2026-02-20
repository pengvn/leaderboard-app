import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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


      </Router>
    </LeaderboardProvider>
  );
}

export default App;
