import React, { useState, useEffect } from 'react';
import './UserManagement.css';
import { 
  getUsers, 
  updateUserAdminStatus, 
  getAdminCount,
  updateUserProfile,
  setTemporaryPassword
} from '../utils/userManagement';

function UserManagement({ onBack, currentUser }) {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' }); // 'success' or 'error'
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({
    vorname: '',
    nachname: '',
    tempPassword: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(getUsers());
  };

  const handleToggleAdmin = (userId, currentAdminStatus) => {
    const newAdminStatus = !currentAdminStatus;
    const result = updateUserAdminStatus(userId, newAdminStatus);
    
    if (result.success) {
      loadUsers();
      setMessage({ text: result.message, type: 'success' });
    } else {
      setMessage({ text: result.message, type: 'error' });
    }
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const canRemoveAdmin = (userId, isAdmin) => {
    if (!isAdmin) return true;
    const adminCount = getAdminCount();
    return adminCount > 1;
  };

  const handleEditUser = (user) => {
    setEditingUserId(user.id);
    setEditForm({
      vorname: user.vorname,
      nachname: user.nachname,
      tempPassword: ''
    });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditForm({
      vorname: '',
      nachname: '',
      tempPassword: ''
    });
  };

  const handleSaveEdit = (userId) => {
    // Update profile
    const profileResult = updateUserProfile(userId, {
      vorname: editForm.vorname,
      nachname: editForm.nachname
    });

    if (!profileResult.success) {
      setMessage({ text: profileResult.message, type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return;
    }

    // Set temporary password if provided
    if (editForm.tempPassword) {
      const passwordResult = setTemporaryPassword(userId, editForm.tempPassword);
      
      if (!passwordResult.success) {
        setMessage({ text: passwordResult.message, type: 'error' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        return;
      }
      
      setMessage({ 
        text: 'Profil und temporäres Passwort erfolgreich aktualisiert.', 
        type: 'success' 
      });
    } else {
      setMessage({ text: profileResult.message, type: 'success' });
    }

    loadUsers();
    handleCancelEdit();
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleFormChange = (field, value) => {
    setEditForm({
      ...editForm,
      [field]: value
    });
  };

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <button className="back-button" onClick={onBack}>
          ← Zurück
        </button>
        <h2>Benutzerverwaltung</h2>
      </div>

      <div className="user-management-content">
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        <p className="info-text">
          Hier können Sie alle registrierten Benutzerkonten einsehen und Administrator-Rechte verwalten.
        </p>
        
        {users.length === 0 ? (
          <div className="empty-state">
            <p>Keine Benutzer vorhanden.</p>
          </div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Vorname</th>
                  <th>Nachname</th>
                  <th>E-Mail</th>
                  <th>Registriert am</th>
                  <th>Administrator</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={user.id === currentUser?.id ? 'current-user' : ''}>
                    {editingUserId === user.id ? (
                      <>
                        <td>
                          <input
                            type="text"
                            className="edit-input"
                            value={editForm.vorname}
                            onChange={(e) => handleFormChange('vorname', e.target.value)}
                            placeholder="Vorname"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="edit-input"
                            value={editForm.nachname}
                            onChange={(e) => handleFormChange('nachname', e.target.value)}
                            placeholder="Nachname"
                          />
                        </td>
                        <td>{user.email}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString('de-DE')}</td>
                        <td>
                          <label className="admin-toggle">
                            <input
                              type="checkbox"
                              checked={user.isAdmin}
                              onChange={() => handleToggleAdmin(user.id, user.isAdmin)}
                              disabled={!canRemoveAdmin(user.id, user.isAdmin)}
                              title={
                                !canRemoveAdmin(user.id, user.isAdmin)
                                  ? 'Es muss mindestens ein Administrator vorhanden sein'
                                  : 'Admin-Status ändern'
                              }
                            />
                            <span className="toggle-slider"></span>
                          </label>
                          {user.isAdmin && getAdminCount() === 1 && (
                            <span className="admin-lock-hint" title="Einziger Administrator">
                              🔒
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="edit-actions">
                            <div className="temp-password-group">
                              <input
                                type="password"
                                className="edit-input temp-password-input"
                                value={editForm.tempPassword}
                                onChange={(e) => handleFormChange('tempPassword', e.target.value)}
                                placeholder="Temp. Passwort (optional)"
                                title="Temporäres Passwort setzen (mind. 6 Zeichen)"
                              />
                            </div>
                            <div className="button-group">
                              <button 
                                className="save-btn"
                                onClick={() => handleSaveEdit(user.id)}
                                title="Änderungen speichern"
                              >
                                ✓
                              </button>
                              <button 
                                className="cancel-btn"
                                onClick={handleCancelEdit}
                                title="Abbrechen"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{user.vorname}</td>
                        <td>{user.nachname}</td>
                        <td>{user.email}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString('de-DE')}</td>
                        <td>
                          <label className="admin-toggle">
                            <input
                              type="checkbox"
                              checked={user.isAdmin}
                              onChange={() => handleToggleAdmin(user.id, user.isAdmin)}
                              disabled={!canRemoveAdmin(user.id, user.isAdmin)}
                              title={
                                !canRemoveAdmin(user.id, user.isAdmin)
                                  ? 'Es muss mindestens ein Administrator vorhanden sein'
                                  : 'Admin-Status ändern'
                              }
                            />
                            <span className="toggle-slider"></span>
                          </label>
                          {user.isAdmin && getAdminCount() === 1 && (
                            <span className="admin-lock-hint" title="Einziger Administrator">
                              🔒
                            </span>
                          )}
                        </td>
                        <td>
                          <button 
                            className="edit-user-btn"
                            onClick={() => handleEditUser(user)}
                            title="Benutzer bearbeiten"
                          >
                            ✏️ Bearbeiten
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="user-stats">
          <div className="stat-item">
            <strong>Gesamt:</strong> {users.length} Benutzer
          </div>
          <div className="stat-item">
            <strong>Administratoren:</strong> {getAdminCount()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
