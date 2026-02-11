// API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '/api'  // In production, Nginx will proxy /api to backend
    : 'http://localhost:3001/api';  // In development, connect directly

// Helper function to handle API calls
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API call failed for ${endpoint}:`, error);
        throw error;
    }
}

// API methods
export const api = {
    // Health check
    health: () => apiCall('/health'),

    // Users
    getUsers: () => apiCall('/users'),

    // Matches
    getMatches: () => apiCall('/matches'),
    createMatch: (matchData) => apiCall('/matches', {
        method: 'POST',
        body: JSON.stringify(matchData),
    }),
    deleteMatch: (matchId) => apiCall(`/matches/${matchId}`, {
        method: 'DELETE',
    }),
    clearMatches: () => apiCall('/matches', {
        method: 'DELETE',
    }),

    // Scores
    updateScore: (userId, modality, score) => apiCall(`/scores/${userId}/${modality}`, {
        method: 'PUT',
        body: JSON.stringify({ score }),
    }),
    resetScores: () => apiCall('/scores/reset', {
        method: 'POST',
    }),
};
