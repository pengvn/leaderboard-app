import React from 'react';
import './Tabs.css';

const modalities = [
    { id: '1v1', label: '1 vs 1' },
    { id: '2v2', label: '2 vs 2' },
    { id: 'commander', label: 'Commander' },
    { id: 'overall', label: 'Overall' }
];

const Tabs = ({ activeTab, onTabChange }) => {
    return (
        <div className="tabs-container">
            {modalities.map((mode) => (
                <button
                    key={mode.id}
                    className={`tab-button ${activeTab === mode.id ? 'active' : ''}`}
                    onClick={() => onTabChange(mode.id)}
                >
                    {mode.label}
                    {activeTab === mode.id && <span className="active-glow" />}
                </button>
            ))}
        </div>
    );
};

export default Tabs;
