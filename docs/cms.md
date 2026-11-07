# Inhalte bearbeiten (CMS)

Die Website nutzt **Sveltia CMS**, ein Git-basiertes CMS. Alle Inhalte liegen als Dateien in diesem Repository
(`src/content/`). Jede Änderung im CMS ist ein Commit auf `main`; GitHub Actions baut und veröffentlicht die
Seite danach automatisch (ca. 1–2 Minuten).

## Anmelden

1. `https://nrottstegge.github.io/iwend-website-prototype/admin/` öffnen.
2. **„Sign In with Token“** wählen und ein GitHub-Token einfügen.

Token erstellen (einmalig pro Person): GitHub → *Settings → Developer settings → Fine-grained tokens →
Generate new token*

- Repository access: *Only select repositories* → `nrottstegge/iwend-website-prototype`
- Permissions: *Contents: Read and write*
- Ablaufdatum setzen, Token nicht weitergeben

Die Person braucht Schreibrechte auf das Repository (*Settings → Collaborators*).

> **Lokal ohne Token:** `npm run dev` starten, `http://localhost:4321/iwend-website-prototype/admin/index.html` in Chrome/Edge
> öffnen und **„Work with Local Repository“** wählen. Änderungen landen direkt im lokalen Ordner.

Ein „Sign in with GitHub“-Button per OAuth ist möglich, braucht aber einen kleinen OAuth-Dienst (z. B.
[sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) auf Cloudflare Workers). Dafür `base_url` im
`backend` von `public/admin/config.yml` ergänzen.

## Was ist wo?

| CMS-Bereich         | Inhalt                                                         | Datei(en)                       |
| ------------------- | -------------------------------------------------------------- | ------------------------------- |
| Seiten → Startseite | Hero, Einsatzbereiche, Leistungen, Kunden-/Team-/Kontakttexte  | `src/content/pages/home.json`   |
| Seiten → Karriere   | Karriereseite                                                  | `src/content/pages/careers.json`|
| Stellenangebote     | Stellen (DE + EN je eine Datei)                                | `src/content/jobs/*.md`         |
| Team                | Personen, Rollen, Porträts, Reihenfolge                        | `src/content/team/*.json`       |
| Kunden              | Logo, Name, Kachelhintergrund, Sichtbarkeit, Reihenfolge       | `src/content/clients/*.json`    |
| Einstellungen       | Adresse, Kontakt, SEO-Standard, Suchmaschinen-Sperre           | `src/content/settings/site.json`|
| Rechtliches         | Impressum, Datenschutz                                         | `src/content/legal/*.md`        |

**Sprachen:** Oben im Editor zwischen *DE* und *EN* umschalten. Felder wie Bilder, Reihenfolge oder E-Mail werden
automatisch in beide Sprachen übernommen.

## Häufige Aufgaben

**Stelle ausschreiben:** *Stellenangebote → Neu*. Titel, Ort, Anstellungsart und Beschreibung in DE und EN
ausfüllen, **„Veröffentlicht“** aktivieren. Nur aktive Stellen erscheinen; mit *Ablaufdatum* verschwindet die
Stelle automatisch beim nächsten Build danach. Ohne aktive Stellen zeigt die Karriereseite einen Hinweis und die
Initiativbewerbung. Keine Gehälter oder Konditionen eintragen, die nicht freigegeben sind.

**Teamleitung hinzufügen:** *Team → Neu*, Bereich „Teamleitung / Einsatzleitung“. Porträts nur mit
Einverständnis der Person hochladen.

**Kunde hinzufügen:** *Kunden → Neu*, Logo (SVG/PNG, transparent) hochladen. Weiße Logos brauchen den
Kachelhintergrund „Dunkel“. Die Ruhrgebiet-Karte ordnet alle sichtbaren Logos automatisch an.

**Bild austauschen:** Im jeweiligen Bildfeld neues Bild hochladen. Fehlt ein Bild, zeigt die Seite einen
gestalteten Platzhalter. Nur freigegebene Bilder verwenden (siehe [images.md](images.md)).

## Für Entwickler

Das Inhaltsmodell ist zweimal beschrieben und muss synchron bleiben:

- `src/content.config.ts` – Schema für den Build (Fehler brechen den Build ab)
- `public/admin/config.yml` – Felder im CMS

Übersetzte JSON-Dateien haben die Form `{ "de": { … }, "en": { … } }` (Sveltia-Struktur `single_file`),
Markdown-Sammlungen eine Datei pro Sprache: `slug.de.md`, `slug.en.md` (`multiple_files`).
