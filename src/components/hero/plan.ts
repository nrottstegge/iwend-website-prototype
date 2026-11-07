// Geometry of the hero's broadcast plan (top-down stadium, SVG units 1600 × 900).
// Positions follow a typical football multicamera plan: main stand at the top, OB compound outside right.

export const PLAN_W = 1600;
export const PLAN_H = 900;
export const CENTER = { x: 800, y: 450 };

type Pt = [number, number];

/** Orthogonal polyline with rounded corners, like cable runs on a schematic. */
export function route(points: Pt[], r = 18): string {
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [p0, p1, p2] = [points[i - 1], points[i], points[i + 1]];
    const l1 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    const l2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const k = Math.min(r, l1 / 2, l2 / 2);
    const a: Pt = [p1[0] - ((p1[0] - p0[0]) / l1) * k, p1[1] - ((p1[1] - p0[1]) / l1) * k];
    const b: Pt = [p1[0] + ((p2[0] - p1[0]) / l2) * k, p1[1] + ((p2[1] - p1[1]) / l2) * k];
    d += `L${a[0]},${a[1]}Q${p1[0]},${p1[1]} ${b[0]},${b[1]}`;
  }
  const last = points[points.length - 1];
  return `${d}L${last[0]},${last[1]}`;
}

export const PITCH = { x: 420, y: 205, w: 760, h: 490 };

export const CAMERAS = [
  { id: '01', de: 'Führung', en: 'Main', x: 800, y: 128, label: 'above' },
  { id: '02', de: 'Pitchside', en: 'Pitchside', x: 700, y: 185, label: 'below' },
  { id: '03', de: 'Gegenschuss', en: 'Reverse angle', x: 800, y: 772, label: 'below' },
  { id: '04', de: 'Handkamera', en: 'Handheld', x: 1210, y: 560, label: 'left' },
  { id: '05', de: 'Beauty Shot', en: 'Beauty shot', x: 1325, y: 104, label: 'left' },
  { id: '06', de: 'Hintertor', en: 'Behind goal', x: 300, y: 450, label: 'right' },
] as const;

export const STAGEBOXES = [
  { id: 'SB 1', x: 560, y: 185 },
  { id: 'SB 2', x: 1080, y: 185 },
  { id: 'SB 3', x: 900, y: 715 },
] as const;

export const OB_VANS = [
  { de: 'Ü-Wagen 1', en: 'OB van 1', x: 1385, y: 470, w: 128, h: 54 },
  { de: 'Ü-Wagen 2', en: 'OB van 2', x: 1385, y: 548, w: 128, h: 54 },
] as const;

/** Camera → stagebox runs (one per camera, same order as CAMERAS). */
export const CABLES = [
  route([[800, 128], [1080, 128], [1080, 185]]),
  route([[700, 185], [560, 185]]),
  route([[800, 772], [800, 715], [900, 715]]),
  route([[1210, 560], [1210, 185], [1080, 185]]),
  route([[1325, 104], [1290, 104], [1290, 185], [1080, 185]], 14),
  route([[300, 450], [390, 450], [390, 185], [560, 185]]),
];

/** Stagebox → OB compound trunks, bundled around the outside of the bowl. */
export const TRUNKS = [
  route([[560, 185], [560, 40], [1462, 40], [1462, 470]], 26),
  route([[1080, 185], [1080, 54], [1448, 54], [1448, 470]], 26),
  route([[900, 715], [900, 862], [1476, 862], [1476, 602]], 26),
];

/** Stagebox → centre feeds that hand the signal over to the logo. */
export const FEEDS = [
  route([[560, 185], [560, 450], [610, 450]], 30),
  route([[1080, 185], [1080, 330], [990, 330]], 30),
  route([[900, 715], [900, 590]], 30),
];

/** Radial seating-block lines between the inner and outer bowl. */
export const SEAT_LINES: string = (() => {
  const lines: string[] = [];
  const inner = { x: 345, y: 150, w: 910, h: 600 };
  const outer = { x: 245, y: 72, w: 1110, h: 756 };
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const proj = (b: typeof inner) => {
      const [cx, cy, rx, ry] = [b.x + b.w / 2, b.y + b.h / 2, b.w / 2, b.h / 2];
      const t = 1 / Math.max(Math.abs(Math.cos(a)) / rx, Math.abs(Math.sin(a)) / ry);
      return [cx + Math.cos(a) * t, cy + Math.sin(a) * t].map((v) => v.toFixed(1)).join(',');
    };
    lines.push(`M${proj(inner)}L${proj(outer)}`);
  }
  return lines.join('');
})();
