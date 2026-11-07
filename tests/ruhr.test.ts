import { describe, expect, it } from 'vitest';
import { MAP_H, MAP_W, POLYGON, inside, layoutTiles, project } from '../src/lib/ruhr';

describe('Ruhr silhouette layout', () => {
  it('projects Bochum inside the outline', () => {
    expect(inside(project(7.22, 51.48))).toBe(true);
    expect(inside(project(6.0, 51.0))).toBe(false);
  });

  it('places every tile inside the map without overlaps', () => {
    for (const n of [1, 5, 18, 30]) {
      const tiles = layoutTiles(n);
      expect(tiles).toHaveLength(n);
      for (const t of tiles) {
        expect(inside(t)).toBe(true);
        expect(t.x).toBeGreaterThan(0);
        expect(t.x).toBeLessThan(MAP_W);
        expect(t.y).toBeLessThan(MAP_H);
      }
      for (let i = 0; i < tiles.length; i++)
        for (let j = i + 1; j < tiles.length; j++) {
          const [a, b] = [tiles[i], tiles[j]];
          const overlap = Math.abs(a.x - b.x) < a.w && Math.abs(a.y - b.y) < a.h;
          expect(overlap).toBe(false);
        }
    }
  });

  it('keeps tiles legible for the current number of clients', () => {
    expect(layoutTiles(18)[0].w).toBeGreaterThan(70);
  });

  it('is deterministic', () => {
    expect(layoutTiles(12)).toEqual(layoutTiles(12));
    expect(POLYGON.length).toBeGreaterThan(20);
  });
});
