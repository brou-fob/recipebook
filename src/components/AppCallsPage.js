import React, { useState, useEffect } from 'react';
import './AppCallsPage.css';
import { getAppCalls } from '../utils/appCallsFirestore';
import { getRecipeCalls } from '../utils/recipeCallsFirestore';

function AppCallsPage({ onBack, currentUser }) {
  const [appCalls, setAppCalls] = useState([]);
  const [recipeCalls, setRecipeCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('app');

  useEffect(() => {
    const loadData = async () => {
      const [fetchedAppCalls, fetchedRecipeCalls] = await Promise.all([getAppCalls(), getRecipeCalls()]);
      setAppCalls(fetchedAppCalls);
      setRecipeCalls(fetchedRecipeCalls);
      setLoading(false);
    };
    loadData();
  }, []);

  if (!currentUser?.appCalls) {
    return (
      <div className="app-calls-container">
        <div className="app-calls-header">
          <button className="back-button" onClick={onBack}>← Zurück</button>
          <h2>Appaufrufe</h2>
        </div>
        <div className="app-calls-content">
          <p className="app-calls-info-text">
            Sie haben keine Berechtigung, diese Seite aufzurufen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-calls-container">
      <div className="app-calls-header">
        <button className="back-button" onClick={onBack}>← Zurück</button>
        <h2>Appaufrufe</h2>
      </div>
      <div className="app-calls-tabs">
        <button
          className={`app-calls-tab${activeTab === 'app' ? ' active' : ''}`}
          onClick={() => setActiveTab('app')}
        >
          App-Aufrufe
        </button>
        <button
          className={`app-calls-tab${activeTab === 'recipe' ? ' active' : ''}`}
          onClick={() => setActiveTab('recipe')}
        >
          Rezeptaufrufe
        </button>
      </div>
      <div className="app-calls-content">
        {activeTab === 'app' ? (
          <>
            <p className="app-calls-info-text">
              Hier sind alle Appaufrufe gemeinsam mit den zugehörigen Anwendern dokumentiert.
              Diese Übersicht dient der Nachvollziehbarkeit und kann für Auditing- oder Supportzwecke
              herangezogen werden.
            </p>
            {loading ? (
              <div className="app-calls-empty">Laden...</div>
            ) : appCalls.length === 0 ? (
              <div className="app-calls-empty">Noch keine Appaufrufe vorhanden.</div>
            ) : (
              <>
                <div className="app-calls-table-container">
                  <table className="app-calls-table">
                    <thead>
                      <tr>
                        <th>Datum &amp; Uhrzeit</th>
                        <th>Vorname</th>
                        <th>Nachname</th>
                        <th>E-Mail</th>
                        <th>Art</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appCalls.map((call) => (
                        <tr key={call.id}>
                          <td>
                            {call.timestamp?.toDate
                              ? call.timestamp.toDate().toLocaleString('de-DE')
                              : '–'}
                          </td>
                          <td>{call.userVorname}</td>
                          <td>{call.userNachname}</td>
                          <td>{call.userEmail}</td>
                          <td>{call.isGuest ? 'Gast' : 'Angemeldet'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="app-calls-stats">
                  Gesamt: <strong>{appCalls.length}</strong> Einträge
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <p className="app-calls-info-text">
              Hier werden alle Rezeptaufrufe mit den zugehörigen Anwendern und Rezepten protokolliert.
              Diese Übersicht ermöglicht die Auswertung, welche Rezepte wie häufig aufgerufen werden.
            </p>
            {loading ? (
              <div className="app-calls-empty">Laden...</div>
            ) : recipeCalls.length === 0 ? (
              <div className="app-calls-empty">Noch keine Rezeptaufrufe vorhanden.</div>
            ) : (
              <>
                <div className="app-calls-table-container">
                  <table className="app-calls-table">
                    <thead>
                      <tr>
                        <th>Datum &amp; Uhrzeit</th>
                        <th>Rezept</th>
                        <th>Vorname</th>
                        <th>Nachname</th>
                        <th>E-Mail</th>
                        <th>Art</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipeCalls.map((call) => (
                        <tr key={call.id}>
                          <td>
                            {call.timestamp?.toDate
                              ? call.timestamp.toDate().toLocaleString('de-DE')
                              : '–'}
                          </td>
                          <td>{call.recipeTitle}</td>
                          <td>{call.userVorname}</td>
                          <td>{call.userNachname}</td>
                          <td>{call.userEmail}</td>
                          <td>{call.isGuest ? 'Gast' : 'Angemeldet'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="app-calls-stats">
                  Gesamt: <strong>{recipeCalls.length}</strong> Einträge
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AppCallsPage;
