import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NavMenu.css';

const NavMenu = ({ show = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navigateTo = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Error al activar fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
    setIsOpen(false);
  };

  if (!show) return null;

  return (
    <>
      {/* Botón hamburguesa */}
      <button
        className="nav-menu-toggle"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay */}
      {isOpen && <div className="nav-menu-overlay" onClick={toggleMenu} />}

      {/* Menú lateral */}
      <nav className={`nav-menu ${isOpen ? 'open' : ''}`}>
        <div className="nav-menu-header">
          <h3>Navegación</h3>
          <button className="nav-menu-close" onClick={toggleMenu}>×</button>
        </div>

        <div className="nav-menu-items">
          <button
            className={`nav-menu-item ${isActive('/') ? 'active' : ''}`}
            onClick={() => navigateTo('/')}
          >
            <span className="nav-icon">🏆</span>
            <span className="nav-text">Leaderboard</span>
          </button>

          <button
            className={`nav-menu-item ${isActive('/lifecounter') ? 'active' : ''}`}
            onClick={() => navigateTo('/lifecounter')}
          >
            <span className="nav-icon">⚡</span>
            <span className="nav-text">Lifecounter</span>
          </button>

          <button
            className={`nav-menu-item ${isActive('/admin') ? 'active' : ''}`}
            onClick={() => navigateTo('/admin')}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Admin</span>
          </button>

          <button
            className="nav-menu-item"
            onClick={toggleFullscreen}
          >
            <span className="nav-icon">⛶</span>
            <span className="nav-text">Pantalla completa</span>
          </button>
        </div>

        <div className="nav-menu-footer">
          <p>MTG Leaderboard</p>
          <p className="nav-version">v1.0.0</p>
        </div>
      </nav>
    </>
  );
};

export default NavMenu;
