# Bilder: Pipeline & Rechteprüfung

## Grundsatz

Die Originalfotos in `content/raw-pictures/` zeigen erkennbare Personen, Sender- und Vereinsmarken,
Sponsorflächen, Monitorinhalte und Kamerapläne. Sie werden **nicht veröffentlicht** und sind per
`.gitignore` vom Repository ausgeschlossen.

Stattdessen dienen sie als **Referenz**: Für jeden Einsatzort wurde ausgewertet, was die Szene ausmacht
(Technik, Licht, Abläufe), und daraus ein Bild-Brief geschrieben. Die Bilder werden komplett neu generiert,
ohne Upload der Originale, ohne erkennbare Gesichter, Logos oder lesbaren Text.

## Ablauf

1. API-Schlüssel in `.env` eintragen: `OPENAI_API_KEY=sk-…` (Datei wird nicht committet).
2. Guthaben im OpenAI-Konto sicherstellen (Stand 07.11.2026: Konto ohne Guthaben, Abbruch mit `insufficient_quota`).
3. `npm run images` generiert alle fehlenden Bilder nach `public/images/generated/` (WebP).
   Einzelnes Bild neu: `npm run images -- showcase-live --force`.
4. Jedes Ergebnis prüfen (Checkliste unten) und Status im Manifest unten nachtragen.
5. Erst nach Freigabe committen. Die Seite bindet Bilder automatisch ein, sobald die Datei existiert;
   vorher zeigt sie gestaltete Platzhalter.

Briefs und Stilvorgaben: `scripts/image-briefs.json`.

**Team-Porträts:** Die Originalfotos liegen git-ignoriert in `content/ansprechpartner/`. `npm run images`
schickt jedes Foto als Referenz an den Edit-Endpunkt und erzeugt einheitliche Studioporträts (gleicher
Hintergrund, gleiches Licht, gleicher Ausschnitt, schwarzes Shirt ohne Logo). Vorgaben stehen unter
`portraitStyle`/`portraits` in `scripts/image-briefs.json`. Ergebnis immer auf Ähnlichkeit prüfen und von
der Person freigeben lassen. Bis dahin zeigt die Website die Initialen.

**Hero in hoher Auflösung:** `scripts/upscale-hero.mjs` rendert das freigegebene Stadionbild über den
Edit-Endpunkt in 2560×1600 neu, ohne den Inhalt zu ändern.

**Einsatzbereiche mit iwend-Kleidung:** Die drei Szenen zeigen das Team in schwarzer Kleidung mit iwend-Logo.
Weil die Bild-KI das Logo frei erfindet, ersetzt `scripts/brand-fix.mjs` den Aufdruck in einem zweiten Schritt
durch das echte Logo (`content/Logo/iwend Logo.svg` als Referenzbild). Ergebnis immer auf korrekten Schriftzug prüfen.

**Steckerbilder:** `connectors` in `scripts/image-briefs.json` – generische Studio-Produktfotos ohne
Herstellernamen, erscheinen auf der Karriereseite beim Überfahren der Kabeltypen.

**Ausnahme Crew-Foto:** Das Teamfoto wird nicht generiert, sondern nur farblich bearbeitet (ffmpeg):
Weißabgleich über `colorchannelmixer` (R ×0.87, B ×1.17; gemessen an schwarzen Shirts und Hauttönen),
Magenta −45 %, weiche Kurve, Kontrast +4 %, leichte Rauschminderung und Nachschärfen.
Das Original (1600×900) bleibt unverändert. Danach KI-Hochskalierung auf 2560×1440 (`scripts/upscale-crew.mjs`); geprüft auf unveränderte Gesichter und korrekten iwend-Schriftzug, Website-Version 2400×1350. Masterdateien (PNG) liegen git-ignoriert in `scripts/.cache/`.

## Prüf-Checkliste je Bild

- [ ] Keine erkennbaren Gesichter
- [ ] Keine Logos, Marken, Vereinsfarben, Sponsorflächen
- [ ] Kein lesbarer Text, keine identifizierbaren Monitorinhalte
- [ ] Technik plausibel (Kabel, Kameras, Stageboxen, Ü-Wagen)
- [ ] Keine erkennbare reale Location
- [ ] Nutzungsbedingungen des Bildanbieters geprüft

## Asset-Manifest

| Asset | Quelle | Verarbeitung | Ausgabe | Personen | Marken | Vertrauliches | Rechte | Freigabe |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Logo iwend | `content/Logo/iwend Logo.svg` | unverändert (Pfade zur Laufzeit gelesen) | inline SVG, `public/favicon.svg` (Elefant) | – | eigene Marke | – | iwend | ✅ |
| Kundenlogos (19) | `content/clients/*` | unverändert kopiert, umbenannt | `public/images/clients/` | – | Kundenmarken | – | Nutzung mit Kunden abstimmen | ⚠ prüfen |
| hero-stadium | generiert; Referenz: 1126274b…, IMG_0630, IMG_4809, IMG_8539 | Neugenerierung | `public/images/generated/hero-stadium.webp` | – | – | – | Bild-API-Bedingungen | ✅ generiert & geprüft (07.11.2026), Freigabe iwend offen |
| showcase-live | generiert; Referenz: PHOTO-…-39-09 2/4/5, IMG_8177 | Neugenerierung | `…/showcase-live.webp` | – | – | – | Bild-API-Bedingungen | ✅ generiert & geprüft (07.11.2026), Freigabe iwend offen |
| showcase-interview | generiert; Referenz: IMG_8225, IMG_0474, IMG_8127 | Neugenerierung | `…/showcase-interview.webp` | – | – | – | Bild-API-Bedingungen | ✅ generiert & geprüft (07.11.2026), Freigabe iwend offen |
| showcase-stadium | generiert; Referenz: IMG_0630, IMG_6561, PHOTO-…-33-11, IMG_1681 | Neugenerierung | `…/showcase-stadium.webp` | – | – | – | Bild-API-Bedingungen | ✅ generiert & geprüft (07.11.2026), Freigabe iwend offen |
| Crew-Foto (1LIVE Krone 2018) | `content/raw-pictures/44eeb9b0-….jpg` | Weißabgleich und Farbkorrektur, KI-Hochskalierung (Gesichter unverändert), Schatten neutralisiert, keine Retusche | `public/images/team/crew.webp` | ja, 11 erkennbare Personen | Sponsorenwand (1LIVE, WDR, bofrost, Krombacher u. a.) | – | Einverständnis aller Abgebildeten einholen | ⚠ auf Wunsch eingesetzt, Freigaben offen |
| Team-Porträts (Pia Rottstegge, Wendelin Schiegel, Marco Klinger) | `content/ansprechpartner/*` (git-ignoriert) | KI-Studioporträt auf Basis des eigenen Fotos (OpenAI Images Edit, hohe Gesichtstreue), 960×1200 (Wendelin 800×1000) | `public/images/team/<name>.webp` | ja (gewollt) | – | – | Einverständnis der Personen, auch für die Verarbeitung durch OpenAI | ✅ generiert (07.11.2026), Freigabe der Personen offen |
| Steckerbilder (6) | generiert aus Text | Neugenerierung | `public/images/cables/*.webp` | – | – (generisch, ohne Marke) | – | Bild-API-Bedingungen | ✅ generiert & geprüft (07.11.2026) |
| Übrige Rohfotos (24 + 1 Video) | `content/raw-pictures/` | keine | nicht veröffentlicht | ja | ja (ZDF, UEFA, Vereine, Sponsoren) | Kamerapläne, Monitorinhalte | unklar | ❌ nicht veröffentlichen |

Die Hero-Animation funktioniert ohne Foto. Das Stadionbild liegt nur gedimmt hinter dem Kameraplan.
