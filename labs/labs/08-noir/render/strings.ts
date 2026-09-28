// Red string between pinned cards (attention arcs), and the Q·K workbench canvas.
const STRING = '#b3261e', CORK = '#b98b56', CARD = '#f7f1e1', INK = '#1a1208', LAMP = '#f2d16b';

function fit(canvas: HTMLCanvasElement, w: number, h: number): CanvasRenderingContext2D {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, w * dpr); canvas.height = Math.max(1, h * dpr);
  canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
  const c = canvas.getContext('2d')!;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  return c;
}

/** Arcs from the query card to every other card; thickness and opacity follow the weight. */
export function drawStrings(canvas: HTMLCanvasElement, wrap: HTMLElement, cards: HTMLElement[], query: number, weights: number[]): void {
  const box = wrap.getBoundingClientRect();
  const w = Math.round(box.width), h = 130;
  const c = fit(canvas, w, h);
  c.clearRect(0, 0, w, h);
  const centre = (el: HTMLElement) => { const r = el.getBoundingClientRect(); return r.left - box.left + r.width / 2; };
  const qx = centre(cards[query]!);
  const order = weights.map((v, j) => ({ v, j })).sort((a, b) => a.v - b.v);
  for (const { v, j } of order) {
    if (j === query || v < 0.02) continue;
    const x = centre(cards[j]!);
    const lift = Math.min(h - 12, 26 + Math.abs(x - qx) * 0.45);
    c.strokeStyle = STRING;
    c.globalAlpha = 0.25 + 0.75 * Math.min(1, v * 1.6);
    c.lineWidth = 1 + 7 * v;
    c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowOffsetY = 2; c.shadowBlur = 2;
    c.beginPath(); c.moveTo(qx, h); c.bezierCurveTo(qx, h - lift, x, h - lift, x, h); c.stroke();
  }
  c.globalAlpha = 1; c.shadowBlur = 0; c.shadowOffsetY = 0;
}

export interface Key { label: string; v: [number, number] }

/** Q·K workbench: draggable query vector over fixed keys, with softmax bars. */
export class Workbench {
  readonly canvas = document.createElement('canvas');
  private w = 520;
  private h = 320;
  q: [number, number] = [0.6, 0.3];
  private dragging = false;

  constructor(private keys: Key[], private onChange: () => void) {
    this.canvas.className = 'nr-bench';
    this.canvas.setAttribute('role', 'img');
    const toVec = (e: PointerEvent): [number, number] => {
      const r = this.canvas.getBoundingClientRect();
      const s = Math.min(this.w, this.h) * 0.42;
      return [Math.max(-2, Math.min(2, (e.clientX - r.left - this.w / 2) / s)), Math.max(-2, Math.min(2, -(e.clientY - r.top - this.h / 2) / s))];
    };
    this.canvas.addEventListener('pointerdown', (e) => { this.dragging = true; this.canvas.setPointerCapture(e.pointerId); this.q = toVec(e); this.onChange(); });
    this.canvas.addEventListener('pointermove', (e) => { if (this.dragging) { this.q = toVec(e); this.onChange(); } });
    this.canvas.addEventListener('pointerup', () => { this.dragging = false; });
  }

  resize(width: number): void { this.w = Math.max(260, Math.floor(width)); this.h = Math.round(this.w * 0.62); }

  draw(weights: number[]): void {
    const c = fit(this.canvas, this.w, this.h), { w, h } = this;
    const s = Math.min(w, h) * 0.42, cx = w / 2, cy = h / 2;
    c.fillStyle = CORK; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(26,18,8,.25)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(0, cy); c.lineTo(w, cy); c.moveTo(cx, 0); c.lineTo(cx, h); c.stroke();
    const arrow = (v: [number, number], colour: string, width: number) => {
      const x = cx + v[0] * s, y = cy - v[1] * s;
      c.strokeStyle = colour; c.fillStyle = colour; c.lineWidth = width;
      c.beginPath(); c.moveTo(cx, cy); c.lineTo(x, y); c.stroke();
      const a = Math.atan2(y - cy, x - cx);
      c.beginPath(); c.moveTo(x, y); c.lineTo(x - 11 * Math.cos(a - 0.4), y - 11 * Math.sin(a - 0.4)); c.lineTo(x - 11 * Math.cos(a + 0.4), y - 11 * Math.sin(a + 0.4)); c.closePath(); c.fill();
      return [x, y] as const;
    };
    this.keys.forEach((k, i) => {
      const [x, y] = arrow(k.v, INK, 1.5 + 4 * weights[i]!);
      c.fillStyle = CARD; c.beginPath(); c.roundRect(x + 6, y - 12, c.measureText(k.label).width + 16, 22, 3); c.fill();
      c.fillStyle = INK; c.font = '700 13px "LabNoir Type", "Courier New", monospace'; c.fillText(`${k.label} ${(weights[i]! * 100).toFixed(0)}%`, x + 12, y + 4);
    });
    const [qx, qy] = arrow(this.q, STRING, 4);
    c.fillStyle = LAMP; c.beginPath(); c.arc(qx, qy, 9, 0, Math.PI * 2); c.fill();
    c.fillStyle = INK; c.font = '700 12px "LabNoir Type", monospace'; c.fillText('query ("it")', qx + 12, qy - 10);
    this.canvas.setAttribute('aria-label', `Query vector (${this.q[0].toFixed(2)}, ${this.q[1].toFixed(2)}). Weights: ${this.keys.map((k, i) => `${k.label} ${(weights[i]! * 100).toFixed(0)}%`).join(', ')}.`);
  }
}
