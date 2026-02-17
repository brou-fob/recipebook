# Implementierung: Automatische Versionierung

## Zusammenfassung

Diese Implementierung fügt automatisches Version-Bumping bei jedem Deployment zum `main` Branch hinzu. Die Lösung basiert auf **Conventional Commits** und **Semantic Versioning**.

## Implementierte Komponenten

### 1. Version-Bump Workflow (`.github/workflows/version-bump.yml`)

Ein wiederverwendbarer GitHub Actions Workflow, der:
- Alle Commits seit der letzten Version analysiert
- Den passenden Version-Bump-Typ bestimmt (major/minor/patch)
- Die `package.json` automatisch aktualisiert
- Git-Tags erstellt (z.B. `v0.2.0`)
- Änderungen zurück zum Repository pusht

**Logik:**
- `BREAKING CHANGE:` oder `feat!:`, `fix!:` → **MAJOR** (x.0.0)
- `feat:`, `feature:` → **MINOR** (0.x.0)
- `fix:`, `docs:`, `chore:`, etc. → **PATCH** (0.0.x)
- Keine Conventional Commits → **PATCH** (Standard)

**Fehlerbehandlung:**
- Git-Operationen werden überwacht
- Fehler werden im Workflow-Log detailliert angezeigt
- Bei Fehlern bricht der Workflow ab (kein Deployment)

### 2. Aktualisierter Deploy-Workflow (`.github/workflows/deploy.yml`)

Der bestehende Deploy-Workflow wurde erweitert:
- Ruft zuerst `version-bump.yml` als reusable workflow auf
- Wartet auf die neue Version
- Checkt die aktualisierte Version aus
- Führt Build und Deployment wie gewohnt durch

**Änderungen:**
- Permissions erweitert um `contents: write` (für Git-Push)
- Neuer Job `version-bump` vor dem `build` Job
- Checkout mit `fetch-depth: 0` für vollständige Git-Historie

### 3. Dokumentation

#### VERSIONING.md (erweitert)
- Komplette Erklärung der automatischen Versionierung
- Beispiele für verschiedene Commit-Typen
- Workflow-Beschreibung
- Troubleshooting-Sektion
- Best Practices

#### CHANGELOG.md (neu)
- Changelog-Format basierend auf "Keep a Changelog"
- Dokumentation aller Version-Änderungen
- Links zu Git-Tags und Releases

#### VERSIONING_QUICKREF.md (neu)
- Schnellreferenz für Entwickler
- Übersichtliche Beispiele
- Hilfe-Sektion

## Verwendung

### Für Entwickler

1. **Normaler Workflow** - keine Änderung nötig!
   ```bash
   git add .
   git commit -m "feat: Neue Export-Funktion"
   git push
   ```

2. **Version wird automatisch erhöht** basierend auf Commit-Präfix
   - `feat:` → Minor Version (0.1.1 → 0.2.0)
   - `fix:` → Patch Version (0.1.1 → 0.1.2)
   - `feat!:` oder `BREAKING CHANGE:` → Major Version (0.1.1 → 1.0.0)

3. **Deployment erfolgt automatisch** mit neuer Version

### Commit-Message Guidelines

**Empfohlen** (Conventional Commits):
```bash
feat: Füge neue Funktion hinzu
fix: Behebe Bug in Rezeptsuche
docs: Aktualisiere README
chore: Update dependencies
perf: Verbessere Performance
refactor: Code cleanup
feat!: Breaking Change
```

**Funktioniert auch** (Standard-Fallback zu PATCH):
```bash
git commit -m "Update components"
git commit -m "WIP: work in progress"
```

## Technische Details

### Workflow-Ablauf

```
Push to main
    ↓
version-bump Job
    ↓
├── Checkout Code
├── Get Last Tag (v0.1.1)
├── Get Commits since Tag
├── Analyze Commits
├── Determine Bump Type (minor)
├── npm version minor
│   ├── Updates package.json
│   └── Updates package-lock.json
├── Git Commit
├── Git Tag (v0.2.0)
└── Git Push
    ↓
build Job
    ↓
├── Checkout (with new version)
├── Build with REACT_APP_VERSION
└── Upload Artifact
    ↓
deploy Job
    ↓
└── Deploy to GitHub Pages
```

### Commit-Analyse Algorithmus

```bash
# Priorität (höchste zuerst):
1. BREAKING CHANGE oder !-Suffix → MAJOR
2. feat: oder feature: → MINOR
3. fix:, docs:, chore:, etc. → PATCH
4. Andere → PATCH (Standard)
```

### Git-Tag Format

- Tags folgen dem Format `vX.Y.Z` (z.B. `v0.2.0`)
- Werden automatisch erstellt und gepusht
- Sichtbar unter GitHub Releases/Tags

## Vorteile

✅ **Automatisiert**: Keine manuelle Versionierung mehr nötig
✅ **Konsistent**: Semantic Versioning wird eingehalten
✅ **Transparent**: Workflow-Logs zeigen alle Schritte
✅ **Fehlersicher**: Fehlerbehandlung und Validierung eingebaut
✅ **Dokumentiert**: Umfassende Dokumentation
✅ **Rückwärtskompatibel**: Funktioniert auch mit unkonventionellen Commits

## Akzeptanzkriterien (erfüllt)

- ✅ **Bei jedem Deployment wird die App-Version hochgezählt**
  → Automatisch bei jedem Push zum `main` Branch

- ✅ **Unterscheidung zwischen Major, Minor und Patch**
  → Basierend auf Conventional Commit Präfixen

- ✅ **Änderung der Versionsnummer muss eindeutig und automatisiert erfolgen**
  → Workflow analysiert Commits und bumpt Version automatisch

- ✅ **Dokumentation, wie und wann welche Versionserhöhung erfolgt**
  → VERSIONING.md, VERSIONING_QUICKREF.md und CHANGELOG.md

- ✅ **Bestehende Tools oder CI/CD-Skripte nutzen oder erweitern**
  → Erweitert bestehenden deploy.yml Workflow

- ✅ **Rückmeldung bzw. Fehler, wenn Version nicht korrekt aktualisiert**
  → Workflow bricht bei Fehlern ab, detaillierte Logs verfügbar

## Testing

Die Implementierung wurde getestet mit:
- ✅ YAML-Syntax-Validierung
- ✅ Logik-Tests für Version-Bump-Bestimmung
- ✅ Code Review
- ✅ CodeQL Sicherheitsscan (0 Alerts)

## Sicherheit

**Security Summary:**
- ✅ Keine Sicherheitslücken gefunden (CodeQL)
- ✅ Verwendet `GITHUB_TOKEN` für Git-Operationen
- ✅ Keine sensiblen Daten in Logs
- ✅ `[skip ci]` Tag verhindert versehentliche Rekursion

## Nächste Schritte

Nach Merge dieser PR:
1. Bei nächstem Push zum `main` wird automatisch die Version erhöht
2. Entwickler sollten Conventional Commits verwenden für optimale Versionierung
3. Changelog kann manuell oder automatisch erweitert werden

## Support

Bei Fragen oder Problemen:
- Siehe [VERSIONING.md](./VERSIONING.md) für Details
- Siehe [VERSIONING_QUICKREF.md](./VERSIONING_QUICKREF.md) für Schnellhilfe
- Troubleshooting-Sektion in VERSIONING.md konsultieren
