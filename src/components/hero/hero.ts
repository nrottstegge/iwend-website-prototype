// Drives the hero by writing scroll progress (0..1) into the CSS variable --p.
// All visual states are derived from --p in CSS; without this script --p stays 1 (final frame).

const FPS = 25;

export function initHero(section: HTMLElement) {
  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  const stage = section.querySelector<HTMLElement>('[data-stage]')!;
  const logo = section.querySelector<HTMLElement>('[data-logo]')!;
  const copy = section.querySelector<HTMLElement>('[data-copy]')!;
  const tc = section.querySelector<HTMLElement>('[data-tc]')!;

  let frame = 0;
  let visible = true;

  const measure = () => {
    // Offset that centres the logo while the copy below it is still hidden.
    const gap = parseFloat(getComputedStyle(logo.parentElement!).rowGap) || 0;
    stage.style.setProperty('--shift', `${(copy.offsetHeight + gap) / 2}px`);
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
    tc.textContent = '00:00:12:00';
  };

  motion.addEventListener('change', () => (motion.matches ? start() : stop()));
  if (motion.matches) start();
  else stop();
}
