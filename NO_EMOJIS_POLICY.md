# Keine Emojis im Code

## Richtlinie

Emojis dürfen **nicht** im UI-Code dieser Anwendung verwendet werden.

## Gründe

1. **Konsistenz**: Emojis werden auf verschiedenen Plattformen unterschiedlich dargestellt
2. **Barrierefreiheit**: Screenreader haben Probleme mit Emojis
3. **Professionalität**: Text-basierte UI-Elemente sind professioneller
4. **Wartbarkeit**: Icon-Fonts oder SVGs sind besser wartbar

## Alternativen

- Verwende Text-Labels
- Verwende HTML-Entities (z.B. &times; für ×)
- Verwende CSS-Klassen für Icons
- Verwende Icon-Bibliotheken wie Font Awesome oder Material Icons (wenn gewünscht)

## Code Review

Bei Code Reviews muss darauf geachtet werden, dass keine Emojis in neuen oder geänderten Dateien enthalten sind.
