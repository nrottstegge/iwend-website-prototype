import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Reads the official logo at build time so every rendering uses the authentic geometry.
const source = readFileSync(join(process.cwd(), 'content/Logo/iwend Logo.svg'), 'utf8');

export const LOGO_COLOR = /fill:(#[0-9a-f]{6})/i.exec(source)?.[1] ?? '#e52521';
export const LOGO_VIEWBOX = /viewBox="([^"]+)"/.exec(source)![1];

/** Every shape of the logo as path data (the ellipse is converted to two arcs). */
export const LOGO_PATHS: string[] = [
  ...[...source.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]),
  ...[...source.matchAll(/<ellipse[^>]*cx="([\d.]+)"[^>]*cy="([\d.]+)"[^>]*rx="([\d.]+)"[^>]*ry="([\d.]+)"/g)].map(
    ([, cx, cy, rx, ry]) => {
      const [x, y, a, b] = [cx, cy, rx, ry].map(Number);
      return `M${x - a},${y}a${a},${b} 0 1,0 ${2 * a},0a${a},${b} 0 1,0 ${-2 * a},0Z`;
    },
  ),
];

/** The elephant mark starts left of the lettering (x < 250 in logo units). */
const startX = (d: string) => Number(/^M\s*([\d.]+)/.exec(d)?.[1] ?? 0);
export const MARK_PATHS = LOGO_PATHS.filter((d) => startX(d) < 250);
