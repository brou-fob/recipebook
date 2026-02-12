import React from 'react';
import './Header.css';

function Header({ onSettingsClick }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <h1>🍳 RecipeBook</h1>
          <p className="tagline">Your Digital Recipe Collection</p>
        </div>
        {onSettingsClick && (
          <button className="settings-btn" onClick={onSettingsClick} title="Settings">
            ⚙️ Settings
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
