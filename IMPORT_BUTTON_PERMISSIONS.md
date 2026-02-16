# Import-Button Berechtigungen

## Übersicht

Der Import-Button auf der Seite "Neues Rezept hinzufügen" ermöglicht es Benutzern, Rezepte aus externen Quellen zu importieren. Dieses Dokument klärt, welche Benutzerrollen Zugriff auf diese Funktionalität haben.

## Berechtigungen

### Wer kann den Import-Button sehen?

Der Import-Button ist sichtbar für alle Benutzer mit folgenden Rollen:

- ✅ **EDIT** (Bearbeiten-Rolle) - Reguläre Benutzer mit Bearbeitungsrechten
- ✅ **ADMIN** (Administrator-Rolle) - Administratoren

### Wer kann den Import-Button NICHT sehen?

Der Import-Button ist NICHT sichtbar für Benutzer mit folgenden Rollen:

- ❌ **READ** (Lesen-Rolle) - Nur-Lese-Benutzer
- ❌ **COMMENT** (Kommentar-Rolle) - Benutzer, die nur kommentieren können
- ❌ **GUEST** (Gast-Rolle) - Temporäre Gastzugriffe

## Rollenhierarchie

Die Rollen sind hierarchisch aufgebaut (von niedrigster zu höchster Berechtigung):

1. **GUEST** - Kann nur Rezepte lesen (temporär)
2. **READ** - Kann nur Rezepte lesen
3. **COMMENT** - Kann lesen und kommentieren
4. **EDIT** - Kann lesen, kommentieren, und Rezepte erstellen/bearbeiten
5. **ADMIN** - Kann alles tun (inklusive Löschen)

## Implementierungsdetails

### Code-Lokation
- **Datei**: `src/components/RecipeForm.js`
- **Zeilen**: 291-338 (Import-Button: 324-336)

### Berechtigungsprüfung
Der Import-Button selbst hat **keine direkte Rollenprüfung**. Die Zugriffskontrolle erfolgt auf höherer Ebene:

1. In `RecipeList.js` wird die Funktion `canEditRecipes(currentUser)` verwendet
2. Diese Funktion prüft, ob der Benutzer die EDIT-Rolle oder höher hat
3. Nur Benutzer, die diese Prüfung bestehen, sehen den "Rezept hinzufügen" Button
4. Wenn sie auf "Rezept hinzufügen" klicken, gelangen sie zur RecipeForm
5. In der RecipeForm wird der Import-Button für alle angezeigt (da sie bereits die Berechtigung haben)

### Unterschied zu OCR-Scan Button
Im Gegensatz zum Import-Button hat der OCR-Scan Button eine zusätzliche Einschränkung:
- Der OCR-Scan Button ist nur sichtbar, wenn `currentUser.fotoscan === true`
- Dies ist eine separate Berechtigung, die unabhängig von der Rolle ist
- Der Import-Button hat diese zusätzliche Einschränkung NICHT

## Tests

Die Berechtigungen werden durch folgende Tests verifiziert:

### Test 1: Import-Button für Nicht-Admin-Benutzer mit EDIT-Rolle
```javascript
test('import button is visible for non-admin users with edit role', () => {
  const nonAdminEditUser = {
    isAdmin: false,  // Explizit KEIN Admin
    role: 'edit',    // Hat aber EDIT-Rolle
    fotoscan: false,
  };
  // Import-Button sollte sichtbar sein
});
```

### Test 2: Import-Button für Admin-Benutzer
```javascript
test('import button is visible for admin users', () => {
  const adminUser = {
    isAdmin: true,
    role: 'admin',
    fotoscan: false,
  };
  // Import-Button sollte sichtbar sein
});
```

### Test 3: Import-Button unabhängig von fotoscan
```javascript
test('import button is always visible regardless of fotoscan setting', () => {
  const userWithoutFotoscan = {
    isAdmin: false,
    role: 'edit',
    fotoscan: false,  // Fotoscan ist deaktiviert
  };
  // Import-Button sollte trotzdem sichtbar sein
});
```

## Häufige Fragen

### F: Warum kann ich den Import-Button nicht sehen?
**A**: Überprüfen Sie Ihre Benutzerrolle. Nur Benutzer mit der EDIT- oder ADMIN-Rolle können Rezepte erstellen und importieren. Kontaktieren Sie einen Administrator, um Ihre Rolle zu ändern.

### F: Ist der Import-Button nur für Administratoren?
**A**: Nein! Der Import-Button ist für alle Benutzer mit EDIT-Rolle oder höher verfügbar, nicht nur für Administratoren.

### F: Was ist der Unterschied zwischen isAdmin und role="admin"?
**A**: 
- `isAdmin` ist ein boolesches Feld, das anzeigt, ob der Benutzer administrative Rechte hat
- `role` ist ein String, der die Berechtigungsstufe angibt ("admin", "edit", "comment", "read", "guest")
- Der erste Benutzer im System bekommt automatisch `isAdmin: true` und `role: "admin"`
- Andere Benutzer bekommen standardmäßig `isAdmin: false` und `role: "read"`
- Ein Administrator kann die Rolle eines Benutzers auf "edit" ändern, wodurch dieser Benutzer Rezepte erstellen und den Import-Button verwenden kann

### F: Wie ändere ich die Rolle eines Benutzers?
**A**: Nur Administratoren können Benutzerrollen ändern. Dies erfolgt über die Benutzerverwaltung in den Einstellungen.

## Zusammenfassung

Der Import-Button ist **bereits korrekt implementiert** und für die gewünschten Benutzerrollen (EDIT und ADMIN) sichtbar, nicht nur für Administratoren. Die Implementierung entspricht den Anforderungen und wurde durch Tests verifiziert.
