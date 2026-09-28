// Starfield renderers for the Embedding Galaxy: three.js (high/medium) and Canvas 2D (low).
import type { Galaxy } from '../sim/space';

export interface Focus { indices: number[]; highlight: number[]; beams: [number, number][] }

export interface StarMap {
  readonly canvas: HTMLCanvasElement;
  readonly kind: '3d' | '2d';
  resize(w: number, h: number): void;
  focus(f: Focus, instant: boolean): void;
  dispose(): void;
}

/** Hue by angle in the first two PCA components, brightness by the third. */
export function starColour(g: Galaxy, i: number): [number, number, number] {
  const x = g.coords[i * 3]!, y = g.coords[i * 3 + 1]!, z = g.coords[i * 3 + 2]!;
  const h = (Math.atan2(y, x) / (2 * Math.PI) + 1) % 1, l = 0.55 + 0.25 * z;
  const f = (n: number) => { const k = (n + h * 12) % 12; return l - 0.6 * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
  return [f(0), f(8), f(4)];
}

/** Labels are real DOM text over the canvas, so they stay crisp and readable. */
export class Labels {
  readonly layer = document.createElement('div');
  private nodes = new Map<number, HTMLSpanElement>();
  constructor(private g: Galaxy) { this.layer.className = 'cs-labels'; this.layer.setAttribute('aria-hidden', 'true'); }
  set(indices: number[], highlight: number[]): void {
    for (const [i, n] of this.nodes) if (!indices.includes(i)) { n.remove(); this.nodes.delete(i); }
    for (const i of indices) {
      let n = this.nodes.get(i);
      if (!n) { n = document.createElement('span'); n.textContent = this.g.words[i]!; this.layer.append(n); this.nodes.set(i, n); }
      n.className = highlight.includes(i) ? 'is-hot' : '';
    }
  }
  place(project: (i: number) => [number, number, boolean]): void {
    for (const [i, n] of this.nodes) {
      const [x, y, visible] = project(i);
      n.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      n.style.opacity = visible ? '1' : '0';
    }
  }
}

export class Stars2D implements StarMap {
  readonly kind = '2d' as const;
  readonly canvas = document.createElement('canvas');
  private c = this.canvas.getContext('2d')!;
  private w = 800; private h = 480;
  private view = { x: 0, y: 0, s: 1 };
  private f: Focus = { indices: [], highlight: [], beams: [] };

  constructor(private g: Galaxy, private labels: Labels) { this.canvas.className = 'cs-canvas'; }

  resize(w: number, h: number): void {
    this.w = w; this.h = h;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = w * dpr; this.canvas.height = h * dpr; this.canvas.style.height = `${h}px`;
    this.c.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  }

  private project(i: number): [number, number, boolean] {
    const s = Math.min(this.w, this.h) * 0.45 * this.view.s;
    const x = this.w / 2 + (this.g.coords[i * 3]! - this.view.x) * s, y = this.h / 2 - (this.g.coords[i * 3 + 1]! - this.view.y) * s;
    return [x, y, x > -20 && x < this.w + 20 && y > -20 && y < this.h + 20];
  }

  private draw(): void {
    const { c, w, h, g } = this;
    c.fillStyle = '#04030d'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < g.words.length; i++) {
      const [x, y, vis] = this.project(i);
      if (!vis) continue;
      const [r, gg, b] = starColour(g, i);
      c.fillStyle = `rgba(${r * 255 | 0},${gg * 255 | 0},${b * 255 | 0},.75)`;
      c.fillRect(x, y, 1.6, 1.6);
    }
    c.strokeStyle = 'rgba(255,210,122,.8)'; c.lineWidth = 1.5;
    for (const [a, b] of this.f.beams) { const [x1, y1] = this.project(a), [x2, y2] = this.project(b); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
    for (const i of this.f.highlight) { const [x, y] = this.project(i); c.fillStyle = '#ffd27a'; c.beginPath(); c.arc(x, y, 4, 0, Math.PI * 2); c.fill(); }
    this.labels.place((i) => this.project(i));
  }

  focus(f: Focus): void {
    this.f = f;
    const pts = f.highlight.length ? f.highlight : f.indices;
    if (pts.length) {
      this.view.x = pts.reduce((a, i) => a + this.g.coords[i * 3]!, 0) / pts.length;
      this.view.y = pts.reduce((a, i) => a + this.g.coords[i * 3 + 1]!, 0) / pts.length;
      this.view.s = 3.5;
    }
    this.labels.set(f.indices, f.highlight);
    this.draw();
  }

  dispose(): void { /* nothing */ }
}
