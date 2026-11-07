# Deployment

## GitHub Pages (aktuell)

`.github/workflows/deploy.yml` läuft bei jedem Push auf `main` (auch bei CMS-Änderungen):

1. `npm run check` – Typprüfung
2. `npm test` – Unit-Tests
3. `npm run build` – statischer Build nach `dist/`
4. Veröffentlichung auf GitHub Pages

Pull Requests werden nur geprüft, nicht veröffentlicht.

Einmalige Einstellung im Repository: *Settings → Pages → Source: GitHub Actions*.

## Eigene Domain (z. B. iwend.de)

1. Im Repository *Settings → Pages → Custom domain* eintragen und DNS laut GitHub-Anleitung setzen.
2. Im Workflow beim Build-Schritt Umgebungsvariablen setzen:

   ```yaml
   env:
     SITE_URL: https://www.iwend.de
     BASE_PATH: /
   ```

3. In `public/admin/config.yml` `site_url` und `display_url` anpassen.

## Umgebungsvariablen

| Variable             | Wo         | Zweck                                                      |
| -------------------- | ---------- | ---------------------------------------------------------- |
| `SITE_URL`           | Build      | Absolute URL (Canonical, hreflang, Open Graph)              |
| `BASE_PATH`          | Build      | Unterpfad, Standard `/iwend-website-prototype`              |
| `OPENAI_API_KEY`     | nur lokal  | Bildgenerierung (`npm run images`), in `.env`, nie committen |
| `OPENAI_IMAGE_MODEL` | nur lokal  | Optional, Standard `gpt-image-1`                            |

`.env` ist in `.gitignore` eingetragen; `.env.example` zeigt die Variablen ohne Werte.

## Vor dem Livegang

- *Einstellungen → „Vor Suchmaschinen verbergen“* deaktivieren (entfernt `noindex`).
- Offene Punkte im [README](../README.md#offene-punkte-vor-dem-livegang) abarbeiten.
