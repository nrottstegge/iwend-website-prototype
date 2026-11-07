# Design & Animation

## Designsystem

Leitidee: Die Website wirkt wie ein technischer Produktionsplan, präzise, ruhig und filmisch.
Vorbild für Rhythmus, Typografie und Übergänge ist nilsrottstegge.com; die Bildsprache stammt aus der
Live-Produktion (Kamerapläne, Kabelwege, Sucher, Tally-Licht, Timecode).

| Element     | Festlegung                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------------- |
| Farbe       | Rot `#e52521` (aus dem Original-Logo), Schwarz `#0b0c0e`, Papier `#f3f2ef`, neutrale Grautöne |
| Schrift     | Archivo Variable (Headlines schmal, `font-stretch: 78%`, Versalien), Geist Mono für technische Labels |
| Rhythmus    | Dunkle Bühnen-Abschnitte im Wechsel mit hellen redaktionellen Abschnitten; rote Fläche für Karriere |
| Motive      | Sucher-Ecken auf Bildern, roter Punkt als Tally-Licht, Timecode, nummerierte Abschnitte (01 / 03) |
| Bewegung    | Weiche Einblendungen (`--ease`), keine Scroll-Übernahme, `prefers-reduced-motion` wird respektiert |

Tokens: `src/styles/global.css`. Schriften werden selbst gehostet (`@fontsource-variable`), es gibt keine externen Requests.

## Hero: Stadion → Kabelnetz → Logo

Dateien: `src/components/hero/` (`StadiumPlan.astro`, `plan.ts`, `Hero.astro`, `hero.ts`)

**Prinzip:** Ein einziges SVG im Format 1600 × 900 zeigt einen Stadion-Kameraplan (angelehnt an
handgezeichnete Pläne aus der Praxis). `hero.ts` schreibt nur den Scroll-Fortschritt `0…1` in die
CSS-Variable `--p`. Alle Zustände berechnet CSS daraus mit `clamp()`; pro Element legen `--a` (Start) und
`--d` (Dauer) das Zeitfenster fest.

| Fortschritt `--p` | Phase                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------- |
| 0.05 – 0.26       | **A** Kamerapositionen CAM 01–06 erscheinen nacheinander                                 |
| 0.24 – 0.40       | **B** Kabelwege zu den Stageboxen zeichnen sich (`stroke-dashoffset`, `pathLength="1"`) |
| 0.42 – 0.54       | Sammelleitungen laufen um die Schüssel zum Ü-Wagen                                       |
| 0.56 – 0.80       | **C** Plan dimmt, Zuleitungen laufen zur Mitte; die Konturen des **originalen** Logos zeichnen sich nach, dann blendet die Füllung ein |
| 0.78 – 0.95       | **D** Logo rückt nach oben, Headline, Text und Buttons erscheinen                        |

**Warum kein Path-Morphing:** Das Logo besteht aus gefüllten, kalligrafischen Flächen (Elefant + Schriftzug),
nicht aus Linien. Ein Morph von Kabelwegen in diese Flächen wäre instabil. Stattdessen werden die echten
Logo-Pfade (`src/lib/logo.ts` liest `content/Logo/iwend Logo.svg` beim Build) als Kontur nachgezeichnet und
dann gefüllt. Das Ergebnis ist exakt das Original-Logo.

**Robustheit**

- Ohne JavaScript oder mit „Bewegung reduzieren“ gilt `--p: 1`: Der Hero zeigt sofort das Endbild in einer Bildschirmhöhe.
- Der Scroll-Modus wird vor dem ersten Rendern über `html.js` aktiviert, daher gibt es kein Flackern und keinen Layoutsprung.
- Keine Scroll-Übernahme: Die Seite scrollt nativ, das Script liest Positionen nur (rAF-gedrosselt, pausiert außerhalb des Viewports).
- Hochformat: Der Plan wird um 90° gedreht, damit das ganze Stadion sichtbar ist; Kameras zeigen nur ihre Nummer.
- Kein WebGL, keine Animationsbibliothek; das Hero-Script hat unter 2 KB.

## Kunden: Logos bilden das Ruhrgebiet

`src/lib/ruhr.ts` enthält einen vereinfachten Umriss des RVR-Gebiets (Längen-/Breitengrade, projiziert).
Die Logo-Positionen werden beim Build deterministisch berechnet (Farthest-Point-Sampling innerhalb des Umrisses,
Städtebeschriftungen bleiben frei, einheitliche Kachelgröße ohne Überlappung). Beim Einblenden fliegen die Logos
aus einer losen Wolke an ihren Platz. Auf kleinen Bildschirmen zeigt die Karte Markierungen und die Logos stehen
als Raster darunter. Tests: `tests/ruhr.test.ts`.
