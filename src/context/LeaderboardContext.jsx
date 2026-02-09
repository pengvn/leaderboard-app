import React, { createContext, useContext, useState, useEffect } from 'react';

// Default User Data
const defaultUsers = [
    {
        id: 'rekaru',
        name: 'Rekaru',
        themeColor: '#ff4757', // Red
        image: '/assets/rekaru.jpg',
        scores: { '1v1': 0, '2v2': 0, 'commander': 0, 'overall': 0 },
    },
    {
        id: 'emi',
        name: 'Emi',
        themeColor: '#2ed573', // Green
        image: '/assets/emi.jpg',
        scores: { '1v1': 0, '2v2': 0, 'commander': 0, 'overall': 0 },
    },
    {
        id: 'pengvn',
        name: 'Pengvn',
        themeColor: '#f1f2f6', // White
        image: '/assets/pengvn.jpg',
        scores: { '1v1': 0, '2v2': 0, 'commander': 0, 'overall': 0 },
    },
    {
        id: 'hwan',
        name: 'Hwan',
        themeColor: '#1e90ff', // Blue
        image: '/assets/hwan.jpg',
        scores: { '1v1': 0, '2v2': 0, 'commander': 0, 'overall': 0 },
    }
];

const LeaderboardContext = createContext();

export const useLeaderboard = () => useContext(LeaderboardContext);

export const LeaderboardProvider = ({ children }) => {
    // Users State
    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('leaderboard_users');
        return saved ? JSON.parse(saved) : defaultUsers;
    });

    // Matches State
    const [matches, setMatches] = useState(() => {
        const saved = localStorage.getItem('leaderboard_matches');
        return saved ? JSON.parse(saved) : [];
    });

    const [activeModality, setActiveModality] = useState('1v1');

    // Persistence
    useEffect(() => {
        localStorage.setItem('leaderboard_users', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        localStorage.setItem('leaderboard_matches', JSON.stringify(matches));
    }, [matches]);

    // Update a specific score/field manually
    const updateUser = (userId, field, value) => {
        setUsers(prev => prev.map(user =>
            user.id === userId ? { ...user, [field]: value } : user
        ));
    };

    const updateScore = (userId, modality, value) => {
        setUsers(prev => prev.map(user =>
            user.id === userId ? {
                ...user,
                scores: { ...user.scores, [modality]: Number(value) }
            } : user
        ));
    };

    // Log a new match
    const logMatch = (matchData) => {
        // matchData structure:
        // {
        //   id: uuid,
        //   date: timestamp,
        //   modality: '1v1',
        //   winnerId: 'rekaru',
        //   players: [
        //     { userId: 'rekaru', deckName: 'Goblins', deckColors: ['R'], life: 20 },
        //     { userId: 'emi', deckName: 'Elves', deckColors: ['G'], life: 0 }
        //   ]
        // }

        const newMatch = { ...matchData, id: Date.now().toString(), date: new Date().toISOString() };
        setMatches(prev => [newMatch, ...prev]);

        // Optional: Auto-increment score for winner?
        // User asked to "modify values", implying manual control, but usually a win = +1 or points.
        // For now, I will just log the match. The Admin can manually adjust scores to keep it flexible
        // OR we could add a logic here. Let's stick to pure logging + manual score adjustment for maximum control unless automated is requested.
    };

    // Delete a match by ID
    const deleteMatch = (matchId) => {
        setMatches(prev => prev.filter(m => m.id !== matchId));
    };

    // Reset all scores to 0
    const resetScores = () => {
        setUsers(prev => prev.map(user => ({
            ...user,
            scores: { '1v1': 0, '2v2': 0, 'commander': 0, 'overall': 0 }
        })));
    };

    // Clear match history
    const clearHistory = () => {
        setMatches([]);
    };

    const getSortedUsers = (modality) => {
        return [...users].sort((a, b) => (b.scores[modality] || 0) - (a.scores[modality] || 0));
    };

    return (
        <LeaderboardContext.Provider value={{
            users,
            matches,
            updateUser,
            updateScore,
            logMatch,
            deleteMatch,
            resetScores,
            clearHistory,
            activeModality,
            setActiveModality,
            getSortedUsers
        }}>
            {children}
        </LeaderboardContext.Provider>
    );
};
