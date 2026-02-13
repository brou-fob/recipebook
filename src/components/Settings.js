import React, { useState, useEffect } from 'react';
import './Settings.css';
import { getCustomLists, saveCustomLists, resetCustomLists } from '../utils/customLists';
import { isCurrentUserAdmin } from '../utils/userManagement';
import UserManagement from './UserManagement';

function Settings({ onBack, currentUser }) {
  const [lists, setLists] = useState({
    cuisineTypes: [],
    mealCategories: [],
    units: [],
    portionUnits: []
  });
  const [newCuisine, setNewCuisine] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newPortionSingular, setNewPortionSingular] = useState('');
  const [newPortionPlural, setNewPortionPlural] = useState('');
  const [activeTab, setActiveTab] = useState('lists'); // 'lists', 'portionUnits', or 'users'
  const isAdmin = isCurrentUserAdmin();

  // Cleanup timeout on unmount
  useEffect(() => {
    setLists(getCustomLists());
  }, []);

  const handleSave = () => {
    saveCustomLists(lists);
    alert('Einstellungen erfolgreich gespeichert!');
  };

  const handleReset = () => {
    if (window.confirm('Möchten Sie wirklich alle Listen auf die Standardwerte zurücksetzen?')) {
      const defaultLists = resetCustomLists();
      setLists(defaultLists);
      alert('Listen auf Standardwerte zurückgesetzt!');
    }
  };

  const addCuisine = () => {
    if (newCuisine.trim() && !lists.cuisineTypes.includes(newCuisine.trim())) {
      setLists({
        ...lists,
        cuisineTypes: [...lists.cuisineTypes, newCuisine.trim()]
      });
      setNewCuisine('');
    }
  };

  const removeCuisine = (cuisine) => {
    setLists({
      ...lists,
      cuisineTypes: lists.cuisineTypes.filter(c => c !== cuisine)
    });
  };

  const addCategory = () => {
    if (newCategory.trim() && !lists.mealCategories.includes(newCategory.trim())) {
      setLists({
        ...lists,
        mealCategories: [...lists.mealCategories, newCategory.trim()]
      });
      setNewCategory('');
    }
  };

  const removeCategory = (category) => {
    setLists({
      ...lists,
      mealCategories: lists.mealCategories.filter(c => c !== category)
    });
  };

  const addUnit = () => {
    if (newUnit.trim() && !lists.units.includes(newUnit.trim())) {
      setLists({
        ...lists,
        units: [...lists.units, newUnit.trim()]
      });
      setNewUnit('');
    }
  };

  const removeUnit = (unit) => {
    setLists({
      ...lists,
      units: lists.units.filter(u => u !== unit)
    });
  };

  const addPortionUnit = () => {
    if (newPortionSingular.trim() && newPortionPlural.trim()) {
      const newId = newPortionSingular.toLowerCase().replace(/\s+/g, '-');
      const exists = lists.portionUnits.some(pu => pu.id === newId);
      
      if (!exists) {
        setLists({
          ...lists,
          portionUnits: [...lists.portionUnits, {
            id: newId,
            singular: newPortionSingular.trim(),
            plural: newPortionPlural.trim()
          }]
        });
        setNewPortionSingular('');
        setNewPortionPlural('');
      }
    }
  };

  const removePortionUnit = (unitId) => {
    setLists({
      ...lists,
      portionUnits: lists.portionUnits.filter(pu => pu.id !== unitId)
    });
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button className="back-button" onClick={onBack}>
          ← Zurück
        </button>
        <h2>Einstellungen</h2>
      </div>

      {isAdmin && (
        <div className="settings-tabs">
          <button
            className={`tab-button ${activeTab === 'lists' ? 'active' : ''}`}
            onClick={() => setActiveTab('lists')}
          >
            Listen & Kategorien
          </button>
          <button
            className={`tab-button ${activeTab === 'portionUnits' ? 'active' : ''}`}
            onClick={() => setActiveTab('portionUnits')}
          >
            Portionseinheiten
          </button>
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Benutzerverwaltung
          </button>
        </div>
      )}

      <div className="settings-content">
        {activeTab === 'lists' ? (
          <>
            <div className="settings-section">
          <h3>Kulinarik-Typen</h3>
          <div className="list-input">
            <input
              type="text"
              value={newCuisine}
              onChange={(e) => setNewCuisine(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCuisine()}
              placeholder="Neuen Kulinarik-Typ hinzufügen..."
            />
            <button onClick={addCuisine}>Hinzufügen</button>
          </div>
          <div className="list-items">
            {lists.cuisineTypes.map((cuisine) => (
              <div key={cuisine} className="list-item">
                <span>{cuisine}</span>
                <button
                  className="remove-btn"
                  onClick={() => removeCuisine(cuisine)}
                  title="Entfernen"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h3>Speisekategorien</h3>
          <div className="list-input">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCategory()}
              placeholder="Neue Speisekategorie hinzufügen..."
            />
            <button onClick={addCategory}>Hinzufügen</button>
          </div>
          <div className="list-items">
            {lists.mealCategories.map((category) => (
              <div key={category} className="list-item">
                <span>{category}</span>
                <button
                  className="remove-btn"
                  onClick={() => removeCategory(category)}
                  title="Entfernen"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h3>Maßeinheiten</h3>
          <div className="list-input">
            <input
              type="text"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addUnit()}
              placeholder="Neue Einheit hinzufügen..."
            />
            <button onClick={addUnit}>Hinzufügen</button>
          </div>
          <div className="list-items">
            {lists.units.map((unit) => (
              <div key={unit} className="list-item">
                <span>{unit}</span>
                <button
                  className="remove-btn"
                  onClick={() => removeUnit(unit)}
                  title="Entfernen"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-actions">
          <button className="reset-button" onClick={handleReset}>
            Auf Standard zurücksetzen
          </button>
          <button className="save-button" onClick={handleSave}>
            Einstellungen speichern
          </button>
        </div>
      </>
        ) : activeTab === 'portionUnits' ? (
          <>
            <div className="settings-section">
              <h3>Portionseinheiten</h3>
              <p className="section-description">
                Definieren Sie benutzerdefinierte Portionseinheiten mit Singular- und Pluralformen (z.B. Pizza/Pizzen, Drink/Drinks).
              </p>
              <div className="list-input portion-unit-input">
                <input
                  type="text"
                  value={newPortionSingular}
                  onChange={(e) => setNewPortionSingular(e.target.value)}
                  placeholder="Singular (z.B. Pizza)"
                />
                <input
                  type="text"
                  value={newPortionPlural}
                  onChange={(e) => setNewPortionPlural(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPortionUnit()}
                  placeholder="Plural (z.B. Pizzen)"
                />
                <button onClick={addPortionUnit}>Hinzufügen</button>
              </div>
              <div className="list-items">
                {lists.portionUnits.map((unit) => (
                  <div key={unit.id} className="list-item">
                    <span>{unit.singular} / {unit.plural}</span>
                    <button
                      className="remove-btn"
                      onClick={() => removePortionUnit(unit.id)}
                      title="Entfernen"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="settings-actions">
              <button className="reset-button" onClick={handleReset}>
                Auf Standard zurücksetzen
              </button>
              <button className="save-button" onClick={handleSave}>
                Einstellungen speichern
              </button>
            </div>
          </>
        ) : (
          <UserManagement onBack={() => setActiveTab('lists')} currentUser={currentUser} />
        )}
      </div>
    </div>
  );
}

export default Settings;
