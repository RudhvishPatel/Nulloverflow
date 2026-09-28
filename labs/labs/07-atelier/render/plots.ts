// The cutting cloth (data + fit + fan + CV folds) and the tailor's ledger (error sweep).
import type { Data } from '../sim/models';

const CLOTH = '#33353d', CHALK = '#f4f1ea', THREAD = '#c62f2f', PIN = '#d9dde3', TAPE = '#f2cf4a', NAVY = '#1f3a6b', PAPER = '#fbf7ec';
const X0 = -1, X1 = 1, Y0 = -1.9, Y1 = 1.9;

function setup(canvas: HTMLCanvasElement, width: number, ratio: number): { c: CanvasRenderingContext2D; w: number; h: number } {
  const w = Math.max(280, Math.floor(width)), h = Math.round(w * ratio);
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.height = `${h}px`;
  const c = canvas.getContext('2d')!;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { c, w, h };
}

export interface ClothView {
  train: Data;
  val: Data;
  grid: number[];
  fitY: number[];
  fan?: number[][];
  truth?: (x: number) => number;
  heldOut?: Set<number>;
  label: string;
}

export class Cloth {
  readonly canvas = document.createElement('canvas');
  private width = 700;

  constructor() {
    this.canvas.className = 'at-cloth';
    this.canvas.setAttribute('role', 'img');
  }

  resize(width: number): void { this.width = width; }

  draw(v: ClothView): void {
    const { c, w, h } = setup(this.canvas, this.width, this.width < 520 ? 0.75 : 0.5);
    const X = (x: number) => 14 + ((x - X0) / (X1 - X0)) * (w - 28);
    const Y = (y: number) => 10 + ((Y1 - Math.max(Y0, Math.min(Y1, y))) / (Y1 - Y0)) * (h - 20);
    c.fillStyle = CLOTH; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(255,255,255,.06)';
    for (let x = 0; x < w; x += 22) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    c.strokeStyle = 'rgba(244,241,234,.2)'; c.beginPath(); c.moveTo(0, Y(0)); c.lineTo(w, Y(0)); c.stroke();
    const curve = (ys: number[], colour: string, width: number, dash: number[] = [], alpha = 1) => {
      c.globalAlpha = alpha; c.strokeStyle = colour; c.lineWidth = width; c.setLineDash(dash); c.lineCap = 'round';
      c.beginPath(); v.grid.forEach((x, i) => (i ? c.lineTo(X(x), Y(ys[i]!)) : c.moveTo(X(x), Y(ys[i]!)))); c.stroke();
      c.setLineDash([]); c.globalAlpha = 1;
    };
    if (v.fan) for (const f of v.fan) curve(f, THREAD, 1.2, [], 0.22);
    if (v.truth) curve(v.grid.map(v.truth), CHALK, 2, [2, 6], 0.9);
    curve(v.fitY, THREAD, 3, [9, 5]);
    // Validation: chalk rings. Training: pins (held-out fold in tape yellow).
    c.lineWidth = 2; c.strokeStyle = TAPE;
    v.val.x.forEach((x, i) => { c.beginPath(); c.arc(X(x), Y(v.val.y[i]!), 5, 0, Math.PI * 2); c.stroke(); });
    v.train.x.forEach((x, i) => {
      const out = v.heldOut?.has(i);
      c.fillStyle = out ? TAPE : PIN; c.strokeStyle = '#6b7280'; c.lineWidth = 1.2;
      c.beginPath(); c.arc(X(x), Y(v.train.y[i]!), out ? 5.5 : 4, 0, Math.PI * 2); c.fill(); c.stroke();
    });
    c.fillStyle = CHALK; c.font = '400 22px "LabAtelier Chalk", cursive'; c.textAlign = 'left';
    c.fillText(v.label, 20, 32);
    this.canvas.setAttribute('aria-label', `Fit: ${v.label}. ${v.train.x.length} training pins, ${v.val.x.length} validation points.${v.truth ? ' True curve shown.' : ''}`);
  }
}

export interface Sweep { xs: number[]; train: number[]; val: number[]; current: number; label: string; marker?: { x: number; text: string } }

export class Ledger {
  readonly canvas = document.createElement('canvas');
  private width = 700;

  constructor() {
    this.canvas.className = 'at-ledger';
    this.canvas.setAttribute('role', 'img');
  }

  resize(width: number): void { this.width = width; }

  draw(s: Sweep): void {
    const { c, w, h } = setup(this.canvas, this.width, 0.34);
    c.fillStyle = PAPER; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(31,58,107,.14)';
    for (let y = 18; y < h; y += 18) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    const all = [...s.train, ...s.val].filter((v) => Number.isFinite(v) && v > 0);
    const lo = Math.log10(Math.min(...all)), hi = Math.log10(Math.max(...all));
    const X = (i: number) => 40 + (i / Math.max(1, s.xs.length - 1)) * (w - 60);
    const Y = (v: number) => 14 + ((hi - Math.log10(Math.max(v, 1e-12))) / Math.max(1e-9, hi - lo)) * (h - 44);
    const line = (vals: number[], colour: string) => {
      c.strokeStyle = colour; c.lineWidth = 2.5; c.beginPath();
      vals.forEach((v, i) => (i ? c.lineTo(X(i), Y(v)) : c.moveTo(X(i), Y(v)))); c.stroke();
      c.fillStyle = colour; vals.forEach((v, i) => { c.beginPath(); c.arc(X(i), Y(v), 2.5, 0, Math.PI * 2); c.fill(); });
    };
    if (s.marker) {
      const i = s.xs.indexOf(s.marker.x);
      if (i >= 0) { c.strokeStyle = '#b58f00'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(X(i), 8); c.lineTo(X(i), h - 26); c.stroke(); c.setLineDash([]); c.fillStyle = '#6e5200'; c.font = '600 11px Georgia, serif'; c.fillText(s.marker.text, X(i) + 4, 18); }
    }
    line(s.train, NAVY);
    line(s.val, THREAD);
    const ci = s.xs.indexOf(s.current);
    if (ci >= 0) { c.strokeStyle = '#2a2118'; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(X(ci), 8); c.lineTo(X(ci), h - 26); c.stroke(); c.setLineDash([]); }
    c.fillStyle = '#574a39'; c.font = '600 11px Georgia, serif'; c.textAlign = 'center';
    s.xs.forEach((x, i) => { if (s.xs.length <= 20 || i % 5 === 0) c.fillText(String(x), X(i), h - 10); });
    c.textAlign = 'left'; c.fillStyle = NAVY; c.fillText('train error', 8, h - 26); c.fillStyle = THREAD; c.fillText('validation error', 80, h - 26);
    c.fillStyle = '#2a2118'; c.textAlign = 'right'; c.fillText(s.label, w - 8, h - 26);
    this.canvas.setAttribute('aria-label', `Ledger: train and validation error across ${s.label}. Current setting ${s.current}.`);
  }
}
