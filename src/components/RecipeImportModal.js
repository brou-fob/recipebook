import React, { useState } from 'react';
import './RecipeImportModal.css';
import { importRecipe } from '../utils/recipeImport';
import { parseBulkCSV } from '../utils/csvBulkImport';

function RecipeImportModal({ onImport, onBulkImport, onCancel }) {
  const [importText, setImportText] = useState('');
  const [error, setError] = useState('');

  const handleImport = () => {
    setError('');
    
    if (!importText.trim()) {
      setError('Bitte geben Sie Rezeptdaten ein');
      return;
    }

    try {
      const recipe = importRecipe(importText);
      onImport(recipe);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCSVFileUpload = async (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) return;

    // Check file extension and MIME type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Bitte wählen Sie eine CSV-Datei aus');
      return;
    }
    
    if (file.type && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      setError('Ungültiger Dateityp. Bitte wählen Sie eine CSV-Datei aus');
      return;
    }

    try {
      const text = await file.text();
      const recipes = parseBulkCSV(text);
      
      // Use bulk import callback if available, otherwise fall back to single import
      if (onBulkImport) {
        onBulkImport(recipes);
      } else {
        // If only single import is supported, import first recipe only
        if (recipes.length > 0) {
          onImport(recipes[0]);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };



  return (
    <div className="modal-overlay">
      <div className="import-modal">
        <div className="import-modal-header">
          <h2>Rezept importieren</h2>
          <button className="close-button" onClick={onCancel}>✕</button>
        </div>

        <div className="import-modal-content">
          <p className="import-instructions">
            Fügen Sie Ihre Rezeptdaten ein oder laden Sie eine CSV-Datei hoch. 
            Unterstützte Formate: JSON, Notion Markdown, CSV (für Bulk-Import)
          </p>

          <div className="csv-upload-section">
            <label htmlFor="csv-upload" className="csv-upload-label">
              📄 CSV-Datei hochladen (Bulk-Import)
            </label>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleCSVFileUpload}
              className="csv-file-input"
            />
            <p className="csv-help-text">
              CSV-Dateien können mehrere Rezepte auf einmal importieren. 
              Alle importierten Rezepte werden automatisch als privat markiert.
            </p>
          </div>

          <div className="text-import-divider">
            <span>oder Text einfügen</span>
          </div>

          <textarea
            className="import-textarea"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={`JSON:\n{\n  "title": "Rezeptname",\n  "ingredients": [...],\n  "steps": [...]\n}\n\nNotion Markdown:\n# Rezeptname\nPortionen: 4\n## Zutaten\n- Zutat 1\n## Zubereitung\n1. Schritt 1`}
            rows="15"
          />

          {error && (
            <div className="import-error">
              {error}
            </div>
          )}
        </div>

        <div className="import-modal-actions">
          <button className="cancel-button" onClick={onCancel}>
            Abbrechen
          </button>
          <button className="import-button" onClick={handleImport}>
            Importieren
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecipeImportModal;
