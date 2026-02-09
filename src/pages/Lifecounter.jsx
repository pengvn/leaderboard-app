import React, { useState, useEffect, useRef } from 'react';
import './Lifecounter.css';

const PREDEFINED_PLAYERS = ['Pengvn', 'Rekatria', 'Hwan', 'Emi'];

const PLAYER_COLORS = [
  { name: 'Azul Oscuro', value: '#1e3a8a' },
  { name: 'Rojo Oscuro', value: '#7f1d1d' },
  { name: 'Verde Oscuro', value: '#14532d' },
  { name: 'Morado', value: '#581c87' },
  { name: 'Negro', value: '#171717' },
  { name: 'Naranja', value: '#9a3412' },
];

const MANA_COLORS = [
  { symbol: 'W', name: 'Blanco', color: '#f9fafb' },
  { symbol: 'U', name: 'Azul', color: '#3b82f6' },
  { symbol: 'B', name: 'Negro', color: '#1f2937' },
  { symbol: 'R', name: 'Rojo', color: '#ef4444' },
  { symbol: 'G', name: 'Verde', color: '#22c55e' },
  { symbol: 'C', name: 'Incoloro', color: '#9ca3af' },
];

const COUNTER_TYPES = [
  { id: 'poison', name: 'Veneno', icon: '☠️' },
  { id: 'energy', name: 'Energía', icon: '⚡' },
  { id: 'commander', name: 'Comandante', icon: '⚔️' },
  { id: 'experience', name: 'Experiencia', icon: '⭐' },
];

function Lifecounter() {
  const [screen, setScreen] = useState('welcome');
  const [gameMode, setGameMode] = useState(null);
  const [playerCount, setPlayerCount] = useState(0);
  const [startingLife, setStartingLife] = useState(20);
  const [players, setPlayers] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [turnNumber, setTurnNumber] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const longPressTimer = useRef(null);
  const longPressInterval = useRef(null);

  const initializePlayers = (count, life) => {
    const newPlayers = [];
    for (let i = 0; i < count; i++) {
      newPlayers.push({
        id: i,
        name: PREDEFINED_PLAYERS[i] || `Jugador ${i + 1}`,
        life: life,
        color: PLAYER_COLORS[i % PLAYER_COLORS.length].value,
        background: null,
        deck: '',
        manaColors: [],
        counters: {},
        position: i,
      });
    }
    setPlayers(newPlayers);
  };

  const selectGameMode = (mode, count, life) => {
    setGameMode(mode);
    setPlayerCount(count);
    setStartingLife(life);
    initializePlayers(count, life);
    setScreen('setup');
  };

  const startGame = () => {
    setScreen('game');
    setCurrentTurn(0);
    setTurnNumber(1);
  };

  const updatePlayer = (playerId, updates) => {
    setPlayers(prev => prev.map(p =>
      p.id === playerId ? { ...p, ...updates } : p
    ));
  };

  const changeLife = (playerId, delta) => {
    setPlayers(prev => prev.map(p =>
      p.id === playerId ? { ...p, life: Math.max(0, p.life + delta) } : p
    ));
  };

  const handleLifePress = (playerId, delta, isLongPress = false) => {
    const amount = isLongPress ? delta * 10 : delta;
    changeLife(playerId, amount);
  };

  const startLongPress = (playerId, delta) => {
    longPressTimer.current = setTimeout(() => {
      handleLifePress(playerId, delta, true);
      longPressInterval.current = setInterval(() => {
        handleLifePress(playerId, delta, true);
      }, 300);
    }, 500);
  };

  const endLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (longPressInterval.current) {
      clearInterval(longPressInterval.current);
      longPressInterval.current = null;
    }
  };

  const nextTurn = () => {
    const nextPlayer = (currentTurn + 1) % playerCount;
    setCurrentTurn(nextPlayer);
    if (nextPlayer === 0) {
      setTurnNumber(prev => prev + 1);
    }
  };

  const resetGame = () => {
    if (confirm('¿Estás seguro de que quieres reiniciar la partida?')) {
      initializePlayers(playerCount, startingLife);
      setCurrentTurn(0);
      setTurnNumber(1);
      setShowMenu(false);
    }
  };

  const endGame = () => {
    setShowMenu(false);
    setScreen('result');
  };

  const saveResults = () => {
    const gameData = {
      mode: gameMode,
      date: new Date().toISOString(),
      turnNumber: turnNumber,
      players: players.map(p => ({
        name: p.name,
        finalLife: p.life,
        deck: p.deck,
        manaColors: p.manaColors,
        position: p.position,
        counters: p.counters,
      })),
    };

    console.log('Datos de la partida:', gameData);
    alert('Información guardada (preparada para enviar a leaderboard)');
    setScreen('welcome');
  };

  useEffect(() => {
    const alivePlayers = players.filter(p => p.life > 0);
    if (screen === 'game' && alivePlayers.length === 1) {
      setTimeout(() => endGame(), 1000);
    }
  }, [players, screen]);

  return (
    <div className="lifecounter-app">
      {/* Pantalla de Bienvenida */}
      {screen === 'welcome' && (
        <div className="lc-screen lc-welcome">
          <div className="lc-welcome-content">
            <h1 className="lc-logo">⚡ MTG Lifecounter</h1>
            <p className="lc-subtitle">Rastreador de vidas para Magic: The Gathering</p>
            <button className="lc-btn lc-btn-primary lc-btn-large" onClick={() => setScreen('mode')}>
              Jugar
            </button>
          </div>
        </div>
      )}

      {/* Selección de Modo */}
      {screen === 'mode' && (
        <div className="lc-screen lc-mode-screen">
          <div className="lc-screen-header">
            <button className="lc-btn lc-btn-back" onClick={() => setScreen('welcome')}>← Atrás</button>
            <h2>Modo de Juego</h2>
          </div>
          <div className="lc-game-modes">
            <button className="lc-mode-card" onClick={() => selectGameMode('1v1', 2, 20)}>
              <div className="lc-mode-icon">⚔️</div>
              <h3>1v1</h3>
              <p>Standard • 2 jugadores • 20 vidas</p>
            </button>
            <button className="lc-mode-card" onClick={() => selectGameMode('2v2', 4, 20)}>
              <div className="lc-mode-icon">🤝</div>
              <h3>2v2</h3>
              <p>Equipos • 4 jugadores • 20 vidas</p>
            </button>
            <button className="lc-mode-card" onClick={() => selectGameMode('Commander', 4, 40)}>
              <div className="lc-mode-icon">👑</div>
              <h3>Commander</h3>
              <p>Free-for-all • 4 jugadores • 40 vidas</p>
            </button>
          </div>
        </div>
      )}

      {/* Configuración de Jugadores */}
      {screen === 'setup' && (
        <div className="lc-screen lc-setup-screen">
          <div className="lc-screen-header">
            <button className="lc-btn lc-btn-back" onClick={() => setScreen('mode')}>← Atrás</button>
            <h2>Configurar Jugadores</h2>
          </div>
          <div className="lc-setup-container">
            {players.map(player => (
              <div key={player.id} className="lc-player-setup-card">
                <h3>{player.name}</h3>

                <div className="lc-form-group">
                  <label>Nombre del Mazo</label>
                  <input
                    type="text"
                    placeholder="Ej: Azorius Control"
                    value={player.deck}
                    onChange={(e) => updatePlayer(player.id, { deck: e.target.value })}
                  />
                </div>

                <div className="lc-form-group">
                  <label>Color del Panel</label>
                  <div className="lc-color-picker">
                    {PLAYER_COLORS.map(color => (
                      <div
                        key={color.value}
                        className={`lc-color-option ${player.color === color.value ? 'selected' : ''}`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => updatePlayer(player.id, { color: color.value })}
                      />
                    ))}
                  </div>
                </div>

                <div className="lc-form-group">
                  <label>Colores de Maná</label>
                  <div className="lc-mana-colors">
                    {MANA_COLORS.map(mana => (
                      <div
                        key={mana.symbol}
                        className={`lc-mana-option ${player.manaColors.includes(mana.symbol) ? 'selected' : ''}`}
                        style={{ backgroundColor: mana.color, color: mana.symbol === 'W' ? '#000' : '#fff' }}
                        onClick={() => {
                          const manaColors = player.manaColors.includes(mana.symbol)
                            ? player.manaColors.filter(m => m !== mana.symbol)
                            : [...player.manaColors, mana.symbol];
                          updatePlayer(player.id, { manaColors });
                        }}
                      >
                        {mana.symbol}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="lc-setup-footer">
            <button className="lc-btn lc-btn-primary lc-btn-large" onClick={startGame}>
              Comenzar Partida
            </button>
          </div>
        </div>
      )}

      {/* Tablero de Juego */}
      {screen === 'game' && (
        <div className="lc-screen lc-game-screen">
          <div className="lc-game-header">
            <button className="lc-btn lc-btn-menu" onClick={() => setShowMenu(true)}>☰</button>
            <div className="lc-turn-tracker">
              <span className="lc-turn-label">Ronda</span>
              <span className="lc-turn-number">{turnNumber}</span>
            </div>
            <div className="lc-current-player">
              {players[currentTurn]?.name}
            </div>
          </div>

          <div className={`lc-game-board lc-mode-${gameMode.toLowerCase().replace(/[^a-z0-9]/g, '')}`}>
            {players.map(player => (
              <div
                key={player.id}
                className={`lc-player-panel ${currentTurn === player.id ? 'active-turn' : ''} ${player.life === 0 ? 'defeated' : ''}`}
                style={{ backgroundColor: player.color }}
              >
                <div className="lc-player-name">{player.name}</div>
                {player.deck && <div className="lc-player-deck">{player.deck}</div>}

                {player.manaColors.length > 0 && (
                  <div className="lc-mana-display">
                    {player.manaColors.map(symbol => {
                      const mana = MANA_COLORS.find(m => m.symbol === symbol);
                      return (
                        <div
                          key={symbol}
                          className="lc-mana-symbol"
                          style={{ backgroundColor: mana.color, color: symbol === 'W' ? '#000' : '#fff' }}
                        >
                          {symbol}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="lc-life-counter">
                  <button
                    className="lc-life-btn"
                    onClick={() => handleLifePress(player.id, -1)}
                    onMouseDown={() => startLongPress(player.id, -1)}
                    onMouseUp={endLongPress}
                    onMouseLeave={endLongPress}
                    onTouchStart={() => startLongPress(player.id, -1)}
                    onTouchEnd={endLongPress}
                  >
                    −
                  </button>
                  <div
                    className="lc-life-value"
                    onClick={() => setSelectedPlayer(player.id)}
                  >
                    {player.life}
                  </div>
                  <button
                    className="lc-life-btn"
                    onClick={() => handleLifePress(player.id, 1)}
                    onMouseDown={() => startLongPress(player.id, 1)}
                    onMouseUp={endLongPress}
                    onMouseLeave={endLongPress}
                    onTouchStart={() => startLongPress(player.id, 1)}
                    onTouchEnd={endLongPress}
                  >
                    +
                  </button>
                </div>

                {Object.keys(player.counters).length > 0 && (
                  <div className="lc-counters-display">
                    {Object.entries(player.counters).map(([type, value]) => {
                      const counter = COUNTER_TYPES.find(c => c.id === type);
                      return value > 0 && (
                        <div key={type} className="lc-counter-item">
                          {counter?.icon} {value}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="lc-game-footer">
            <button className="lc-btn lc-btn-secondary" onClick={nextTurn}>
              Siguiente Turno
            </button>
          </div>
        </div>
      )}

      {/* Menú de Juego */}
      {showMenu && (
        <div className="lc-modal" onClick={() => setShowMenu(false)}>
          <div className="lc-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Menú de Partida</h3>
            <button className="lc-btn lc-btn-block" onClick={() => setShowMenu(false)}>
              Continuar
            </button>
            <button className="lc-btn lc-btn-block" onClick={resetGame}>
              Reiniciar Partida
            </button>
            <button className="lc-btn lc-btn-block lc-btn-danger" onClick={endGame}>
              Finalizar Partida
            </button>
          </div>
        </div>
      )}

      {/* Configuración de Jugador */}
      {selectedPlayer !== null && (
        <div className="lc-modal" onClick={() => setSelectedPlayer(null)}>
          <div className="lc-modal-content lc-player-config" onClick={(e) => e.stopPropagation()}>
            <h3>Configurar {players[selectedPlayer]?.name}</h3>

            <div className="lc-config-section">
              <h4>Color del Panel</h4>
              <div className="lc-color-picker">
                {PLAYER_COLORS.map(color => (
                  <div
                    key={color.value}
                    className={`lc-color-option ${players[selectedPlayer]?.color === color.value ? 'selected' : ''}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => updatePlayer(selectedPlayer, { color: color.value })}
                  />
                ))}
              </div>
            </div>

            <div className="lc-config-section">
              <h4>Contadores</h4>
              {COUNTER_TYPES.map(counter => (
                <div key={counter.id} className="lc-counter-controls">
                  <label>{counter.icon} {counter.name}</label>
                  <div className="lc-life-counter">
                    <button
                      className="lc-life-btn"
                      onClick={() => {
                        const current = players[selectedPlayer]?.counters[counter.id] || 0;
                        updatePlayer(selectedPlayer, {
                          counters: {
                            ...players[selectedPlayer]?.counters,
                            [counter.id]: Math.max(0, current - 1)
                          }
                        });
                      }}
                    >
                      −
                    </button>
                    <div className="lc-life-value">
                      {players[selectedPlayer]?.counters[counter.id] || 0}
                    </div>
                    <button
                      className="lc-life-btn"
                      onClick={() => {
                        const current = players[selectedPlayer]?.counters[counter.id] || 0;
                        updatePlayer(selectedPlayer, {
                          counters: {
                            ...players[selectedPlayer]?.counters,
                            [counter.id]: current + 1
                          }
                        });
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="lc-btn lc-btn-primary lc-btn-block" onClick={() => setSelectedPlayer(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Pantalla de Resultados */}
      {screen === 'result' && (
        <div className="lc-screen lc-result-screen">
          <div className="lc-result-content">
            <h2>🏆 Partida Finalizada</h2>
            <div className="lc-result-summary">
              {[...players]
                .sort((a, b) => b.life - a.life)
                .map((player, index) => (
                  <div key={player.id} className={`lc-result-player ${index === 0 && player.life > 0 ? 'winner' : ''}`}>
                    <h3>{index === 0 && player.life > 0 ? '👑 ' : ''}{player.name}</h3>
                    <div className="lc-result-stats">
                      <div>Vidas finales: <strong>{player.life}</strong></div>
                      <div>Posición: <strong>#{index + 1}</strong></div>
                      {player.deck && <div>Mazo: <strong>{player.deck}</strong></div>}
                      {player.manaColors.length > 0 && (
                        <div>
                          Colores: <strong>{player.manaColors.join(', ')}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
            <div className="lc-result-actions">
              <button className="lc-btn lc-btn-secondary" onClick={() => setScreen('welcome')}>
                Nueva Partida
              </button>
              <button className="lc-btn lc-btn-primary" onClick={saveResults}>
                Cargar Información
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Lifecounter;
