import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

// Default User Data (fallback)
const defaultUsers = [
    {
        id: 'rekaru',
        name: 'Rekaru',
        themeColor: '#ff4757',
        image: '/assets/rekaru.jpg',
        scores: { '1v1': 0, '2v2': 0, 'commander': 0, 'overall': 0 },
    },
    {
        id: 'emi',
        name: 'Emi',
        themeColor: '#2ed573',
        image: '/assets/emi.jpg',
        scores: { '1v1': 0, '2v2': 0, 'commander': 0, 'overall': 0 },
    },
    {
        id: 'pengvn',
        name: 'Pengvn',
        themeColor: '#f1f2f6',
        image: '/assets/pengvn.jpg',
        scores: { '1v1': 0, '2v2': 0, 'commander': 0, 'overall': 0 },
    },
    {
        id: 'hwan',
        name: 'Hwan',
        themeColor: '#1e90ff',
        image: '/assets/hwan.jpg',
        scores: { '1v1': 0, '2v2': 0, 'commander': 0, 'overall': 0 },
    }
];

const LeaderboardContext = createContext();

export const useLeaderboard = () => useContext(LeaderboardContext);

export const LeaderboardProvider = ({ children }) => {
    const [users, setUsers] = useState(defaultUsers);
    const [matches, setMatches] = useState([]);
    const [activeModality, setActiveModality] = useState('overall');
    const [loading, setLoading] = useState(true);
    const [apiAvailable, setApiAvailable] = useState(true);
    const [lastPointsGained, setLastPointsGained] = useState(() => {
        const saved = localStorage.getItem('leaderboard_lastPoints');
        return saved ? JSON.parse(saved) : {};
    });

    // Load initial data from API on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Try to load from API
            const [usersData, matchesData] = await Promise.all([
                api.getUsers(),
                api.getMatches()
            ]);

            setUsers(usersData);
            setMatches(matchesData);
            setApiAvailable(true);
        } catch (error) {
            console.error('Failed to load from API, using localStorage:', error);
            setApiAvailable(false);

            // Fallback to localStorage
            const savedUsers = localStorage.getItem('leaderboard_users');
            const savedMatches = localStorage.getItem('leaderboard_matches');

            if (savedUsers) setUsers(JSON.parse(savedUsers));
            if (savedMatches) setMatches(JSON.parse(savedMatches));
        } finally {
            setLoading(false);
        }
    };

    // Fallback: Save to localStorage when API is not available
    useEffect(() => {
        if (!apiAvailable) {
            localStorage.setItem('leaderboard_users', JSON.stringify(users));
        }
    }, [users, apiAvailable]);

    useEffect(() => {
        if (!apiAvailable) {
            localStorage.setItem('leaderboard_matches', JSON.stringify(matches));
        }
    }, [matches, apiAvailable]);

    useEffect(() => {
        localStorage.setItem('leaderboard_lastPoints', JSON.stringify(lastPointsGained));
    }, [lastPointsGained]);

    // Update a specific user field (for UI state only)
    const updateUser = (userId, field, value) => {
        setUsers(prev => prev.map(user =>
            user.id === userId ? { ...user, [field]: value } : user
        ));
    };

    // Update score
    const updateScore = async (userId, modality, value) => {
        try {
            if (apiAvailable) {
                await api.updateScore(userId, modality, value);
            }

            setUsers(prev => prev.map(user =>
                user.id === userId ? {
                    ...user,
                    scores: { ...user.scores, [modality]: Number(value) }
                } : user
            ));
        } catch (error) {
            console.error('Failed to update score:', error);
            // Update locally anyway
            setUsers(prev => prev.map(user =>
                user.id === userId ? {
                    ...user,
                    scores: { ...user.scores, [modality]: Number(value) }
                } : user
            ));
        }
    };

    // Log a new match
    const logMatch = async (matchData) => {
        try {
            const newMatch = {
                ...matchData,
                id: Date.now().toString(),
                date: new Date().toISOString()
            };

            if (apiAvailable) {
                await api.createMatch(matchData);
            }

            setMatches(prev => [newMatch, ...prev]);
        } catch (error) {
            console.error('Failed to log match:', error);
            // Add locally anyway
            const newMatch = {
                ...matchData,
                id: Date.now().toString(),
                date: new Date().toISOString()
            };
            setMatches(prev => [newMatch, ...prev]);
        }
    };

    // Delete a match by ID
    const deleteMatch = async (matchId) => {
        try {
            if (apiAvailable) {
                await api.deleteMatch(matchId);
            }

            setMatches(prev => prev.filter(m => m.id !== matchId));
        } catch (error) {
            console.error('Failed to delete match:', error);
            // Delete locally anyway
            setMatches(prev => prev.filter(m => m.id !== matchId));
        }
    };

    // Reset all scores to 0
    const resetScores = async () => {
        try {
            if (apiAvailable) {
                await api.resetScores();
            }

            setUsers(prev => prev.map(user => ({
                ...user,
                scores: { '1v1': 0, '2v2': 0, 'commander': 0, 'overall': 0 }
            })));
        } catch (error) {
            console.error('Failed to reset scores:', error);
            // Reset locally anyway
            setUsers(prev => prev.map(user => ({
                ...user,
                scores: { '1v1': 0, '2v2': 0, 'commander': 0, 'overall': 0 }
            })));
        }
    };

    // Clear match history
    const clearHistory = async () => {
        try {
            if (apiAvailable) {
                await api.clearMatches();
            }

            setMatches([]);
        } catch (error) {
            console.error('Failed to clear history:', error);
            // Clear locally anyway
            setMatches([]);
        }
    };

    const getScore = (user, modality) => {
        if (modality === 'overall') {
            return (user.scores['1v1'] || 0) + (user.scores['2v2'] || 0) + (user.scores['commander'] || 0);
        }
        return user.scores[modality] || 0;
    };

    const getSortedUsers = (modality) => {
        return [...users].sort((a, b) => getScore(b, modality) - getScore(a, modality));
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
            getScore,
            getSortedUsers,
            loading,
            apiAvailable,
            refreshData: loadData,
            lastPointsGained,
            setLastPointsGained
        }}>
            {children}
        </LeaderboardContext.Provider>
    );
};
