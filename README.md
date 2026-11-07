# iwend GmbH – Website

Website der iwend GmbH (Bochum): technisches Personal für TV-Produktionen und Liveübertragungen.
Zweisprachig (Deutsch/Englisch), statisch gebaut mit [Astro](https://astro.build), Inhalte pflegbar über [Sveltia CMS](https://sveltiacms.app) unter `/admin`.

**Prototyp:** https://nrottstegge.github.io/iwend-website-prototype/

## Schnellstart

Voraussetzung: Node.js ≥ 22.23 (CI nutzt Node 24, siehe `.nvmrc`).

```sh
npm install
npm run dev       # http://localhost:4321/iwend-website-prototype/
```

| Befehl           | Zweck                                                   |
| ---------------- | ------------------------------------------------------- |
| `npm run dev`    | Entwicklungsserver                                      |
| `npm run check`  | Typprüfung (Astro + TypeScript)                         |
| `npm test`       | Unit-Tests (Vitest)                                     |
| `npm run build`  | Produktions-Build nach `dist/`                          |
| `npm run images` | Bildgenerierung über die OpenAI-API (siehe Bildpipeline) |

## Struktur

```
content/                 Originale (unverändert): Logo, Kundenlogos; raw-pictures/ und ansprechpartner/ sind git-ignoriert
public/
  admin/                 Sveltia CMS (index.html, config.yml)
  images/clients/        Kundenlogos für die Website (Kopien der Originale)
  images/generated/      Freigegebene, generierte Bilder
  images/uploads/        Uploads aus dem CMS
scripts/                 Bildpipeline (Briefs + Generator)
src/
  components/
    hero/                Stadion → Kabelnetz → Logo (StadiumPlan, plan.ts, hero.ts)
    layout/              Header, Footer
    pages/               Seitenvorlagen (DE/EN gemeinsam)
    sections/            Abschnitte der Startseite
    ui/                  Logo, Bildrahmen
  content/               Inhalte (JSON/Markdown) – werden im CMS bearbeitet
  content.config.ts      Inhaltsmodell (Schema)
  i18n/ui.ts             Routen, Anker und kurze UI-Texte DE/EN
  lib/                   Logo-Geometrie, Deutschlandkarte, Inhaltszugriff
  pages/                 Routen (/, /karriere/, /impressum/, /datenschutz/, /en/…)
tests/                   Unit-Tests
docs/                    Dokumentation
```

## Dokumentation

- [docs/cms.md](docs/cms.md) – Inhalte bearbeiten, Login, Stellenangebote
- [docs/deployment.md](docs/deployment.md) – GitHub Pages, eigene Domain, Umgebungsvariablen
- [docs/design.md](docs/design.md) – Designsystem und Funktionsweise der Hero-Animation
- [docs/images.md](docs/images.md) – Bildpipeline, Rechteprüfung, Asset-Manifest

## Offene Punkte vor dem Livegang

1. **Bilder & Team-Porträts:** generieren (OpenAI-Guthaben nötig) und freigeben – bis dahin zeigt die Seite gestaltete Platzhalter bzw. Initialen. Siehe [docs/images.md](docs/images.md).
2. **Impressum/Datenschutz:** Registergericht, HRB, USt-ID und Verantwortliche ergänzen, rechtlich prüfen (mit ⚠ markiert).
3. **Kundenlogos:** Nutzung mit den Kunden abstimmen; Name und Sitz für das orangefarbene „G“-Logo ergänzen.
4. **Crew-Foto:** Einverständnis der abgebildeten Personen einholen.
5. **Suchmaschinen:** In *Einstellungen → Firma & Kontakt* „Vor Suchmaschinen verbergen“ deaktivieren.
6. **Formular:** Das Anfrageformular öffnet das E-Mail-Programm (`mailto:`), es gibt bewusst keinen Drittanbieter.
