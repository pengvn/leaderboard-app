import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeaderboard } from '../context/LeaderboardContext';
import Tabs from '../components/Tabs';
import Podium from '../components/Podium';
import MatchHistory from '../components/MatchHistory';
import NavMenu from '../components/NavMenu';
import './Leaderboard.css';

const Leaderboard = () => {
    const navigate = useNavigate();
    const { users, matches, activeModality, setActiveModality, getSortedUsers, getScore, lastPointsGained } = useLeaderboard();

    const sortedUsers = getSortedUsers(activeModality);

    // Top 3
    const topThree = sortedUsers.slice(0, 3).map(u => ({
        ...u,
        currentScore: getScore(u, activeModality)
    }));

    // List of ALL players below the podium table (as requested by user)
    const list = sortedUsers.map((u, i) => ({
        ...u,
        rank: i + 1,
        currentScore: getScore(u, activeModality)
    }));

    const hasActivity = topThree.length > 0 && topThree[0].currentScore > 0;

    return (
        <div className="leaderboard-page container">
            <NavMenu />
            <header className="page-header">
                <h1 className="app-title">PLANESWALKERS LEAGUE</h1>
                <p className="subtitle">Season 2026</p>
            </header>

            <Tabs activeTab={activeModality} onTabChange={setActiveModality} />

            {hasActivity ? (
                <Podium topThree={topThree} />
            ) : (
                <div className="no-activity-message">Sin jugar todavía</div>
            )}

            {list.length > 0 && (
                <div className="list-container glass-panel">
                    <div className="list-header">
                        <span className="rank-num">#</span>
                        <span style={{ flex: 1, paddingLeft: '1rem' }}>Player</span>
                        <span>Score</span>
                    </div>
                    {list.map(user => (
                        <div key={user.id} className="list-item">
                            <span className="rank-num">{user.rank}</span>
                            <div className="list-user">
                                <img
                                    src={user.image}
                                    alt=""
                                    className="list-avatar"
                                    style={{
                                        border: `2px solid ${user.themeColor || 'rgba(255,255,255,0.1)'}`,
                                        boxShadow: `0 0 8px ${user.themeColor}40` // Subtle glow
                                    }}
                                />
                                <span style={{ color: 'white' }}>{user.name}</span>
                                {(() => {
                                    const pts = activeModality === 'overall'
                                        ? (lastPointsGained[user.id]?.['1v1'] || 0) + (lastPointsGained[user.id]?.['2v2'] || 0) + (lastPointsGained[user.id]?.['commander'] || 0)
                                        : (lastPointsGained[user.id]?.[activeModality] || 0);
                                    if (lastPointsGained[user.id]) {
                                        return <span className={`change-indicator ${pts > 0 ? 'up' : 'neutral'}`}>{pts > 0 ? '^' : '-'}</span>;
                                    }
                                    return null;
                                })()}
                            </div>
                            <span className="score-num">
                                {user.currentScore}
                                {(() => {
                                    const pts = activeModality === 'overall'
                                        ? (lastPointsGained[user.id]?.['1v1'] || 0) + (lastPointsGained[user.id]?.['2v2'] || 0) + (lastPointsGained[user.id]?.['commander'] || 0)
                                        : (lastPointsGained[user.id]?.[activeModality] || 0);
                                    return pts > 0 ? (
                                        <span className="last-points-badge">
                                            +{pts}
                                        </span>
                                    ) : null;
                                })()}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Match History Section */}
            <MatchHistory matches={matches} users={users} />

            {/* Ambient Background for Winner */}
            {hasActivity && topThree[0]?.image && (
                <div
                    className="winner-background"
                    style={{ backgroundImage: `url(${topThree[0].image})` }}
                />
            )}

            {/* Lifecounter Floating Button */}
            <button
                onClick={() => navigate('/lifecounter')}
                className="lifecounter-fab"
                title="Abrir Lifecounter"
            >
                <img src="/logo-lifecounter.png" alt="Lifecounter" className="fab-logo" />
            </button>

            {/* Footer 
            <footer className="leaderboard-footer">
                <div className="footer-content">
                    <button onClick={() => navigate('/')} className="footer-link">
                        Leaderboard
                    </button>
                    <button onClick={() => navigate('/lifecounter')} className="footer-lifecounter-btn">
                        <img src="/logo-lifecounter.png" alt="Lifecounter" />
                        <span>Lifecounter</span>
                    </button>
                </div>
            </footer>*/}
        </div>
    );
};
export default Leaderboard;
