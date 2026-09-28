// Foundry views: the decision boundary as glowing currents, the network as jellyfish and
// tendrils, and the training trace.
import type { Net } from '../sim/net';
import type { Split } from '../sim/data';

const CYAN = [94, 242, 224], MAGENTA = [255, 106, 213], DEEP = [3, 16, 28];

function fit(canvas: HTMLCanvasElement, w: number, h: number): CanvasRenderingContext2D {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.height = `${h}px`;
  }
  const c = canvas.getContext('2d')!;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  return c;
}

export class Boundary {
  readonly canvas = document.createElement('canvas');
  private grid = document.createElement('canvas');
  private size = 420;
  private readonly N = 80;

  constructor() {
    this.canvas.className = 'fd-boundary';
    this.canvas.setAttribute('role', 'img');
    this.grid.width = this.grid.height = this.N;
  }

  resize(w: number): void { this.size = Math.max(240, Math.min(560, Math.floor(w))); }

  draw(net: Net, train: Split, test: Split, t: number): void {
    const N = this.N, g = this.grid.getContext('2d')!, img = g.createImageData(N, N);
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const p = net.predictFast((i / (N - 1)) * 2.4 - 1.2, 1.2 - (j / (N - 1)) * 2.4);
        const edge = 1 - Math.min(1, Math.abs(p - 0.5) * 6);
        const col = p >= 0.5 ? CYAN : MAGENTA, k = 0.18 + 0.5 * Math.abs(p - 0.5);
        const shimmer = 0.9 + 0.1 * Math.sin(i * 0.35 + j * 0.2 + t * 1.5);
        const o = (j * N + i) * 4;
        for (let c = 0; c < 3; c++) img.data[o + c] = (DEEP[c]! * (1 - k) + col[c]! * k) * shimmer + 255 * edge * 0.55;
        img.data[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    const c = fit(this.canvas, this.size, this.size), s = this.size;
    c.imageSmoothingEnabled = true;
    c.drawImage(this.grid, 0, 0, s, s);
    const X = (v: number) => ((v + 1.2) / 2.4) * s, Y = (v: number) => ((1.2 - v) / 2.4) * s;
    const dot = (pts: Split, hollow: boolean) => pts.x.forEach((p, i) => {
      const col = pts.y[i] ? 'rgb(200,255,248)' : 'rgb(255,190,236)';
      c.beginPath(); c.arc(X(p[0]!), Y(p[1]!), hollow ? 3.5 : 3, 0, Math.PI * 2);
      if (hollow) { c.strokeStyle = col; c.lineWidth = 1.2; c.stroke(); } else { c.fillStyle = col; c.shadowColor = col; c.shadowBlur = 6; c.fill(); c.shadowBlur = 0; }
    });
    dot(train, false);
    dot(test, true);
  }
}

export class Diagram {
  readonly canvas = document.createElement('canvas');
  private w = 420;
  private h = 260;

  constructor() {
    this.canvas.className = 'fd-diagram';
    this.canvas.setAttribute('role', 'img');
  }

  resize(w: number): void { this.w = Math.max(240, Math.floor(w)); this.h = Math.round(this.w * 0.58); }

  draw(net: Net, t: number): void {
    const c = fit(this.canvas, this.w, this.h), { w, h } = this;
    c.fillStyle = 'rgba(2,10,20,1)'; c.fillRect(0, 0, w, h);
    const cols = net.sizes.length;
    const pos = net.sizes.map((n, l) => Array.from({ length: n }, (_, i) => [30 + (l / (cols - 1)) * (w - 60), h / 2 + (i - (n - 1) / 2) * Math.min(28, (h - 40) / Math.max(1, n - 1 || 1))] as const));
    net.weights.forEach((wt, l) => {
      const out = net.sizes[l + 1]!;
      pos[l]!.forEach(([x0, y0], i) => pos[l + 1]!.forEach(([x1, y1], j) => {
        const v = wt[i * out + j]!;
        const a = Math.min(1, Math.abs(v) / 2);
        c.strokeStyle = v >= 0 ? `rgba(94,242,224,${0.12 + 0.75 * a})` : `rgba(255,106,213,${0.12 + 0.75 * a})`;
        c.lineWidth = 0.6 + 2.6 * a;
        const mid = (x0 + x1) / 2, sway = Math.sin(t * 1.3 + i + j) * 6;
        c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(mid, (y0 + y1) / 2 + sway, x1, y1); c.stroke();
      }));
    });
    pos.forEach((layer, l) => layer.forEach(([x, y], i) => {
      const pulse = 0.8 + 0.2 * Math.sin(t * 2 + l + i * 0.7);
      const g = c.createRadialGradient(x, y - 2, 1, x, y, 13 * pulse);
      g.addColorStop(0, 'rgba(230,255,252,.95)'); g.addColorStop(0.5, 'rgba(94,242,224,.55)'); g.addColorStop(1, 'rgba(94,242,224,0)');
      c.fillStyle = g; c.beginPath(); c.arc(x, y, 13 * pulse, 0, Math.PI * 2); c.fill();
      // Jellyfish bell + trailing tendrils.
      c.strokeStyle = 'rgba(200,255,248,.35)'; c.lineWidth = 1;
      for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(x + k * 3, y + 4); c.quadraticCurveTo(x + k * 5 + Math.sin(t * 3 + k) * 2, y + 12, x + k * 3, y + 18); c.stroke(); }
    }));
    c.fillStyle = 'rgba(166,207,216,.9)'; c.font = '600 11px "LabAbyss Mono", monospace';
    c.fillText(`${net.sizes.join(' → ')} · ${net.params} params`, 10, h - 10);
    this.canvas.setAttribute('aria-label', `Network ${net.sizes.join('-')}, ${net.params} parameters, ${net.activation} activation.`);
  }
}

export class Trace {
  readonly canvas = document.createElement('canvas');
  private w = 420;

  constructor() { this.canvas.className = 'fd-trace'; this.canvas.setAttribute('aria-hidden', 'true'); }
  resize(w: number): void { this.w = Math.max(240, Math.floor(w)); }

  draw(loss: number[], acc: number[]): void {
    const h = 110, c = fit(this.canvas, this.w, h), w = this.w;
    c.fillStyle = 'rgba(2,10,20,1)'; c.fillRect(0, 0, w, h);
    const line = (vals: number[], max: number, col: string) => {
      if (vals.length < 2) return;
      c.strokeStyle = col; c.lineWidth = 2; c.beginPath();
      vals.forEach((v, i) => { const x = 8 + (i / (vals.length - 1)) * (w - 16), y = h - 14 - Math.min(1, v / max) * (h - 26); i ? c.lineTo(x, y) : c.moveTo(x, y); });
      c.stroke();
    };
    line(loss, Math.max(0.8, ...loss.slice(0, 5)), 'rgba(255,106,213,.9)');
    line(acc, 1, 'rgba(94,242,224,.95)');
    c.strokeStyle = 'rgba(255,209,102,.6)'; c.setLineDash([4, 4]);
    const y95 = h - 14 - 0.95 * (h - 26); c.beginPath(); c.moveTo(8, y95); c.lineTo(w - 8, y95); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#a6cfd8'; c.font = '600 10px "LabAbyss Mono", monospace';
    c.fillText('loss', 10, 12); c.fillStyle = '#5ef2e0'; c.fillText('test accuracy', 44, 12); c.fillStyle = '#ffd166'; c.fillText('95%', w - 34, y95 - 3);
  }
}
