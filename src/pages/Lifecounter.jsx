import React, { useState, useEffect, useRef } from 'react';
import { useLeaderboard } from '../context/LeaderboardContext';
import NavMenu from '../components/NavMenu';
import './Lifecounter.css';

const PREDEFINED_PLAYERS = ['Pengvn', 'Rekatria', 'Hwan', 'Emi'];

const PLAYER_COLORS = [
  { name: 'Blanco', value: '#f5f5f5' },
  { name: 'Azul Oscuro', value: '#1e3a8a' },
  { name: 'Rojo Oscuro', value: '#7f1d1d' },
  { name: 'Verde Oscuro', value: '#14532d' },
  { name: 'Morado', value: '#581c87' },
  { name: 'Negro', value: '#171717' },
  { name: 'Naranja', value: '#9a3412' },
];

const MANA_COLORS = [
  { symbol: 'W', name: 'Blanco', color: '#f9fafb', image: '/white-mana.png' },
  { symbol: 'U', name: 'Azul', color: '#3b82f6', image: '/blue-mana.png' },
  { symbol: 'B', name: 'Negro', color: '#1f2937', image: '/black-mana.png' },
  { symbol: 'R', name: 'Rojo', color: '#ef4444', image: '/red-mana.png' },
  { symbol: 'G', name: 'Verde', color: '#22c55e', image: '/green-mana.png' },
];

const BACKGROUND_IMAGES = [
  { id: 'none', name: 'Sin fondo', url: null },
  { id: 'pengvn', name: 'Pengvn', url: '/assets/pengvn.jpg' },
  { id: 'rekatria', name: 'Rekatria', url: '/assets/rekaru.jpg' },
  { id: 'hwan', name: 'Hwan', url: '/assets/hwan.jpg' },
  { id: 'emi', name: 'Emi', url: '/assets/emi.jpg' },
];

const COUNTER_TYPES = [
  { id: 'poison', name: 'Veneno', icon: '☠️' },
  { id: 'energy', name: 'Energía', icon: '⚡' },
  { id: 'commander', name: 'Comandante', icon: '⚔️' },
  { id: 'experience', name: 'Experiencia', icon: '⭐' },
  { id: 'plusone', name: '+1/+1', icon: '➕' },
  { id: 'minusone', name: '-1/-1', icon: '➖' },
  { id: 'loyalty', name: 'Lealtad', icon: '💎' },
  { id: 'charge', name: 'Carga', icon: '🔋' },
  { id: 'time', name: 'Tiempo', icon: '⏱️' },
  { id: 'lore', name: 'Saber', icon: '📖' },
  { id: 'shield', name: 'Escudo', icon: '🛡️' },
  { id: 'stun', name: 'Aturdimiento', icon: '💫' },
  { id: 'treasure', name: 'Tesoro', icon: '💰' },
  { id: 'food', name: 'Comida', icon: '🍎' },
  { id: 'clue', name: 'Pista', icon: '🔍' },
  { id: 'white', name: 'Maná Blanco', icon: '⚪' },
  { id: 'blue', name: 'Maná Azul', icon: '🔵' },
  { id: 'black', name: 'Maná Negro', icon: '⚫' },
  { id: 'red', name: 'Maná Rojo', icon: '🔴' },
  { id: 'green', name: 'Maná Verde', icon: '🟢' },
  { id: 'colorless', name: 'Maná Incoloro', icon: '⬜' },
];

// Mapeo de nombres a IDs del leaderboard
const PLAYER_ID_MAP = {
  'Pengvn': 'pengvn',
  'Rekatria': 'rekaru',
  'Hwan': 'hwan',
  'Emi': 'emi'
};

function Lifecounter() {
  const { logMatch, updateScore, users: leaderboardUsers } = useLeaderboard();
  const [screen, setScreen] = useState('welcome');
  const [gameMode, setGameMode] = useState(null);
  const [playerCount, setPlayerCount] = useState(0);
  const [startingLife, setStartingLife] = useState(20);
  const [players, setPlayers] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [turnNumber, setTurnNumber] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showRoundChange, setShowRoundChange] = useState(false);
  const [newRoundNumber, setNewRoundNumber] = useState(1);
  const [firstPlayer, setFirstPlayer] = useState(0);
  const [showHighRoll, setShowHighRoll] = useState(false);
  const [highRollWinner, setHighRollWinner] = useState(null);
  const [showHighRollResult, setShowHighRollResult] = useState(false);
  const [victoryDetected, setVictoryDetected] = useState(false);
  const [seatAssignment, setSeatAssignment] = useState({}); // {seatIndex: playerName}
  const [assigningPlayer, setAssigningPlayer] = useState(null); // Jugador siendo asignado
  const [showSeatAssignment, setShowSeatAssignment] = useState(false);
  const [teamSelections, setTeamSelections] = useState({ team1: [], team2: [] }); // Para 2v2
  const [showTeamSelection, setShowTeamSelection] = useState(false); // Pantalla de selección de equipos
  const [menuButtonShowsLogo, setMenuButtonShowsLogo] = useState(false); // Alternar entre ☰ y logo
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false); // Modal de contraseña
  const [password, setPassword] = useState(''); // Input de contraseña
  const [passwordError, setPasswordError] = useState(''); // Error de contraseña

  const longPressTimer = useRef(null);
  const longPressInterval = useRef(null);
  const menuButtonLongPress = useRef(null);
  const menuButtonLongPressTriggered = useRef(false);

  const initializePlayers = (count, life, isTeamMode = false, teams = null) => {
    const newPlayers = [];

    if (isTeamMode && teams) {
      // Para 2v2: crear 2 "jugadores" que representan equipos
      newPlayers.push({
        id: 0,
        name: teams.team1.join(' & '),
        members: teams.team1, // Guardar miembros del equipo
        life: life,
        color: PLAYER_COLORS[0].value,
        backgroundImage: null,
        deck: '',
        manaColors: [],
        counters: {},
        position: 0,
      });
      newPlayers.push({
        id: 1,
        name: teams.team2.join(' & '),
        members: teams.team2,
        life: life,
        color: PLAYER_COLORS[1].value,
        backgroundImage: null,
        deck: '',
        manaColors: [],
        counters: {},
        position: 1,
      });
    } else {
      // Otros modos: jugadores individuales
      for (let i = 0; i < count; i++) {
        newPlayers.push({
          id: i,
          name: PREDEFINED_PLAYERS[i] || `Jugador ${i + 1}`,
          life: life,
          color: PLAYER_COLORS[i % PLAYER_COLORS.length].value,
          backgroundImage: null,
          deck: '',
          manaColors: [],
          counters: {},
          position: i,
        });
      }
    }

    setPlayers(newPlayers);
  };

  const selectGameMode = (mode, count, life) => {
    setGameMode(mode);
    setStartingLife(life);

    /* NOTA: Para editar asientos por modo de juego:
       - 1v1: count = 2 (2 asientos)
       - 2v2: count = 2 (2 equipos, cada equipo con 2 jugadores)
       - Commander: count = 4
       - Three-way: count = 3
    */

    if (mode === '2v2') {
      // 2v2: 2 asientos (equipos), mostrar selección de equipos
      setPlayerCount(2);
      setTeamSelections({ team1: [], team2: [] });
      setShowTeamSelection(true);
    } else {
      setPlayerCount(count);
      initializePlayers(count, life);
      setSeatAssignment({});
      setShowSeatAssignment(true);
    }
  };

  const assignPlayerToSeat = (seatIndex) => {
    if (!assigningPlayer) return;

    // Asignar jugador al asiento
    const newAssignment = { ...seatAssignment, [seatIndex]: assigningPlayer };
    setSeatAssignment(newAssignment);
    setAssigningPlayer(null);

    // Si todos los asientos están ocupados, pasar a configuración
    if (Object.keys(newAssignment).length === playerCount) {
      // Reordenar jugadores según asientos
      const reorderedPlayers = [];
      for (let i = 0; i < playerCount; i++) {
        const playerName = newAssignment[i];
        const player = players.find(p => p.name === playerName);
        if (player) {
          reorderedPlayers.push({ ...player, id: i, position: i });
        }
      }
      setPlayers(reorderedPlayers);
      setShowSeatAssignment(false);
      setScreen('setup');
    }
  };

  // Determinar posición específica del jugador para aplicar rotaciones
  const getPlayerPositionClass = (playerId) => {
    if (gameMode === '1v1' || gameMode === '2v2') {
      // 2 asientos: solo arriba y abajo
      return playerId === 0 ? 'top-player' : 'bottom-player';
    }

    if (gameMode === 'Commander') {
      // 4 asientos: arriba-izq, arriba-der, abajo-izq, abajo-der
      const positions = ['top-left-player', 'top-right-player', 'bottom-left-player', 'bottom-right-player'];
      return positions[playerId] || '';
    }

    if (gameMode === 'Three-way') {
      // 3 asientos: 1 arriba (ocupa todo), 2 abajo
      const positions = ['top-player', 'bottom-left-player', 'bottom-right-player'];
      return positions[playerId] || '';
    }

    return '';
  };

  const startGame = () => {
    setShowHighRoll(true);
  };

  const performHighRoll = () => {
    // High roll aleatorio
    const randomPlayer = Math.floor(Math.random() * playerCount);
    setHighRollWinner(randomPlayer);
    setShowHighRollResult(true);

    // Después de 2.5 segundos, iniciar el juego
    setTimeout(() => {
      setFirstPlayer(randomPlayer);
      setCurrentTurn(randomPlayer);
      setTurnNumber(1);
      setShowHighRoll(false);
      setShowHighRollResult(false);
      setHighRollWinner(null);
      setScreen('game');
    }, 2500);
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

  const startMenuButtonLongPress = () => {
    menuButtonLongPressTriggered.current = false;
    menuButtonLongPress.current = setTimeout(() => {
      setMenuButtonShowsLogo(!menuButtonShowsLogo);
      menuButtonLongPressTriggered.current = true;
    }, 800);
  };

  const endMenuButtonLongPress = () => {
    if (menuButtonLongPress.current) {
      clearTimeout(menuButtonLongPress.current);
      menuButtonLongPress.current = null;
    }
  };

  const handleMenuButtonClick = () => {
    // Solo abrir menú si NO se activó el long press
    if (!menuButtonLongPressTriggered.current) {
      setShowMenu(true);
    }
    menuButtonLongPressTriggered.current = false;
  };

  const nextTurn = () => {
    const getNextInRotation = (current) => {
      if (gameMode === '1v1') {
        return (current + 1) % playerCount;
      } else if (gameMode === 'Three-way') {
        const order = [0, 2, 1];
        const idx = order.indexOf(current);
        return order[(idx + 1) % order.length];
      } else if (gameMode === '2v2' || gameMode === 'Commander') {
        const order = [0, 1, 3, 2];
        const idx = order.indexOf(current);
        return order[(idx + 1) % order.length];
      }
      return (current + 1) % playerCount;
    };

    // Buscar siguiente jugador vivo (saltar muertos)
    let nextPlayer = getNextInRotation(currentTurn);
    let attempts = 0;
    while (players[nextPlayer]?.life <= 0 && attempts < playerCount) {
      nextPlayer = getNextInRotation(nextPlayer);
      attempts++;
    }

    if (attempts >= playerCount) return; // Todos muertos

    const isNewRound = nextPlayer === firstPlayer;
    setCurrentTurn(nextPlayer);

    if (isNewRound && turnNumber > 0) {
      const newRound = turnNumber + 1;
      setNewRoundNumber(newRound);
      setShowRoundChange(true);
      setTimeout(() => {
        setShowRoundChange(false);
        setTurnNumber(newRound);
      }, 2000);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Error al activar fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
    setShowMenu(false);
  };

  const resetGame = () => {
    if (confirm('¿Estás seguro de que quieres reiniciar la partida?')) {
      initializePlayers(playerCount, startingLife);
      setCurrentTurn(0);
      setTurnNumber(1);
      setShowMenu(false);
      localStorage.removeItem('lifecounter_session');
    }
  };

  const endGame = () => {
    setShowMenu(false);
    setScreen('result');
  };

  const handleSaveResults = () => {
    // Mostrar modal de contraseña
    setShowPasswordPrompt(true);
    setPassword('');
    setPasswordError('');
  };

  const saveResults = () => {
    // Validar contraseña (puedes cambiar "mtg2026" por la que quieras)
    const SAVE_PASSWORD = 'mtg2026';

    if (password !== SAVE_PASSWORD) {
      setPasswordError('Contraseña incorrecta');
      return;
    }

    // Cerrar modal
    setShowPasswordPrompt(false);
    setPassword('');
    setPasswordError('');

    // Ordenar jugadores por vida (mayor a menor) para determinar posiciones
    const sortedPlayers = [...players].sort((a, b) => b.life - a.life);

    // Sistema de puntos: 1° = 5pts, 2° = 2pts, 3° = 1pt, 4° = 0pts
    const pointsSystem = [5, 2, 1, 0];

    // Mapear gameMode a modalidad del leaderboard
    const modalityMap = {
      '1v1': '1v1',
      '2v2': '2v2',
      'Commander': 'commander',
      'Three-way': '1v1'
    };

    const modality = modalityMap[gameMode] || '1v1';

    // Preparar datos del match (con estructura correcta para MatchHistory)
    const matchData = {
      modality: modality,
      winnerId: PLAYER_ID_MAP[sortedPlayers[0].name] || sortedPlayers[0].name.toLowerCase(),
      players: players.map(p => ({
        id: PLAYER_ID_MAP[p.name] || p.name.toLowerCase(), // 'id' no 'userId'
        deck: p.deck || 'Sin nombre', // 'deck' no 'deckName'
        colors: Array.isArray(p.manaColors) ? p.manaColors : [], // Asegurar que sea array
        life: p.life
      }))
    };

    // Guardar el match en el historial
    logMatch(matchData);

    // Actualizar puntos de cada jugador según su posición
    sortedPlayers.forEach((player, index) => {
      const playerId = PLAYER_ID_MAP[player.name] || player.name.toLowerCase();
      const points = pointsSystem[index] || 0;

      // Obtener score actual del jugador
      const user = leaderboardUsers.find(u => u.id === playerId);
      if (user) {
        const currentScore = user.scores[modality] || 0;
        const newScore = currentScore + points;

        // Actualizar score en la modalidad específica
        updateScore(playerId, modality, newScore);

        // Actualizar score overall
        const currentOverall = user.scores.overall || 0;
        updateScore(playerId, 'overall', currentOverall + points);
      }
    });

    console.log('Partida guardada:', matchData);
    console.log('Puntos asignados:', sortedPlayers.map((p, i) => `${p.name}: ${pointsSystem[i] || 0}pts`));

    alert(`¡Partida guardada!\n\nPuntos asignados:\n${sortedPlayers.map((p, i) =>
      `${i + 1}° ${p.name}: ${pointsSystem[i] || 0} puntos`
    ).join('\n')}`);

    // Limpiar sesión guardada
    localStorage.removeItem('lifecounter_session');
    setScreen('welcome');
  };

  useEffect(() => {
    if (screen !== 'game') return;

    // Verificar condiciones de derrota
    const updatedPlayers = players.map(player => {
      if (player.life <= 0) return player;

      // Comandante >= 21 → derrota
      if ((player.counters?.commander || 0) >= 21) {
        return { ...player, life: 0 };
      }

      // Veneno >= 10 → derrota
      if ((player.counters?.poison || 0) >= 10) {
        return { ...player, life: 0 };
      }

      return player;
    });

    if (JSON.stringify(updatedPlayers) !== JSON.stringify(players)) {
      setPlayers(updatedPlayers);
    }

    const alivePlayers = updatedPlayers.filter(p => p.life > 0);
    if (alivePlayers.length === 1 && !victoryDetected) {
      setVictoryDetected(true);
    }
  }, [players, screen, victoryDetected]);

  // Guardar sesión en localStorage cuando cambie el estado
  useEffect(() => {
    if (screen === 'game' && players.length > 0) {
      const gameState = {
        screen,
        gameMode,
        playerCount,
        startingLife,
        players,
        currentTurn,
        turnNumber,
        firstPlayer,
        seatAssignment,
        timestamp: Date.now()
      };
      localStorage.setItem('lifecounter_session', JSON.stringify(gameState));
    }
  }, [screen, gameMode, playerCount, startingLife, players, currentTurn, turnNumber, firstPlayer, seatAssignment]);

  // Cargar sesión guardada al montar el componente
  useEffect(() => {
    const savedSession = localStorage.getItem('lifecounter_session');
    if (savedSession) {
      try {
        const gameState = JSON.parse(savedSession);
        // Solo cargar si la sesión no es muy antigua (menos de 24 horas)
        const hoursSinceLastSave = (Date.now() - gameState.timestamp) / (1000 * 60 * 60);
        if (hoursSinceLastSave < 24) {
          // Preguntar al usuario si quiere continuar
          if (confirm('¿Deseas continuar la partida guardada?')) {
            setScreen(gameState.screen);
            setGameMode(gameState.gameMode);
            setPlayerCount(gameState.playerCount);
            setStartingLife(gameState.startingLife);
            setPlayers(gameState.players);
            setCurrentTurn(gameState.currentTurn);
            setTurnNumber(gameState.turnNumber);
            setFirstPlayer(gameState.firstPlayer);
            setSeatAssignment(gameState.seatAssignment);
          } else {
            localStorage.removeItem('lifecounter_session');
          }
        } else {
          localStorage.removeItem('lifecounter_session');
        }
      } catch (error) {
        console.error('Error al cargar sesión guardada:', error);
        localStorage.removeItem('lifecounter_session');
      }
    }
  }, []);

  return (
    <div className="lifecounter-app">
      <NavMenu show={screen !== 'game'} />

      {/* Pantalla de Bienvenida */}
      {screen === 'welcome' && (
        <div className="lc-screen lc-welcome">
          <div className="lc-welcome-content">
            <img src="/logo-lifecounter.png" alt="MTG Lifecounter" className="lc-logo-image" />
            <h1 className="lc-logo">MTG Lifecounter</h1>
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
            {/* NOTA: Para editar diseño de modos:
                - Iconos: cambiar className="lc-mode-icon"
                - Vidas iniciales: tercer parámetro (20 o 40)
                - Número de asientos: segundo parámetro
                  * 1v1: 2 asientos
                  * 2v2: 4 asientos (o 2 para equipos)
                  * Commander: 4 asientos
                  * Three-way: 3 asientos
            */}
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
            <button className="lc-mode-card" onClick={() => selectGameMode('Three-way', 3, 20)}>
              <div className="lc-mode-icon">🔺</div>
              <h3>Three-way</h3>
              <p>Free-for-all • 3 jugadores • 20 vidas</p>
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
                        onClick={() => {
                          const manaColors = player.manaColors.includes(mana.symbol)
                            ? player.manaColors.filter(m => m !== mana.symbol)
                            : [...player.manaColors, mana.symbol];
                          updatePlayer(player.id, { manaColors });
                        }}
                      >
                        <img src={mana.image} alt={mana.name} className="lc-mana-image" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lc-form-group">
                  <label>Imagen de Fondo</label>
                  <div className="lc-background-picker">
                    {BACKGROUND_IMAGES.map(bg => (
                      <div
                        key={bg.id}
                        className={`lc-background-option ${player.backgroundImage === bg.url ? 'selected' : ''}`}
                        style={{
                          backgroundImage: bg.url ? `url(${bg.url})` : 'none',
                          backgroundColor: bg.url ? 'transparent' : 'rgba(255, 255, 255, 0.1)'
                        }}
                        onClick={() => updatePlayer(player.id, { backgroundImage: bg.url })}
                        title={bg.name}
                      >
                        {!bg.url && <span style={{ fontSize: '0.7rem', color: '#666' }}>Sin</span>}
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
          <div className={`lc-game-board lc-mode-${gameMode.toLowerCase().replace(/[^a-z0-9]/g, '')} lc-orientation-landscape`}>
            {players.map(player => (
              <div
                key={player.id}
                className={`lc-player-panel ${currentTurn === player.id ? 'active-turn' : ''} ${player.life === 0 ? 'defeated' : ''} ${getPlayerPositionClass(player.id)}`}
                style={{
                  backgroundColor: player.color,
                  '--bg-image': player.backgroundImage ? `url(${player.backgroundImage})` : 'none'
                }}
              >
                {/* Sección de información del jugador */}
                <div className="lc-player-info-section">
                  <div className="lc-player-name">{player.name}</div>
                  {player.deck && <div className="lc-player-deck">{player.deck}</div>}

                  {player.manaColors.length > 0 && (
                    <div className="lc-mana-display">
                      {player.manaColors.map(symbol => {
                        const mana = MANA_COLORS.find(m => m.symbol === symbol);
                        return mana ? (
                          <img
                            key={symbol}
                            src={mana.image}
                            alt={mana.name}
                            className="lc-mana-symbol-img"
                          />
                        ) : null;
                      })}
                    </div>
                  )}

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

                {/* Sección de contador de vida */}
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

                {/* Indicador de turno activo - Clickeable para avanzar */}
                {currentTurn === player.id && (
                  <div className="lc-turn-indicator" onClick={nextTurn}>
                    <div className="lc-turn-info">
                      <span className="lc-turn-badge">Ronda {turnNumber}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Botón de menú central - Alterna entre ☰ y logo */}
            <button
              className="lc-btn-menu-center"
              onClick={handleMenuButtonClick}
              onMouseDown={startMenuButtonLongPress}
              onMouseUp={endMenuButtonLongPress}
              onMouseLeave={endMenuButtonLongPress}
              onTouchStart={startMenuButtonLongPress}
              onTouchEnd={endMenuButtonLongPress}
              title="Click: abrir menú | Long press: cambiar icono"
            >
              {menuButtonShowsLogo ? (
                <img src="/logo-lifecounter-negro.png" alt="Menu" className="lc-menu-logo" />
              ) : (
                '☰'
              )}
            </button>
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
            <div className="lc-menu-info">
              <p>Ronda: <strong>{turnNumber}</strong></p>
              <p>Turno actual: <strong>{players[currentTurn]?.name}</strong></p>
            </div>


            <button className="lc-btn lc-btn-primary lc-btn-block" onClick={() => { nextTurn(); setShowMenu(false); }}>
              ▶ Siguiente Turno
            </button>
            <button className="lc-btn lc-btn-block" onClick={() => setShowMenu(false)}>
              Continuar
            </button>
            <button className="lc-btn lc-btn-secondary lc-btn-block" onClick={toggleFullscreen}>
              ⛶ Pantalla Completa
            </button>
            <button className="lc-btn lc-btn-secondary lc-btn-block" onClick={resetGame}>
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
              <h4>Imagen de Fondo</h4>
              <div className="lc-background-picker">
                {BACKGROUND_IMAGES.map(bg => (
                  <div
                    key={bg.id}
                    className={`lc-background-option ${players[selectedPlayer]?.backgroundImage === bg.url ? 'selected' : ''}`}
                    style={{
                      backgroundImage: bg.url ? `url(${bg.url})` : 'none',
                      backgroundColor: bg.url ? 'transparent' : 'rgba(255, 255, 255, 0.1)'
                    }}
                    onClick={() => updatePlayer(selectedPlayer, { backgroundImage: bg.url })}
                    title={bg.name}
                  >
                    {!bg.url && <span style={{ fontSize: '0.7rem', color: '#999' }}>Sin</span>}
                  </div>
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

      {/* Selección de Equipos para 2v2 */}
      {showTeamSelection && (
        <div className="lc-modal">
          <div className="lc-modal-content lc-team-selection-modal">
            <h3>Formar Equipos (2v2)</h3>
            <p className="lc-assignment-text">Selecciona 2 jugadores para el Equipo 1</p>

            <div className="lc-team-formation">
              <div className="lc-team-box">
                <h4>Equipo 1</h4>
                <div className="lc-team-members-list">
                  {teamSelections.team1.length === 0 && <p className="lc-empty-team">Selecciona jugadores...</p>}
                  {teamSelections.team1.map(name => (
                    <div key={name} className="lc-team-member">
                      {name}
                      <button
                        className="lc-remove-btn"
                        onClick={() => setTeamSelections(prev => ({
                          ...prev,
                          team1: prev.team1.filter(n => n !== name)
                        }))}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lc-team-box">
                <h4>Equipo 2</h4>
                <div className="lc-team-members-list">
                  {teamSelections.team2.length === 0 && <p className="lc-empty-team">Resto de jugadores...</p>}
                  {teamSelections.team2.map(name => (
                    <div key={name} className="lc-team-member">{name}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lc-available-players">
              {PREDEFINED_PLAYERS
                .filter(name => !teamSelections.team1.includes(name) && !teamSelections.team2.includes(name))
                .map(name => (
                  <button
                    key={name}
                    className="lc-player-select-btn"
                    onClick={() => {
                      if (teamSelections.team1.length < 2) {
                        const newTeam1 = [...teamSelections.team1, name];

                        // Solo llenar team2 cuando team1 esté completo (2 jugadores)
                        if (newTeam1.length === 2) {
                          const remaining = PREDEFINED_PLAYERS.filter(n => !newTeam1.includes(n));
                          setTeamSelections({ team1: newTeam1, team2: remaining });
                        } else {
                          // Solo actualizar team1, dejar team2 vacío
                          setTeamSelections({ ...teamSelections, team1: newTeam1 });
                        }
                      }
                    }}
                    disabled={teamSelections.team1.length >= 2}
                  >
                    {name}
                  </button>
                ))}
            </div>

            <button
              className="lc-btn lc-btn-primary lc-btn-large"
              disabled={teamSelections.team1.length !== 2}
              onClick={() => {
                initializePlayers(2, startingLife, true, teamSelections);
                setShowTeamSelection(false);
                setScreen('setup');
              }}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Asignación de Asientos */}
      {showSeatAssignment && (
        <div className="lc-modal">
          <div className="lc-modal-content lc-seat-assignment-modal">
            <h3>Asignación de Asientos</h3>
            <p className="lc-assignment-text">
              {assigningPlayer
                ? `${assigningPlayer}: Toca el asiento donde te vas a sentar`
                : 'Selecciona un jugador para asignar su asiento'}
            </p>

            {/* Lista de jugadores disponibles */}
            {!assigningPlayer && (
              <div className="lc-available-players">
                {/* En 1v1: mostrar los 4 jugadores, elegir 2 */}
                {gameMode === '1v1' ? (
                  PREDEFINED_PLAYERS.filter(name => !Object.values(seatAssignment).includes(name)).map(name => (
                    <button
                      key={name}
                      className="lc-player-select-btn"
                      style={{ borderColor: '#6366f1' }}
                      onClick={() => setAssigningPlayer(name)}
                    >
                      {name}
                    </button>
                  ))
                ) : (
                  players.filter(p => !Object.values(seatAssignment).includes(p.name)).map(player => (
                    <button
                      key={player.id}
                      className="lc-player-select-btn"
                      style={{ borderColor: player.color }}
                      onClick={() => setAssigningPlayer(player.name)}
                    >
                      {player.name}
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Tablero de asientos */}
            <div className={`lc-seat-grid lc-mode-${gameMode.toLowerCase().replace(/[^a-z0-9]/g, '')}`}>
              {Array.from({ length: playerCount }).map((_, index) => (
                <div
                  key={index}
                  className={`lc-seat-slot ${seatAssignment[index] ? 'occupied' : ''} ${assigningPlayer ? 'selectable' : ''}`}
                  onClick={() => assigningPlayer && assignPlayerToSeat(index)}
                >
                  <div className="lc-seat-number">Asiento {index + 1}</div>
                  {seatAssignment[index] && (
                    <div className="lc-seat-player">{seatAssignment[index]}</div>
                  )}
                </div>
              ))}
            </div>

            {assigningPlayer && (
              <button
                className="lc-btn lc-btn-secondary lc-btn-block"
                onClick={() => setAssigningPlayer(null)}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

      {/* High Roll Modal */}
      {showHighRoll && (
        <div className="lc-modal">
          <div className="lc-modal-content lc-highroll-modal">
            {!showHighRollResult ? (
              <>
                <h3>🎲 High Roll</h3>
                <p className="lc-highroll-text">Determinar jugador inicial</p>
                <div className="lc-dice-animation">
                  <div className="lc-dice">🎲</div>
                </div>
                <button
                  className="lc-btn lc-btn-primary lc-btn-large"
                  onClick={performHighRoll}
                >
                  Lanzar Dados
                </button>
              </>
            ) : (
              <>
                <h3>🎲 Ganador del High Roll</h3>
                <div className="lc-highroll-winner-animation">
                  <div className="lc-winner-name">{players[highRollWinner]?.name}</div>
                  <p className="lc-winner-subtitle">empieza la partida</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cartel de Cambio de Ronda */}
      {showRoundChange && (
        <div className="lc-round-change-overlay">
          <div className="lc-round-change-banner">
            <h2>Ronda {newRoundNumber}</h2>
          </div>
        </div>
      )}

      {/* Notificación de Victoria */}
      {victoryDetected && screen === 'game' && (
        <div className="lc-victory-notification">
          <div className="lc-victory-content">
            <h2>🏆 Victoria Detectada</h2>
            <p>Solo queda un jugador con vida</p>
            <div className="lc-victory-actions">
              <button className="lc-btn lc-btn-secondary" onClick={() => setVictoryDetected(false)}>
                Continuar Partida
              </button>
              <button className="lc-btn lc-btn-primary" onClick={endGame}>
                Finalizar
              </button>
            </div>
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
              <button className="lc-btn lc-btn-primary" onClick={handleSaveResults}>
                Cargar Información
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de contraseña para guardar partida */}
      {showPasswordPrompt && (
        <div className="lc-modal" onClick={() => setShowPasswordPrompt(false)}>
          <div className="lc-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>🔒 Autenticación Requerida</h3>
            <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>
              Ingresa la contraseña para guardar la partida
            </p>

            <div className="lc-form-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && saveResults()}
                placeholder="Ingresa la contraseña"
                autoFocus
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1rem',
                  borderRadius: '8px',
                  border: passwordError ? '2px solid #ff4757' : '2px solid rgba(255,255,255,0.2)',
                  background: 'rgba(0,0,0,0.3)',
                  color: 'white'
                }}
              />
              {passwordError && (
                <div style={{ color: '#ff4757', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  {passwordError}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                className="lc-btn lc-btn-secondary"
                onClick={() => setShowPasswordPrompt(false)}
                style={{ flex: 1 }}
              >
                Cancelar
              </button>
              <button
                className="lc-btn lc-btn-primary"
                onClick={saveResults}
                style={{ flex: 1 }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Lifecounter;
