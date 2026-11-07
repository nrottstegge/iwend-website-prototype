// Germany map for the client network: outline, projection, city clusters and cable runs from Bochum.

// Outline of Germany as [longitude, latitude] – Natural Earth 1:110m (public domain).
const OUTLINE: [number, number][] = [
  [9.922, 54.983], [9.94, 54.597], [10.95, 54.364], [10.939, 54.009], [11.956, 54.196], [12.518, 54.47],
  [13.647, 54.076], [14.12, 53.757], [14.353, 53.248], [14.075, 52.981], [14.438, 52.625], [14.685, 52.09],
  [14.607, 51.745], [15.017, 51.107], [14.571, 51.002], [14.307, 51.117], [14.056, 50.927], [13.338, 50.733],
  [12.967, 50.484], [12.24, 50.266], [12.415, 49.969], [12.521, 49.547], [13.031, 49.307], [13.596, 48.877],
  [13.243, 48.416], [12.884, 48.289], [13.026, 47.638], [12.933, 47.468], [12.621, 47.672], [12.141, 47.703],
  [11.426, 47.524], [10.545, 47.566], [10.402, 47.302], [9.896, 47.58], [9.594, 47.525], [8.523, 47.831],
  [8.317, 47.614], [7.467, 47.621], [7.594, 48.333], [8.099, 49.018], [6.658, 49.202], [6.186, 49.464],
  [6.243, 49.902], [6.043, 50.128], [6.157, 50.804], [5.989, 51.852], [6.589, 51.852], [6.843, 52.228],
  [7.092, 53.144], [6.905, 53.482], [7.1, 53.694], [7.936, 53.748], [8.122, 53.528], [8.801, 54.021],
  [8.572, 54.396], [8.526, 54.963], [9.282, 54.831],
];

export const MAP_W = 600;
const PAD = 16;
const K = Math.cos((51.2 * Math.PI) / 180);
const lons = OUTLINE.map(([lon]) => lon);
const lats = OUTLINE.map(([, lat]) => lat);
const [minLon, maxLon, minLat, maxLat] = [Math.min(...lons), Math.max(...lons), Math.min(...lats), Math.max(...lats)];
const scale = (MAP_W - 2 * PAD) / ((maxLon - minLon) * K);
export const MAP_H = Math.round((maxLat - minLat) * scale + 2 * PAD);

export type Point = { x: number; y: number };

/** Equirectangular projection into SVG units. */
export const project = (lon: number, lat: number): Point => ({
  x: PAD + (lon - minLon) * K * scale,
  y: PAD + (maxLat - lat) * scale,
});

export const POLYGON = OUTLINE.map(([lon, lat]) => project(lon, lat));
export const OUTLINE_PATH = `M${POLYGON.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('L')}Z`;

export const HOME = { name: 'Bochum', ...project(7.216, 51.481) };

export function inside(p: Point, poly: Point[] = POLYGON): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [a, b] = [poly[i], poly[j]];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) hit = !hit;
  }
  return hit;
}

type Located = { city: string; lat?: number; lon?: number };
export type Cluster<T> = Point & { id: string; label: string; cities: string[]; items: T[] };

/**
 * Groups items by city and merges cities closer than `radius` SVG units (e.g. Köln and Hürth)
 * so labels never collide. Items without coordinates are returned separately.
 */
export function clusterByCity<T extends Located>(items: T[], radius = 22) {
  const clusters: Cluster<T>[] = [];
  const unplaced: T[] = [];
  for (const item of items) {
    if (item.lat == null || item.lon == null || !item.city) {
      unplaced.push(item);
      continue;
    }
    const p = project(item.lon, item.lat);
    const near = clusters.find((c) => Math.hypot(c.x - p.x, c.y - p.y) < radius);
    if (near) {
      near.items.push(item);
      if (!near.cities.includes(item.city)) near.cities.push(item.city);
    } else clusters.push({ ...p, id: '', label: '', cities: [item.city], items: [item] });
  }
  for (const c of clusters) {
    c.label = c.cities.join(' · ');
    c.id = c.cities[0].toLowerCase().replace(/[^a-z0-9äöüß]+/g, '-');
  }
  // North to south reads naturally next to the map.
  clusters.sort((a, b) => a.y - b.y);
  return { clusters, unplaced };
}

/** Cable run from Bochum: horizontal first, then into the city, with a rounded corner; `lane` offsets parallel cables. */
export function cable(to: Point, lane = 0, r = 10): string {
  const x0 = HOME.x;
  const y0 = HOME.y + lane * 3;
  const [dx, dy] = [to.x - x0, to.y - y0];
  const f = (v: number) => v.toFixed(1);
  if (Math.abs(dx) < 1 || Math.abs(dy) < 1) return `M${f(x0)},${f(y0)}L${f(to.x)},${f(to.y)}`;
  const k = Math.min(r, Math.abs(dx) / 2, Math.abs(dy) / 2);
  return `M${f(x0)},${f(y0)}H${f(to.x - Math.sign(dx) * k)}Q${f(to.x)},${f(y0)} ${f(to.x)},${f(y0 + Math.sign(dy) * k)}V${f(to.y)}`;
}
