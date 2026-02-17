import React, { useState, useEffect } from 'react';
import { useLeaderboard } from '../context/LeaderboardContext';
import './Admin.css';

const COLORS = [
    { code: 'W', label: 'White', image: '/white-mana.png' },
    { code: 'U', label: 'Blue', image: '/blue-mana.png' },
    { code: 'B', label: 'Black', image: '/black-mana.png' },
    { code: 'R', label: 'Red', image: '/red-mana.png' },
    { code: 'G', label: 'Green', image: '/green-mana.png' }
];

const POINTS_SYSTEM = [5, 2, 1, 0];

const Admin = () => {
    const { users, matches, updateScore, logMatch, deleteMatch, resetScores, clearHistory, setLastPointsGained } = useLeaderboard();
    const [activeTab, setActiveTab] = useState('scores');

    // --- SCORE MANAGEMENT ---
    const [localScores, setLocalScores] = useState({});

    useEffect(() => {
        const initial = {};
        users.forEach(u => {
            initial[u.id] = { ...u.scores };
        });
        setLocalScores(initial);
    }, [users]);

    const handleLocalScoreChange = (userId, modality, value) => {
        setLocalScores(prev => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [modality]: Number(value)
            }
        }));
    };

    const applyScores = () => {
        Object.keys(localScores).forEach(userId => {
            Object.keys(localScores[userId]).forEach(modality => {
                if (modality === 'overall') return;
                const val = localScores[userId][modality];
                updateScore(userId, modality, val);
            });
        });
        alert('Scores updated successfully!');
    };

    // --- MATCH LOGGING ---
    const [matchModality, setMatchModality] = useState('1v1');
    const [playersData, setPlayersData] = useState([
        { id: 'rekaru', deck: '', colors: [], life: 20, placement: 1 },
        { id: 'emi', deck: '', colors: [], life: 0, placement: 2 }
    ]);
    const [winnerId, setWinnerId] = useState('rekaru');

    // 2v2 team state
    const [teamsData, setTeamsData] = useState([
        { members: ['', ''], deck: '', colors: [], life: 20, placement: 1 },
        { members: ['', ''], deck: '', colors: [], life: 0, placement: 2 }
    ]);

    // Reset form when modality changes
    useEffect(() => {
        if (matchModality === 'commander') {
            setPlayersData([
                { id: users[0]?.id || '', deck: '', colors: [], life: 40, placement: 1 },
                { id: users[1]?.id || '', deck: '', colors: [], life: 40, placement: 2 },
                { id: users[2]?.id || '', deck: '', colors: [], life: 40, placement: 3 },
                { id: users[3]?.id || '', deck: '', colors: [], life: 40, placement: 4 }
            ]);
            setWinnerId(users[0]?.id || '');
        } else if (matchModality === '2v2') {
            setTeamsData([
                { members: [users[0]?.id || '', users[1]?.id || ''], deck: '', colors: [], life: 20, placement: 1 },
                { members: [users[2]?.id || '', users[3]?.id || ''], deck: '', colors: [], life: 0, placement: 2 }
            ]);
            setWinnerId('team1');
        } else {
            setPlayersData([
                { id: users[0]?.id || '', deck: '', colors: [], life: 20, placement: 1 },
                { id: users[1]?.id || '', deck: '', colors: [], life: 0, placement: 2 }
            ]);
            setWinnerId(users[0]?.id || '');
        }
    }, [matchModality, users]);

    const updatePlayerField = (index, field, value) => {
        setPlayersData(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const togglePlayerColor = (index, color) => {
        setPlayersData(prev => {
            const next = [...prev];
            const currentColors = next[index].colors;
            next[index].colors = currentColors.includes(color)
                ? currentColors.filter(c => c !== color)
                : [...currentColors, color];
            return next;
        });
    };

    const updateTeamField = (teamIndex, field, value) => {
        setTeamsData(prev => {
            const next = [...prev];
            next[teamIndex] = { ...next[teamIndex], [field]: value };
            return next;
        });
    };

    const updateTeamMember = (teamIndex, memberIndex, value) => {
        setTeamsData(prev => {
            const next = [...prev];
            const newMembers = [...next[teamIndex].members];
            newMembers[memberIndex] = value;
            next[teamIndex] = { ...next[teamIndex], members: newMembers };
            return next;
        });
    };

    const toggleTeamColor = (teamIndex, color) => {
        setTeamsData(prev => {
            const next = [...prev];
            const currentColors = next[teamIndex].colors;
            next[teamIndex].colors = currentColors.includes(color)
                ? currentColors.filter(c => c !== color)
                : [...currentColors, color];
            return next;
        });
    };

    const submitMatch = (e) => {
        e.preventDefault();

        if (matchModality === '2v2') {
            // Build match data for 2v2
            const winningTeamIndex = winnerId === 'team1' ? 0 : 1;
            const losingTeamIndex = winningTeamIndex === 0 ? 1 : 0;
            const winningTeam = teamsData[winningTeamIndex];
            const losingTeam = teamsData[losingTeamIndex];

            // Build players array with all 4 members
            const allPlayers = [];
            winningTeam.members.forEach(memberId => {
                allPlayers.push({
                    id: memberId,
                    deck: winningTeam.deck,
                    colors: winningTeam.colors,
                    life: winningTeam.life,
                    placement: winningTeam.placement
                });
            });
            losingTeam.members.forEach(memberId => {
                allPlayers.push({
                    id: memberId,
                    deck: losingTeam.deck,
                    colors: losingTeam.colors,
                    life: losingTeam.life,
                    placement: losingTeam.placement
                });
            });

            const winnersFirstMember = winningTeam.members[0];

            logMatch({
                modality: matchModality,
                date: new Date().toISOString(),
                winnerId: winnersFirstMember,
                players: allPlayers
            });

            // Auto-update scores: winning team 4pts each, losing team 0pts
            const newLastPoints = {};
            winningTeam.members.forEach(memberId => {
                const user = users.find(u => u.id === memberId);
                if (user) {
                    updateScore(memberId, matchModality, (user.scores[matchModality] || 0) + 4);
                    newLastPoints[memberId] = { [matchModality]: 4 };
                }
            });
            losingTeam.members.forEach(memberId => {
                const user = users.find(u => u.id === memberId);
                if (user) {
                    newLastPoints[memberId] = { [matchModality]: 0 };
                }
            });
            setLastPointsGained(newLastPoints);

        } else {
            // 1v1 or Commander
            const matchPlayers = playersData.map(p => ({
                id: p.id,
                deck: p.deck,
                colors: p.colors,
                life: p.life,
                placement: p.placement
            }));

            logMatch({
                modality: matchModality,
                date: new Date().toISOString(),
                winnerId: winnerId,
                players: matchPlayers
            });

            // Auto-update scores based on placement
            const newLastPoints = {};
            playersData.forEach(p => {
                const points = POINTS_SYSTEM[p.placement - 1] || 0;
                const user = users.find(u => u.id === p.id);
                if (user) {
                    updateScore(p.id, matchModality, (user.scores[matchModality] || 0) + points);
                    newLastPoints[p.id] = { [matchModality]: points };
                }
            });
            setLastPointsGained(newLastPoints);
        }

        alert('Match logged & scores updated!');
    };

    // --- HISTORY MANAGEMENT ---
    const [selectedMatches, setSelectedMatches] = useState([]);

    const toggleSelectMatch = (id) => {
        setSelectedMatches(prev =>
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    };

    const deleteSelectedMatches = () => {
        if (window.confirm(`Delete ${selectedMatches.length} matches?`)) {
            selectedMatches.forEach(id => deleteMatch(id));
            setSelectedMatches([]);
        }
    };

    const getUserName = (id) => users.find(u => u.id === id)?.name || id || 'Unknown';

    // Get all member IDs already assigned in teams (for filtering)
    const getAssignedMembers = (excludeTeam, excludeMember) => {
        const assigned = [];
        teamsData.forEach((team, ti) => {
            team.members.forEach((m, mi) => {
                if (ti === excludeTeam && mi === excludeMember) return;
                if (m) assigned.push(m);
            });
        });
        return assigned;
    };

    return (
        <div className="admin-container">
            <h1 className="admin-header">Admin Dashboard</h1>

            <div className="tabs-container" style={{ justifyContent: 'flex-start', gap: '1rem' }}>
                <button className={`tab-button ${activeTab === 'scores' ? 'active' : ''}`} onClick={() => setActiveTab('scores')}>Manage Scores</button>
                <button className={`tab-button ${activeTab === 'match' ? 'active' : ''}`} onClick={() => setActiveTab('match')}>Log Match</button>
                <button className={`tab-button ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>History</button>
                <button className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
            </div>

            {/* --- MANAGE SCORES TAB --- */}
            {activeTab === 'scores' && (
                <div className="admin-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2>Update Standings</h2>
                        <button className="btn" onClick={applyScores} style={{ background: '#2ed573' }}>
                            Apply Changes
                        </button>
                    </div>

                    <div className="score-editor">
                        {users.map(user => (
                            <div key={user.id} className="player-card">
                                <h3>{user.name}</h3>
                                <div className="score-row">
                                    {['1v1', '2v2', 'commander'].map(mode => (
                                        <div key={mode} className="score-field">
                                            <label>{mode.toUpperCase()}</label>
                                            <input
                                                type="number"
                                                value={localScores[user.id]?.[mode] || 0}
                                                onChange={(e) => handleLocalScoreChange(user.id, mode, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- LOG MATCH TAB --- */}
            {activeTab === 'match' && (
                <form className="admin-section" onSubmit={submitMatch}>
                    <h2>Log Match Result</h2>

                    <div className="score-field" style={{ marginBottom: '2rem' }}>
                        <label>Modality</label>
                        <select
                            value={matchModality}
                            onChange={e => setMatchModality(e.target.value)}
                            style={{ padding: '0.5rem', fontSize: '1rem' }}
                        >
                            <option value="1v1">1v1</option>
                            <option value="2v2">2v2</option>
                            <option value="commander">Commander (4 Player)</option>
                        </select>
                    </div>

                    {matchModality === '2v2' ? (
                        /* --- 2v2 TEAM CARDS --- */
                        <div className="match-form" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            {teamsData.map((team, teamIndex) => (
                                <div key={teamIndex} className="player-card">
                                    <h3>Team {teamIndex + 1}</h3>

                                    {team.members.map((memberId, memberIndex) => {
                                        const assigned = getAssignedMembers(teamIndex, memberIndex);
                                        return (
                                            <div key={memberIndex} className="score-field" style={{ marginBottom: '0.75rem' }}>
                                                <label>Member {memberIndex + 1}</label>
                                                <select
                                                    value={memberId}
                                                    onChange={e => updateTeamMember(teamIndex, memberIndex, e.target.value)}
                                                    style={{ width: '100%' }}
                                                >
                                                    <option value="">Select player...</option>
                                                    {users.map(u => (
                                                        <option key={u.id} value={u.id} disabled={assigned.includes(u.id)}>
                                                            {u.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    })}

                                    <div className="score-field" style={{ marginTop: '1rem' }}>
                                        <label>Deck Name</label>
                                        <input
                                            type="text"
                                            value={team.deck}
                                            onChange={e => updateTeamField(teamIndex, 'deck', e.target.value)}
                                            placeholder="e.g. Boros Aggro"
                                        />
                                    </div>

                                    <div className="score-field" style={{ marginTop: '1rem' }}>
                                        <label>Deck Colors</label>
                                        <div className="deck-colors">
                                            {COLORS.map(c => (
                                                <img
                                                    key={c.code}
                                                    src={c.image}
                                                    alt={c.label}
                                                    className={`mana-color-option ${team.colors.includes(c.code) ? 'selected' : ''}`}
                                                    onClick={() => toggleTeamColor(teamIndex, c.code)}
                                                    title={c.label}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="score-field" style={{ marginTop: '1rem' }}>
                                        <label>Life / Score</label>
                                        <input
                                            type="number"
                                            value={team.life}
                                            onChange={e => updateTeamField(teamIndex, 'life', Number(e.target.value))}
                                        />
                                    </div>

                                    <div className="score-field" style={{ marginTop: '1rem' }}>
                                        <label>Placement (#)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="2"
                                            value={team.placement}
                                            onChange={e => updateTeamField(teamIndex, 'placement', Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* --- 1v1 / COMMANDER PLAYER CARDS --- */
                        <div className="match-form" style={{ gridTemplateColumns: matchModality === 'commander' ? '1fr' : '1fr 1fr' }}>
                            {playersData.map((player, index) => (
                                <div key={index} className="player-card">
                                    <h3>Player {index + 1}</h3>
                                    <select
                                        value={player.id}
                                        onChange={e => updatePlayerField(index, 'id', e.target.value)}
                                        style={{ width: '100%', marginBottom: '1rem' }}
                                    >
                                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>

                                    <div className="score-field">
                                        <label>Deck Name</label>
                                        <input
                                            type="text"
                                            value={player.deck}
                                            onChange={e => updatePlayerField(index, 'deck', e.target.value)}
                                            placeholder="e.g. Goblins"
                                        />
                                    </div>

                                    <div className="score-field" style={{ marginTop: '1rem' }}>
                                        <label>Deck Colors</label>
                                        <div className="deck-colors">
                                            {COLORS.map(c => (
                                                <img
                                                    key={c.code}
                                                    src={c.image}
                                                    alt={c.label}
                                                    className={`mana-color-option ${player.colors.includes(c.code) ? 'selected' : ''}`}
                                                    onClick={() => togglePlayerColor(index, c.code)}
                                                    title={c.label}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="score-field" style={{ marginTop: '1rem' }}>
                                        <label>Life / Score</label>
                                        <input
                                            type="number"
                                            value={player.life}
                                            onChange={e => updatePlayerField(index, 'life', Number(e.target.value))}
                                        />
                                    </div>

                                    <div className="score-field" style={{ marginTop: '1rem' }}>
                                        <label>Placement (#)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={playersData.length}
                                            value={player.placement}
                                            onChange={e => updatePlayerField(index, 'placement', Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Winner selector */}
                    <div style={{ marginTop: '2rem' }}>
                        <label>Winner</label>
                        {matchModality === '2v2' ? (
                            <select
                                value={winnerId}
                                onChange={e => setWinnerId(e.target.value)}
                                style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', marginTop: '0.5rem' }}
                            >
                                <option value="team1">
                                    Team 1 ({teamsData[0].members.map(m => getUserName(m)).join(' & ')})
                                </option>
                                <option value="team2">
                                    Team 2 ({teamsData[1].members.map(m => getUserName(m)).join(' & ')})
                                </option>
                            </select>
                        ) : (
                            <select
                                value={winnerId}
                                onChange={e => setWinnerId(e.target.value)}
                                style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', marginTop: '0.5rem' }}
                            >
                                {playersData.map((p, i) => (
                                    <option key={i} value={p.id}>
                                        Player {i + 1} ({getUserName(p.id)})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <button type="submit" className="btn" style={{ marginTop: '2rem', width: '100%' }}>
                        Log Match
                    </button>
                </form>
            )}

            {/* --- HISTORY TAB --- */}
            {activeTab === 'history' && (
                <div className="admin-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2>Manage Match History</h2>
                        {selectedMatches.length > 0 && (
                            <button
                                onClick={deleteSelectedMatches}
                                style={{ background: '#ff4757', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Delete Selected ({selectedMatches.length})
                            </button>
                        )}
                    </div>

                    {matches.length === 0 ? <p style={{ color: '#aaa' }}>No history yet.</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {matches.map(m => (
                                <div key={m.id} style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedMatches.includes(m.id)}
                                        onChange={() => toggleSelectMatch(m.id)}
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <span style={{ color: '#ccc', fontSize: '0.8rem', display: 'block' }}>
                                            {new Date(m.date).toLocaleString()} — {m.modality.toUpperCase()}
                                        </span>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                                            {m.players.map(p => (
                                                <span key={p.id} style={{
                                                    color: p.id === m.winnerId ? '#fbbf24' : '#fff',
                                                    fontWeight: p.id === m.winnerId ? 'bold' : 'normal',
                                                    borderBottom: p.id === m.winnerId ? '1px solid #fbbf24' : 'none'
                                                }}>
                                                    {p.placement && `#${p.placement} `}{getUserName(p.id)} ({p.life})
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { if (window.confirm('Delete this match log?')) deleteMatch(m.id) }}
                                        style={{ background: 'rgba(255, 71, 87, 0.2)', color: '#ff4757', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- SETTINGS TAB --- */}
            {activeTab === 'settings' && (
                <div className="admin-section" style={{ borderColor: '#ff4757' }}>
                    <h2 style={{ color: '#ff4757' }}>Danger Zone</h2>
                    <p style={{ color: '#aaa', marginBottom: '2rem' }}>
                        These actions are irreversible. Please be certain.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button
                            className="btn"
                            style={{ background: '#ff4757' }}
                            onClick={() => {
                                if (window.confirm('Are you sure you want to reset all scores to 0? This action cannot be undone.')) {
                                    console.log('Resetting scores...');
                                    resetScores();
                                    alert('All scores have been reset to 0.');
                                }
                            }}
                        >
                            Reset All Scores to 0
                        </button>

                        <button
                            className="btn"
                            style={{ background: 'transparent', border: '1px solid #ff4757', color: '#ff4757' }}
                            onClick={() => {
                                if (window.confirm('Are you sure you want to clear all match history? This action cannot be undone.')) {
                                    console.log('Clearing history...');
                                    clearHistory();
                                    alert('Match history has been cleared.');
                                }
                            }}
                        >
                            Clear Match History
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
