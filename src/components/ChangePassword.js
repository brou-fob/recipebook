import React, { useState } from 'react';
import './ChangePassword.css';

function ChangePassword({ onPasswordChange, user }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein.');
      return;
    }
    
    // Validate password length
    if (password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }
    
    const result = onPasswordChange(password);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="change-password-overlay">
      <div className="change-password-container">
        <div className="change-password-box">
          <h2>Passwort ändern erforderlich</h2>
          <p className="info-message">
            Sie wurden mit einem temporären Passwort angemeldet. 
            Bitte wählen Sie ein neues Passwort für Ihr Konto.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">Neues Passwort * (mind. 6 Zeichen)</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Passwort bestätigen *</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength="6"
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="submit-btn">Passwort ändern</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
