// Drives the hero by writing scroll progress (0..1) into the CSS variable --p.
// All visual states are derived from --p in CSS; without this script --p stays 1 (final frame).

const FPS = 25;
const SVG = 'http://www.w3.org/2000/svg';
const LOGO_SCALE = 1.35; // matches the .logo transform while --td = 0

/** Orthogonal route with rounded corners through the given points. */
function route(pts: [number, number][], r = 14): string {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [p0, p1, p2] = [pts[i - 1], pts[i], pts[i + 1]];
    const l1 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    const l2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    if (l1 < 0.5 || l2 < 0.5) continue;
    const k = Math.min(r, l1 / 2, l2 / 2);
    const a = [p1[0] - ((p1[0] - p0[0]) / l1) * k, p1[1] - ((p1[1] - p0[1]) / l1) * k];
    const b = [p1[0] + ((p2[0] - p1[0]) / l2) * k, p1[1] + ((p2[1] - p1[1]) / l2) * k];
    d += `L${a[0].toFixed(1)},${a[1].toFixed(1)}Q${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  return `${d}L${last[0].toFixed(1)},${last[1].toFixed(1)}`;
}

export function initHero(section: HTMLElement) {
  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  const stage = section.querySelector<HTMLElement>('[data-stage]')!;
  const logo = section.querySelector<HTMLElement>('[data-logo]')!;
  const copy = section.querySelector<HTMLElement>('[data-copy]')!;
  const tc = section.querySelector<HTMLElement>('[data-tc]')!;
  const leads = section.querySelector<SVGSVGElement>('[data-leads]')!;
  const strokes = [...logo.querySelectorAll<SVGPathElement>('.outline path')];

  let frame = 0;
  let visible = true;

  const measure = () => {
    // Offset that centres the logo while the copy below it is still hidden.
    const gap = parseFloat(getComputedStyle(logo.parentElement!).rowGap) || 0;
    const shift = (copy.offsetHeight + gap) / 2;
    stage.style.setProperty('--shift', `${shift}px`);
    buildLeads(shift);
  };

  // Cables from the stageboxes on the plan to the first point of each logo stroke.
  // Logo points are computed from layout (offset*) plus the known CSS transform, so the
  // result is independent of the current scroll state.
  const buildLeads = (shift: number) => {
    const st = stage.getBoundingClientRect();
    const boxes = [...section.querySelectorAll<SVGGElement>('[data-stagebox] rect')].map((r) => {
      const b = r.getBoundingClientRect();
      return { x: b.left + b.width / 2 - st.left, y: b.top + b.height / 2 - st.top, size: Math.min(b.width, b.height), n: 0, total: 0 };
    });
    if (!boxes.length) return;
    const svg = logo.querySelector('svg')!;
    const [, , vw] = svg.getAttribute('viewBox')!.split(/\s+/).map(Number);
    const final = logo.parentElement!;
    const W = logo.offsetWidth;
    const H = logo.offsetHeight;
    const left = final.offsetLeft + logo.offsetLeft;
    const top = final.offsetTop + logo.offsetTop;
    const [cx, cy] = [left + W / 2, top + H / 2];
    const k = W / vw;
    const toStage = (x: number, y: number): [number, number] => [
      cx + (left + x * k - cx) * LOGO_SCALE,
      cy + (top + y * k - cy) * LOGO_SCALE + shift,
    ];

    leads.setAttribute('viewBox', `0 0 ${st.width} ${st.height}`);
    leads.replaceChildren();
    const targets = strokes.map((path) => {
      const [tx, ty] = toStage(Number(path.dataset.x), Number(path.dataset.y));
      const box = boxes.reduce((best, b) => (Math.hypot(b.x - tx, b.y - ty) < Math.hypot(best.x - tx, best.y - ty) ? b : best));
      box.total++;
      return { path, tx, ty, box };
    });
    // Cables of one box leave side by side within its width, ordered left→right like their targets,
    // each on its own horizontal level so they never overlap.
    targets.sort((a, b) => a.tx - b.tx);
    targets.forEach(({ path, tx, ty, box }) => {
      const i = box.n++;
      const step = box.total > 1 ? (box.size * 0.8) / (box.total - 1) : 0;
      const lane = (i - (box.total - 1) / 2) * step;
      // Leave the box vertically, run horizontally on a lane, then drop straight into the stroke start.
      const midY = box.y + (ty > box.y ? 1 : -1) * (22 + i * 4);
      const d = route([
        [box.x + lane, box.y],
        [box.x + lane, midY],
        [tx, midY],
        [tx, ty],
      ]);
      const el = document.createElementNS(SVG, 'path');
      el.setAttribute('d', d);
      el.setAttribute('pathLength', '1');
      const a = Number(getComputedStyle(path).getPropertyValue('--a')) || 0.62;
      // The cable arrives exactly when its stroke starts drawing.
      el.style.setProperty('--a', String(a - 0.06));
      el.style.setProperty('--d', '0.06');
      leads.append(el);
    });
  };

  const update = () => {
    frame = 0;
    const r = section.getBoundingClientRect();
    const track = r.height - innerHeight;
    const p = track > 0 ? Math.min(1, Math.max(0, -r.top / track)) : 1;
    stage.style.setProperty('--p', p.toFixed(4));
    // Timecode as a progress readout: 12 seconds of "programme" across the scene.
    const f = Math.round(p * 12 * FPS);
    const s = Math.floor(f / FPS);
    tc.textContent = `00:00:${String(s).padStart(2, '0')}:${String(f % FPS).padStart(2, '0')}`;
  };
  const schedule = () => {
    if (visible && !frame) frame = requestAnimationFrame(update);
  };
  const onResize = () => {
    measure();
    schedule();
  };

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    schedule();
  });

  const start = () => {
    measure();
    update();
    // Web fonts change the copy height (and thus the logo offset) once loaded.
    document.fonts?.ready.then(() => motion.matches && measure());
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', onResize);
    io.observe(section);
  };
  const stop = () => {
    removeEventListener('scroll', schedule);
    removeEventListener('resize', onResize);
    io.disconnect();
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    stage.style.removeProperty('--p');
    leads.replaceChildren();
    tc.textContent = '00:00:12:00';
  };

  motion.addEventListener('change', () => (motion.matches ? start() : stop()));
  if (motion.matches) start();
  else stop();
}
