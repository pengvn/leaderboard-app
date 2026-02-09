import React from 'react';
import './MatchHistory.css';

const MatchHistory = ({ matches, users }) => {
    const getUser = (id) => users.find(u => u.id === id) || { name: 'Unknown' };

    if (!matches || matches.length === 0) {
        return <div className="no-matches">No matches recorded yet.</div>;
    }

    return (
        <div className="match-history-container glass-panel">
            <h3>Recent Matches</h3>
            <div className="match-list">
                {matches.map(match => {
                    const isCommander = match.players.length > 2;

                    return (
                        <div key={match.id} className={`match-item ${isCommander ? 'commander-item' : ''}`}>
                            <div className="match-modality">{match.modality.toUpperCase()}</div>

                            <div className="match-players-container">
                                {match.players.map((p, index) => {
                                    const user = getUser(p.id);
                                    const isWinner = match.winnerId === p.id;

                                    return (
                                        <React.Fragment key={index}>
                                            <div className={`match-player ${isWinner ? 'winner' : 'loser'}`}>
                                                <span className="player-name">
                                                    {user.name}
                                                    {isWinner && <span className="crown-tiny">👑</span>}
                                                </span>
                                                <div className="deck-info">
                                                    <span>{p.deck}</span>
                                                    <span className="colors">
                                                        {p.colors.map(c => <span key={c} className={`dot dot-${c}`} />)}
                                                    </span>
                                                </div>
                                                <span className="score-val">{p.life} HP</span>
                                            </div>

                                            {/* Add VS only for 2-player games between p1 and p2 */}
                                            {!isCommander && index === 0 && <div className="vs">VS</div>}
                                        </React.Fragment>
                                    );
                                })}
                            </div>

                            <div className="match-date">
                                {new Date(match.date).toLocaleDateString()}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MatchHistory;
