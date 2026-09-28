// Fixed-timestep game loop. Simulation runs at 60 Hz regardless of display rate;
// a long gap (hidden tab, breakpoint) is clamped so physics never jumps.
export const STEP = 1 / 60;
const MAX_FRAME = 0.1;

export interface Loop { start(): void; stop(): void; readonly running: boolean }

export function createLoop(
  update: (dt: number) => void,
  render: (alpha: number) => void,
  now: () => number = () => performance.now(),
): Loop {
  let raf = 0;
  let last = 0;
  let acc = 0;
  let running = false;

  const frame = (t: number) => {
    const elapsed = Math.min((t - last) / 1000, MAX_FRAME);
    last = t;
    acc += elapsed;
    while (acc >= STEP - 1e-9) {
      update(STEP);
      acc -= STEP;
    }
    render(acc / STEP);
    if (running) raf = requestAnimationFrame(frame);
  };

  return {
    start() {
      if (running) return;
      running = true;
      last = now();
      acc = 0;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    get running() { return running; },
  };
}
