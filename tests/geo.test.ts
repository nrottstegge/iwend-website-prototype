import { describe, expect, it } from 'vitest';
import { HOME, MAP_H, MAP_W, cable, clusterByCity, inside, project } from '../src/lib/geo';

const cities: Record<string, [number, number]> = {
  Köln: [6.96, 50.938],
  Hürth: [6.876, 50.877],
  Hamburg: [9.994, 53.551],
  Berlin: [13.405, 52.52],
  München: [11.575, 48.137],
  Saarbrücken: [6.997, 49.24],
};

describe('Germany map', () => {
  it('projects client cities and Bochum inside the outline and the viewBox', () => {
    for (const [lon, lat] of [...Object.values(cities), [7.216, 51.481] as [number, number]]) {
      const p = project(lon, lat);
      expect(inside(p)).toBe(true);
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(MAP_W);
      expect(p.y).toBeLessThan(MAP_H);
    }
    expect(inside(project(2.35, 48.85))).toBe(false); // Paris
  });

  it('merges nearby cities and keeps distant ones apart', () => {
    const items = Object.entries(cities).map(([city, [lon, lat]]) => ({ city, lon, lat }));
    const { clusters, unplaced } = clusterByCity([...items, { city: '' }]);
    expect(unplaced).toHaveLength(1);
    expect(clusters.find((c) => c.label === 'Köln · Hürth')?.items).toHaveLength(2);
    expect(clusters).toHaveLength(5);
    expect(clusters[0].label).toBe('Hamburg'); // sorted north to south
  });

  it('routes cables from Bochum to the target', () => {
    const to = project(...cities.Berlin);
    const d = cable(to);
    expect(d.startsWith(`M${HOME.x.toFixed(1)},${HOME.y.toFixed(1)}H`)).toBe(true);
    expect(d.endsWith(`V${to.y.toFixed(1)}`)).toBe(true);
  });
});
