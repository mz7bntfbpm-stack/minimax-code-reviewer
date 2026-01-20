# Beitragen zu Minimax Code Review Assistant

Wir freuen uns über Beiträge aus der Community! Bitte befolgen Sie diese Richtlinien, um einen reibungslosen Beitragungsprozess zu gewährleisten.

## Code of Conduct

Dieses Projekt folgt dem Contributor Covenant Code of Conduct. Durch die Teilnahme an diesem Projekt erklären Sie sich damit einverstanden, diesen Verhaltenskodex zu respektieren.

## Wie beitragen

### Bugs melden

Wenn Sie einen Bug finden, erstellen Sie bitte ein GitHub Issue mit folgenden Informationen:
- Klare Beschreibung des Problems
- Schritte zur Reproduktion
- Erwartetes vs. tatsächliches Verhalten
- Screenshots falls zutreffend
- Version des Browsers und Betriebssystems

### Feature-Anfragen

Für Feature-Anfragen erstellen Sie ein GitHub Issue mit:
- Klare Beschreibung des gewünschten Features
- Anwendungsfall und Begründung
- Vorschläge für die Implementierung (optional)

### Pull Requests

1. Forken Sie das Repository
2. Erstellen Sie einen Feature-Branch (`git checkout -b feature/amazing-feature`)
3. Committen Sie Ihre Änderungen (`git commit -m 'Add amazing feature'`)
4. Pushen Sie zum Branch (`git push origin feature/amazing-feature`)
5. Öffnen Sie einen Pull Request

## Entwicklungsrichtlinien

### Coding Standards

- Verwenden Sie konsistente Einrückung (4 Leerzeichen)
- Folgen Sie den Best Practices der jeweiligen Sprache
- Kommentieren Sie komplexe Logik
- Halten Sie Funktionen klein und fokussiert

### Tests

- Alle neuen Funktionen sollten mit Tests versehen werden
- Führen Sie vor dem Commit alle Tests aus:
```bash
npm test
```

### Dokumentation

- Aktualisieren Sie die README.md bei Änderungen an der Funktionalität
- Fügen Sie JSDoc-Kommentare zu neuen Funktionen hinzu
- Dokumentieren Sie Breaking Changes

## Commit-Nachrichten

Wir folgen dem Conventional Commits Standard:

- `feat`: Neue Funktion
- `fix`: Bug-Fix
- `docs`: Dokumentationsänderungen
- `style`: Code-Style (keine funktionalen Änderungen)
- `refactor`: Code-Refactoring
- `perf`: Performance-Verbesserungen
- `test`: Test hinzugefügt/geändert
- `chore`: Wartungsaufgaben

Beispiel:
```
feat(security): add API key detection for Python

- Detect hardcoded API keys in Python files
- Add regex pattern for Python string literals
- Update documentation
```

## Review-Prozess

Pull Requests werden innerhalb von 7 Tagen überprüft. Wir bitten um Geduld während des Reviews.

### Was wir suchen:
- ✅ Korrektheit der Implementierung
- ✅ Test-Abdeckung
- ✅ Code-Lesbarkeit
- ✅ Dokumentation
- ✅ Konsistenz mit bestehendem Code

Vielen Dank für Ihren Beitrag! 🙌
