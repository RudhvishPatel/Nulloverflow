// Low tier / no WebGL: a top-down contour map on Canvas 2D with the same game.
import type { Hole } from '../sim/course';
import type { Vec2 } from '../sim/surfaces';
import { sampleHeightfield } from './heightfield';
import { GHOST_COLOURS, shotDuration, type Renderer, type ShotView } from './types';

const frame = () => new Promise<number>((r) => requestAnimationFrame(r));

export class CanvasRenderer implements Renderer {
  readonly kind = '2d' as const;
  readonly canvas = document.createElement('canvas');
  private ctx = this.canvas.getContext('2d')!;
  private map: HTMLCanvasElement | null = null;
  private hole: Hole | null = null;
  private ball: Vec2 = [0, 0];
  private trails: { path: Vec2[]; colour: string; width: number; frac: number }[] = [];
  private size = 560;

  constructor() {
    this.canvas.className = 'golf-canvas golf-canvas-2d';
  }

  private toPx([x, y]: Vec2): [number, number] {
    const [x0, x1, y0, y1] = this.hole!.surface.bounds;
    return [((x - x0) / (x1 - x0)) * this.size, (1 - (y - y0) / (y1 - y0)) * this.size];
  }

  async setHole(hole: Hole, ball: Vec2): Promise<void> {
    this.hole = hole;
    this.ball = ball;
    this.trails = [];
    const n = 160;
    const hf = sampleHeightfield(hole.surface, n);
    const img = new ImageData(n, n);
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const h = hf.h[(n - 1 - j) * n + i]!;
        const band = Math.abs(((h * 14) % 1) - 0.5) < 0.06 ? 0.75 : 1;
        const stripe = ((i + j) >> 3) % 2 ? 1.04 : 0.96;
        const k = (j * n + i) * 4;
        img.data[k] = (60 + 170 * h ** 1.4) * band * stripe;
        img.data[k + 1] = (150 + 50 * h) * band * stripe;
        img.data[k + 2] = (70 + 70 * h ** 2) * band * stripe;
        img.data[k + 3] = 255;
      }
    }
    this.map = document.createElement('canvas');
    this.map.width = this.map.height = n;
    this.map.getContext('2d')!.putImageData(img, 0, 0);
    this.draw();
  }

  placeBall(p: Vec2): void {
    this.ball = p;
    this.draw();
  }

  async playShot(view: ShotView): Promise<void> {
    this.trails = [
      ...view.ghosts.map((g) => ({ path: g.path, colour: GHOST_COLOURS[g.club] ?? '#fff', width: 1.5, frac: 0 })),
      { path: view.path, colour: '#fff6c8', width: 3, frac: 0 },
    ];
    const last = view.path.at(-1)!;
    if (view.instant) {
      this.trails.forEach((t) => (t.frac = 1));
      this.placeBall(view.hazard ? view.path[0]! : last);
      return;
    }
    const dur = shotDuration(view.path.length);
    const t0 = performance.now();
    for (;;) {
      const t = Math.min(1, (performance.now() - t0) / 1000 / dur);
      const e = 1 - (1 - t) ** 2;
      this.trails.forEach((tr) => (tr.frac = e));
      const f = e * (view.path.length - 1);
      const i = Math.min(view.path.length - 2, Math.floor(f));
      const a = view.path[i]!, b = view.path[i + 1] ?? a;
      this.ball = [a[0] + (b[0] - a[0]) * (f - i), a[1] + (b[1] - a[1]) * (f - i)];
      this.draw();
      if (t >= 1) break;
      await frame();
    }
    this.placeBall(view.hazard ? view.path[0]! : last);
  }

  private draw(): void {
    const c = this.ctx, s = this.size;
    if (!this.hole || !this.map) return;
    c.imageSmoothingEnabled = true;
    c.drawImage(this.map, 0, 0, s, s);
    for (const tr of this.trails) {
      const upto = Math.max(1, Math.floor(tr.frac * (tr.path.length - 1)));
      c.beginPath();
      tr.path.slice(0, upto + 1).forEach((p, i) => { const [x, y] = this.toPx(p); i ? c.lineTo(x, y) : c.moveTo(x, y); });
      c.strokeStyle = tr.colour;
      c.lineWidth = tr.width;
      c.globalAlpha = tr.width > 2 ? 0.95 : 0.6;
      c.stroke();
      c.globalAlpha = 1;
    }
    const [cx, cy] = this.toPx(this.hole.cup);
    c.fillStyle = '#0b140d';
    c.beginPath(); c.arc(cx, cy, 7, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#fdfaf0'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx, cy - 34); c.stroke();
    c.fillStyle = '#d7263d';
    c.beginPath(); c.moveTo(cx, cy - 34); c.lineTo(cx + 18, cy - 28); c.lineTo(cx, cy - 22); c.fill();
    const [bx, by] = this.toPx(this.ball);
    c.fillStyle = '#fff';
    c.strokeStyle = 'rgba(0,0,0,.35)';
    c.lineWidth = 1.5;
    c.beginPath(); c.arc(bx, by, 6, 0, Math.PI * 2); c.fill(); c.stroke();
  }

  resize(width: number): void {
    this.size = Math.max(240, Math.floor(width));
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = this.canvas.height = this.size * dpr;
    this.canvas.style.width = this.canvas.style.height = `${this.size}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  }

  dispose(): void { /* nothing to release */ }
}
