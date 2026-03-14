import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const GlobalNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="global-nav">
      <div className="nav-brand" onClick={() => navigate('/')}>
        <span className="nav-logo-icon">☕</span>
        <span className="nav-logo-text">BrewIQ</span>
      </div>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Inventory App</Link>
        <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>About</Link>
        <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>Contact</Link>
      </div>
      <div className="nav-right">
        <button className="nav-cta" onClick={() => navigate('/login')}>Open App →</button>
        <div className="nav-avatar">AM</div>
      </div>
    </nav>
  );
};

export default GlobalNavbar;
