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

**Ausnahme Crew-Foto:** Das Teamfoto wird nicht generiert, sondern nur farblich bearbeitet (ffmpeg):
`huesaturation` (Magenta −60 %, Rot −15 %, gesamt −8 %), weiche Kurve mit leicht angehobenen Schatten,
Kontrast +7 %, Gamma 1.05, Farbtemperatur leicht neutralisiert, Vignette, leichtes Nachschärfen.
Das Original bleibt unverändert. Masterdateien (PNG) liegen git-ignoriert in `scripts/.cache/`.

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
| Kundenlogos (18) | `content/clients/*` | unverändert kopiert, umbenannt | `public/images/clients/` | – | Kundenmarken | – | Nutzung mit Kunden abstimmen | ⚠ prüfen |
| hero-stadium | generiert; Referenz: 1126274b…, IMG_0630, IMG_4809, IMG_8539 | Neugenerierung | `public/images/generated/hero-stadium.webp` | – | – | – | Bild-API-Bedingungen | ⏳ offen |
| showcase-live | generiert; Referenz: PHOTO-…-39-09 2/4/5, IMG_8177 | Neugenerierung | `…/showcase-live.webp` | – | – | – | Bild-API-Bedingungen | ⏳ offen |
| showcase-interview | generiert; Referenz: IMG_8225, IMG_0474, IMG_8127 | Neugenerierung | `…/showcase-interview.webp` | – | – | – | Bild-API-Bedingungen | ⏳ offen |
| showcase-stadium | generiert; Referenz: IMG_0630, IMG_6561, PHOTO-…-33-11, IMG_1681 | Neugenerierung | `…/showcase-stadium.webp` | – | – | – | Bild-API-Bedingungen | ⏳ offen |
| Crew-Foto (1LIVE Krone 2018) | `content/raw-pictures/44eeb9b0-….jpg` | Farbkorrektur (Magenta/Rot reduziert, Schatten, Kontrast, Vignette, Schärfe), keine Retusche | `public/images/team/crew.webp` | ja, 11 erkennbare Personen | Sponsorenwand (1LIVE, WDR, bofrost, Krombacher u. a.) | – | Einverständnis aller Abgebildeten einholen | ⚠ auf Wunsch eingesetzt, Freigaben offen |
| Übrige Rohfotos (24 + 1 Video) | `content/raw-pictures/` | keine | nicht veröffentlicht | ja | ja (ZDF, UEFA, Vereine, Sponsoren) | Kamerapläne, Monitorinhalte | unklar | ❌ nicht veröffentlichen |

Die Hero-Animation funktioniert ohne Foto. Das Stadionbild liegt nur gedimmt hinter dem Kameraplan.
