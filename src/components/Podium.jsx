import React from 'react';
import './Podium.css';

const Podium = ({ topThree }) => {
    // We need to map ranks 1, 2, 3 safely even if fewer users
    const getRankClass = (index) => `rank-${index + 1}`;

    // To handle the visual order (2nd, 1st, 3rd), CSS order property is used:
    // rank-1: order 2
    // rank-2: order 1
    // rank-3: order 3

    // Re-sorting the array for display isn't strictly necessary with flex order, 
    // but let's just map the sorted list directly.

    return (
        <div className="podium-container">
            {topThree.map((user, index) => (
                <div
                    key={user.id}
                    className={`podium-item user-${user.id} ${getRankClass(index)}`}
                >
                    <div className="avatar-wrapper">
                        {index === 0 && <span className="crown-icon">👑</span>}
                        <img
                            src={user.image}
                            alt={user.name}
                            className="avatar"
                            style={{ borderColor: user.themeColor }}
                        />
                        <div className="rank-badge">{index + 1}</div>
                    </div>

                    <div className="pedestal">
                        {/* Crown was here */}
                        <div className="player-name">{user.name}</div>
                        <div className="player-score" style={{ color: user.themeColor }}>
                            {user.currentScore} pts
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Podium;
