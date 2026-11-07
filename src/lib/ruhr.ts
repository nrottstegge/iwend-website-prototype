// Approximate outline of the Ruhr metropolitan region (RVR area), clockwise, as [longitude, latitude].
// Simplified by hand from the municipal borders; plausible, not survey-accurate.
const OUTLINE: [number, number][] = [
  [6.4, 51.6], [6.42, 51.68], [6.5, 51.76], [6.62, 51.8], [6.78, 51.74], [6.92, 51.72], [7.05, 51.76],
  [7.2, 51.81], [7.32, 51.74], [7.45, 51.72], [7.6, 51.7], [7.78, 51.73], [7.98, 51.68], [7.92, 51.6],
  [7.85, 51.52], [7.82, 51.46], [7.65, 51.43], [7.55, 51.34], [7.48, 51.25], [7.36, 51.26], [7.25, 51.31],
  [7.12, 51.35], [6.98, 51.34], [6.85, 51.37], [6.73, 51.34], [6.65, 51.4], [6.52, 51.43], [6.45, 51.5],
  [6.42, 51.55],
];

export const MAP_W = 1000;
const LAT0 = 51.53;
const K = Math.cos((LAT0 * Math.PI) / 180);
const lons = OUTLINE.map(([lon]) => lon);
const lats = OUTLINE.map(([, lat]) => lat);
const [minLon, maxLon, minLat, maxLat] = [Math.min(...lons), Math.max(...lons), Math.min(...lats), Math.max(...lats)];
const PAD = 24;
const scale = (MAP_W - 2 * PAD) / ((maxLon - minLon) * K);
export const MAP_H = Math.round((maxLat - minLat) * scale + 2 * PAD);

export type Point = { x: number; y: number };

/** Equirectangular projection into the map's SVG coordinate system. */
export const project = (lon: number, lat: number): Point => ({
  x: PAD + (lon - minLon) * K * scale,
  y: PAD + (maxLat - lat) * scale,
});

export const POLYGON: Point[] = OUTLINE.map(([lon, lat]) => project(lon, lat));
export const OUTLINE_PATH = `M${POLYGON.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('L')}Z`;

export const CITIES: (Point & { name: string; home?: boolean })[] = [
  { name: 'Duisburg', ...project(6.76, 51.43) },
  { name: 'Essen', ...project(7.01, 51.45) },
  { name: 'Bochum', ...project(7.22, 51.48), home: true },
  { name: 'Dortmund', ...project(7.47, 51.51) },
];

export function inside(p: Point, poly: Point[] = POLYGON): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [a, b] = [poly[i], poly[j]];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) hit = !hit;
  }
  return hit;
}

function edgeDistance(p: Point, poly: Point[] = POLYGON): number {
  let d = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [a, b] = [poly[j], poly[i]];
    const [dx, dy] = [b.x - a.x, b.y - a.y];
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
    d = Math.min(d, Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy));
  }
  return d;
}

export type Slot = Point & { w: number; h: number };

/**
 * Deterministic positions for `n` logo tiles of aspect `w:h` inside the outline.
 * Farthest-point sampling over interior candidates (keeping city labels free),
 * then a uniform tile size that avoids overlaps.
 */
export function layoutTiles(n: number, w = 120, h = 60, avoid: Point[] = CITIES): Slot[] {
  if (n <= 0) return [];
  const step = 8;
  const candidates: Point[] = [];
  for (let y = 0; y <= MAP_H; y += step)
    for (let x = 0; x <= MAP_W; x += step) {
      const p = { x, y };
      const free = avoid.every((a) => Math.abs(a.x + 40 - p.x) > w * 0.95 || Math.abs(a.y - 4 - p.y) > h * 0.85);
      if (inside(p) && edgeDistance(p) > h * 0.45 && free) candidates.push(p);
    }
  // Normalised distance so tiles spread according to their shape.
  const dist = (a: Point, b: Point) => Math.hypot((a.x - b.x) / w, (a.y - b.y) / h);
  const cx = candidates.reduce((s, p) => s + p.x, 0) / candidates.length;
  const cy = candidates.reduce((s, p) => s + p.y, 0) / candidates.length;
  const first = candidates.reduce((best, p) => (dist(p, { x: cx, y: cy }) < dist(best, { x: cx, y: cy }) ? p : best));
  const chosen: Point[] = [first];
  const nearest = candidates.map((p) => dist(p, first));
  while (chosen.length < Math.min(n, candidates.length)) {
    let k = 0;
    for (let i = 1; i < candidates.length; i++) if (nearest[i] > nearest[k]) k = i;
    chosen.push(candidates[k]);
    candidates.forEach((p, i) => (nearest[i] = Math.min(nearest[i], dist(p, candidates[k]))));
  }
  // Largest uniform scale (≤ 1) at which no two tiles overlap.
  let s = 1;
  for (let i = 0; i < chosen.length; i++)
    for (let j = i + 1; j < chosen.length; j++) {
      const [dx, dy] = [Math.abs(chosen[i].x - chosen[j].x), Math.abs(chosen[i].y - chosen[j].y)];
      s = Math.min(s, Math.max(dx / w, dy / h) * 0.94);
    }
  // Reading order (top-left to bottom-right) keeps the stagger animation calm.
  return chosen
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .map((p) => ({ x: p.x, y: p.y, w: w * s, h: h * s }));
}
