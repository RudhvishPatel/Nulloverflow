// Powers-of-ten reveal: both objects drawn at true relative scale while the camera zooms out.
import type { Kind, Thing } from '../sim/catalogue';
import type { Pair } from '../sim/match';
import { sizeLabel } from '../sim/match';

const RED = '#ff5a6e', BLUE = '#6aa4ff', GOLD = '#f4c542';
const frame = () => new Promise<number>((r) => requestAnimationFrame(r));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

interface Spark { x: number; y: number; vx: number; vy: number; life: number; c: string }

/** Mix a #rrggbb colour toward white (k > 0) or black (k < 0). */
function tint(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)));
  return `rgb(${ch.join(',')})`;
}

/** Draw a stylised object of `size` px standing on (cx, base). */
function drawThing(c: CanvasRenderingContext2D, kind: Kind, cx: number, base: number, size: number, colour: string, t: number, dim = 'across'): void {
  const s = Math.max(size, 0.5), r = s / 2, cy = base - r;
  c.save();
  // Solid forms get light-from-above shading instead of a flat fill.
  const shade = c.createLinearGradient(cx - r, base - s, cx + r, base);
  shade.addColorStop(0, tint(colour, 0.45));
  shade.addColorStop(0.55, colour);
  shade.addColorStop(1, tint(colour, -0.45));
  c.fillStyle = ['creature', 'vehicle', 'building', 'landform', 'cell', 'object', 'virus', 'molecule'].includes(kind) ? shade : colour;
  c.strokeStyle = colour;
  c.lineWidth = Math.max(1, s * 0.04);
  switch (kind) {
    case 'particle':
    case 'atom': {
      c.beginPath(); c.arc(cx, cy, r * 0.28, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 0.8;
      for (let k = 0; k < 3; k++) {
        c.beginPath(); c.ellipse(cx, cy, r, r * 0.35, (k * Math.PI) / 3 + t * 0.4, 0, Math.PI * 2); c.stroke();
      }
      break;
    }
    case 'molecule': {
      const pts = [[0, 0], [0.55, -0.3], [-0.5, -0.35], [0.1, 0.55]];
      c.globalAlpha = 0.6;
      c.beginPath(); pts.forEach(([x, y]) => { c.moveTo(cx, cy); c.lineTo(cx + x! * r, cy + y! * r); }); c.stroke();
      c.globalAlpha = 1;
      pts.forEach(([x, y], i) => { c.beginPath(); c.arc(cx + x! * r, cy + y! * r, r * (i ? 0.3 : 0.42), 0, Math.PI * 2); c.fill(); });
      break;
    }
    case 'virus': {
      c.beginPath(); c.arc(cx, cy, r * 0.62, 0, Math.PI * 2); c.fill();
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2;
        c.beginPath(); c.moveTo(cx + Math.cos(a) * r * 0.6, cy + Math.sin(a) * r * 0.6); c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); c.stroke();
        c.beginPath(); c.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.07, 0, Math.PI * 2); c.fill();
      }
      break;
    }
    case 'cell': {
      c.globalAlpha = 0.55; c.beginPath(); c.ellipse(cx, cy, r, r * 0.8, 0, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1; c.beginPath(); c.arc(cx + r * 0.1, cy, r * 0.3, 0, Math.PI * 2); c.fill();
      break;
    }
    case 'creature': {
      c.beginPath(); c.ellipse(cx, cy + r * 0.15, r, r * 0.65, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(cx + r * 0.75, cy - r * 0.35, r * 0.38, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#0b0b0f'; c.beginPath(); c.arc(cx + r * 0.88, cy - r * 0.42, r * 0.07, 0, Math.PI * 2); c.fill();
      break;
    }
    case 'vehicle': {
      const h = s * 0.32;
      c.beginPath(); c.roundRect(cx - r, base - h - s * 0.08, s, h, h * 0.4); c.fill();
      c.fillStyle = '#0b0b0f';
      [-0.6, 0.6].forEach((k) => { c.beginPath(); c.arc(cx + k * r, base - s * 0.07, s * 0.08, 0, Math.PI * 2); c.fill(); });
      break;
    }
    case 'building': {
      c.beginPath(); c.moveTo(cx - r * 0.45, base); c.lineTo(cx - r * 0.18, base - s); c.lineTo(cx + r * 0.18, base - s); c.lineTo(cx + r * 0.45, base); c.closePath(); c.fill();
      c.fillRect(cx - s * 0.015, base - s * 1.08, s * 0.03, s * 0.1);
      break;
    }
    case 'landform': {
      c.beginPath(); c.moveTo(cx - r * 1.4, base); c.lineTo(cx - r * 0.1, base - s); c.lineTo(cx + r * 0.25, base - s * 0.82); c.lineTo(cx + r * 1.4, base); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.85)';
      c.beginPath(); c.moveTo(cx - r * 0.1, base - s); c.lineTo(cx - r * 0.33, base - s * 0.8); c.lineTo(cx + r * 0.1, base - s * 0.84); c.closePath(); c.fill();
      break;
    }
    case 'planet': {
      const g = c.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
      g.addColorStop(0, '#fff'); g.addColorStop(0.25, colour); g.addColorStop(1, '#101018');
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill();
      break;
    }
    case 'star': {
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, r * 1.6);
      g.addColorStop(0, '#fffbe6'); g.addColorStop(0.35, colour); g.addColorStop(0.62, colour + '55'); g.addColorStop(1, 'transparent');
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r * 1.6, 0, Math.PI * 2); c.fill();
      break;
    }
    case 'nebula': {
      for (let k = 0; k < 7; k++) {
        const a = k * 2.1 + t * 0.2;
        c.globalAlpha = 0.18; c.beginPath(); c.arc(cx + Math.cos(a) * r * 0.45, cy + Math.sin(a) * r * 0.35, r * 0.6, 0, Math.PI * 2); c.fill();
      }
      break;
    }
    case 'galaxy': {
      c.globalAlpha = 0.9;
      for (let k = 0; k < 220; k++) {
        const arm = k % 2, u = (k / 220) * 3.2;
        const a = u * 2.2 + arm * Math.PI + t * 0.15;
        const rr = (u / 3.2) * r;
        c.fillRect(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.55, Math.max(1, s * 0.012), Math.max(1, s * 0.012));
      }
      c.globalAlpha = 1; c.beginPath(); c.arc(cx, cy, r * 0.12, 0, Math.PI * 2); c.fill();
      break;
    }
    case 'span': {
      c.fillRect(cx - r, base - s * 0.04, s, s * 0.04);
      c.fillRect(cx - r, base - s * 0.14, s * 0.02, s * 0.14);
      c.fillRect(cx + r - s * 0.02, base - s * 0.14, s * 0.02, s * 0.14);
      break;
    }
    default: {
      // Everyday objects: shape follows the measured dimension.
      if (dim === 'tall') { c.beginPath(); c.roundRect(cx - s * 0.24, base - s, s * 0.48, s, s * 0.08); c.fill(); }
      else if (dim === 'long' || dim === 'wide') { const h = s * (dim === 'wide' ? 0.12 : 0.3); c.beginPath(); c.roundRect(cx - r, base - h, s, h, h / 2); c.fill(); }
      else {
        c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill();
        c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(cx - r * 0.35, cy - r * 0.4, r * 0.28, r * 0.16, -0.6, 0, Math.PI * 2); c.fill();
      }
    }
  }
  c.restore();
}

export class ZoomView {
  readonly canvas = document.createElement('canvas');
  private ctx = this.canvas.getContext('2d')!;
  private w = 800;
  private h = 420;
  private sparks: Spark[] = [];
  private shake = 0;

  constructor() {
    this.canvas.className = 'arena-zoom';
    this.canvas.setAttribute('role', 'img');
  }

  resize(width: number): void {
    this.w = Math.max(280, Math.floor(width));
    this.h = Math.round(this.w * (this.w < 560 ? 0.75 : 0.5));
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = this.w * dpr; this.canvas.height = this.h * dpr;
    this.canvas.style.height = `${this.h}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private backdrop(): void {
    const c = this.ctx, { w, h } = this;
    const g = c.createRadialGradient(w / 2, -h * 0.2, 0, w / 2, -h * 0.2, h * 1.4);
    g.addColorStop(0, '#34343f'); g.addColorStop(0.5, '#17171d'); g.addColorStop(1, '#0b0b0f');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,.05)';
    for (let x = 0; x < w; x += 36) c.fillRect(x, h * 0.86, 1, h * 0.14);
    c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(0, h * 0.86, w, 1);
  }

  /** Before the bet: both fighters at equal size, sizes hidden. */
  idle(pair: Pair): void {
    const c = this.ctx, { w, h } = this, base = h * 0.86, s = h * 0.46;
    this.backdrop();
    drawThing(c, pair.a.kind, w * 0.28, base - 4, s, RED, 0, pair.a.dim);
    drawThing(c, pair.b.kind, w * 0.72, base - 4, s, BLUE, 0, pair.b.dim);
    c.fillStyle = GOLD; c.font = `400 ${Math.round(h * 0.12)}px "LabArena Poster", Impact, sans-serif`; c.textAlign = 'center';
    c.fillText('?', w / 2, h * 0.52);
    this.canvas.setAttribute('aria-label', `${pair.a.name} versus ${pair.b.name}. Sizes hidden until you lock in.`);
  }

  /** Zoom from the smaller object out to the bigger one at true scale. */
  async reveal(pair: Pair, instant: boolean, verdict: 'ko' | 'miss' | 'ok'): Promise<void> {
    const small = pair.a.metres <= pair.b.metres ? pair.a : pair.b;
    const big = small === pair.a ? pair.b : pair.a;
    const colourOf = (t: Thing) => (t === pair.a ? RED : BLUE);
    const startView = small.metres * 2.6, endView = big.metres * 1.35;
    const dur = instant ? 0 : Math.min(3.2, 1.2 + Math.abs(pair.decades) * 0.08);
    this.canvas.setAttribute('aria-label', `${pair.a.name} ${sizeLabel(pair.a.metres)}; ${pair.b.name} ${sizeLabel(pair.b.metres)}.`);
    const t0 = performance.now();
    if (verdict === 'ko' && !instant) this.burst();
    if (verdict === 'miss' && !instant) this.shake = 1;
    for (;;) {
      const t = dur === 0 ? 1 : Math.min(1, (performance.now() - t0) / 1000 / dur);
      const e = ease(t);
      const view = Math.exp(Math.log(startView) + (Math.log(endView) - Math.log(startView)) * e);
      this.drawScene(small, big, colourOf, view, t);
      if (t >= 1 && this.sparks.length === 0 && this.shake <= 0) break;
      if (instant) { this.sparks = []; this.shake = 0; this.drawScene(small, big, colourOf, view, 1); break; }
      await frame();
    }
  }

  private drawScene(small: Thing, big: Thing, colourOf: (t: Thing) => string, view: number, t: number): void {
    const c = this.ctx, { w, h } = this, base = h * 0.86;
    const px = (m: number) => (m / view) * h;
    c.save();
    if (this.shake > 0) { c.translate((Math.random() - 0.5) * 14 * this.shake, (Math.random() - 0.5) * 10 * this.shake); this.shake -= 0.04; }
    this.backdrop();
    const sb = px(big.metres), ss = px(small.metres);
    const bigX = w * 0.62, smallX = Math.max(w * 0.14, bigX - sb / 2 - Math.max(ss, 18) * 1.8);
    drawThing(c, big.kind, bigX, base, sb, colourOf(big), t, big.dim);
    drawThing(c, small.kind, smallX, base, ss, colourOf(small), t, small.dim);
    // Once the small one is tiny, ring it and keep its label readable.
    if (ss < 14) {
      c.strokeStyle = colourOf(small); c.lineWidth = 2;
      c.beginPath(); c.arc(smallX, base - Math.max(ss, 2) / 2, 12, 0, Math.PI * 2); c.stroke();
    }
    c.font = '600 13px "LabArena Sans", "Arial Narrow", sans-serif';
    c.textAlign = 'left';
    const label = (thing: Thing, x: number, y: number) => {
      c.fillStyle = colourOf(thing); c.fillText(thing.name, x, y);
      c.fillStyle = '#e6e1d6'; c.fillText(sizeLabel(thing.metres), x, y + 16);
    };
    label(small, ss < 14 ? Math.max(8, smallX - 150) : Math.min(w - 170, smallX + 18), Math.max(34, base - Math.min(ss, h * 0.6) - 40));
    label(big, Math.min(w - 170, bigX + Math.min(sb / 2, w * 0.3) + 10), Math.max(34, base - Math.min(sb, h * 0.8) * 0.8));
    // Scale bar: the largest power of ten under ~28% of the width.
    const target = view * (w * 0.28) / h;
    const pow = 10 ** Math.floor(Math.log10(target));
    const barPx = px(pow);
    c.fillStyle = '#fff'; c.fillRect(16, h - 18, barPx, 3); c.fillRect(16, h - 24, 2, 9); c.fillRect(16 + barPx, h - 24, 2, 9);
    c.font = '600 12px "LabArena Sans", sans-serif'; c.fillText(sizeLabel(pow).replace('≈ ', ''), 22 + barPx, h - 14);
    this.stepSparks();
    c.restore();
  }

  private burst(): void {
    const { w, h } = this;
    for (let i = 0; i < 90; i++) {
      const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 7;
      this.sparks.push({ x: w * 0.5, y: h * 0.45, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, life: 1, c: [GOLD, '#fff', RED, BLUE][i % 4]! });
    }
  }

  private stepSparks(): void {
    const c = this.ctx;
    for (const p of this.sparks) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.life -= 0.018;
      c.globalAlpha = Math.max(0, p.life); c.fillStyle = p.c; c.fillRect(p.x, p.y, 4, 4);
    }
    c.globalAlpha = 1;
    this.sparks = this.sparks.filter((p) => p.life > 0);
  }
}
