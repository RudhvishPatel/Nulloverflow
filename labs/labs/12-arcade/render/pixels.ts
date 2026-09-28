// Pixel-art dungeon: tiles, torchlight value heatmap, policy arrows, trails, the knight;
// plus the learning-curve chart.
import { ACTIONS, type Dungeon } from '../sim/dungeon';
import type { Agent } from '../sim/agent';

const PAL = { wall: '#2a1b52', wallHi: '#3c2a70', floor: '#1a0f3a', floorHi: '#22144a', lava: '#ff2a6d', lava2: '#ff7a3d', gold: '#f9c80e', cyan: '#05d9e8', ink: '#f2e9ff', wind: '#9ad7e6', key: '#f9c80e', door: '#8a5a2b', crumb: '#bff9ff' };
const KNIGHT = ['..XXXX..', '.XXXXXX.', '.XOXXOX.', '.XXXXXX.', '..XXXX..', '.XXXXXX.', 'XX.XX.XX', '.X....X.'];
const CHEST = ['........', '.XXXXXX.', 'XGGGGGGX', 'XGGXXGGX', 'XXXXXXXX', 'XGGGGGGX', 'XGGGGGGX', '.XXXXXX.'];

export class DungeonView {
  readonly canvas = document.createElement('canvas');
  private c = this.canvas.getContext('2d')!;
  tile = 32;

  constructor(private d: Dungeon) {
    this.canvas.className = 'ar-dungeon';
    this.canvas.setAttribute('role', 'img');
  }

  setDungeon(d: Dungeon): void { this.d = d; }

  resize(width: number): void {
    this.tile = Math.max(16, Math.floor(Math.min(width, 720) / this.d.w));
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = this.d.w * this.tile * dpr; this.canvas.height = this.d.h * this.tile * dpr;
    this.canvas.style.width = `${this.d.w * this.tile}px`; this.canvas.style.height = `${this.d.h * this.tile}px`;
    this.c.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.c.imageSmoothingEnabled = false;
  }

  private sprite(rows: string[], x: number, y: number, colours: Record<string, string>): void {
    const p = this.tile / 8;
    rows.forEach((r, j) => [...r].forEach((ch, i) => { const col = colours[ch]; if (col) { this.c.fillStyle = col; this.c.fillRect(x + i * p, y + j * p, Math.ceil(p), Math.ceil(p)); } }));
  }

  draw(opts: { agent?: Agent; showValues: boolean; showPolicy: boolean; trail?: [number, number][]; knight?: [number, number]; t: number }): void {
    const { c, d, tile: T } = this;
    let vMin = Infinity, vMax = -Infinity;
    if (opts.agent && opts.showValues) for (let y = 0; y < d.h; y++) for (let x = 0; x < d.w; x++) { const v = opts.agent.value({ x, y, key: false, mask: 0 }); if (v) { vMin = Math.min(vMin, v); vMax = Math.max(vMax, v); } }
    for (let y = 0; y < d.h; y++) for (let x = 0; x < d.w; x++) {
      const k = d.cell(x, y).kind, X = x * T, Y = y * T;
      if (k === 'wall') { c.fillStyle = PAL.wall; c.fillRect(X, Y, T, T); c.fillStyle = PAL.wallHi; c.fillRect(X, Y, T, T / 8); c.fillRect(X + ((y % 2) * T) / 2, Y + T / 2, T / 8, T / 2); continue; }
      c.fillStyle = (x + y) % 2 ? PAL.floor : PAL.floorHi; c.fillRect(X, Y, T, T);
      if (k === 'lava') { c.fillStyle = PAL.lava; c.fillRect(X, Y, T, T); c.fillStyle = PAL.lava2; const o = Math.floor((opts.t * 4 + x) % 4) * (T / 8); c.fillRect(X + o, Y + T / 4, T / 4, T / 8); c.fillRect(X + ((o + T / 2) % T), Y + (T * 5) / 8, T / 4, T / 8); }
      if (k === 'wind') { c.fillStyle = PAL.wind; c.fillRect(X + T / 2 - T / 16, Y + T / 4, T / 8, T / 2); c.fillRect(X + T / 2 - T / 4 + T / 16, Y + T / 4, T / 2 - T / 8, T / 8); }
      if (k === 'treasure') this.sprite(CHEST, X, Y, { X: '#000', G: PAL.gold });
      if (k === 'decoy') this.sprite(CHEST, X, Y, { X: '#000', G: '#9a8a5a' });
      if (k === 'key') { c.fillStyle = PAL.key; c.fillRect(X + T / 4, Y + T / 4, T / 4, T / 4); c.fillRect(X + T / 2, Y + T * 0.34, T / 3, T / 8); }
      if (k === 'door') { c.fillStyle = PAL.door; c.fillRect(X + T / 8, Y, (T * 3) / 4, T); c.fillStyle = PAL.gold; c.fillRect(X + T * 0.62, Y + T / 2, T / 8, T / 8); }
      if (k === 'crumb') { c.fillStyle = PAL.crumb; c.fillRect(X + T * 0.4, Y + T * 0.4, T / 5, T / 5); }
      if (opts.agent && opts.showValues && Number.isFinite(vMin) && k !== 'lava') {
        const v = opts.agent.value({ x, y, key: false, mask: 0 });
        const u = vMax > vMin ? (v - vMin) / (vMax - vMin) : 0;
        c.fillStyle = `rgba(249,200,14,${(0.05 + 0.4 * u).toFixed(3)})`; c.fillRect(X, Y, T, T);
      }
      if (opts.agent && opts.showPolicy && (k === 'floor' || k === 'start' || k === 'wind' || k === 'crumb')) {
        const a = ACTIONS[opts.agent.best({ x, y, key: false, mask: 0 })]!;
        c.fillStyle = PAL.cyan;
        const cx = X + T / 2, cy = Y + T / 2, s = T / 6;
        const [dx, dy] = a === 'up' ? [0, -1] : a === 'down' ? [0, 1] : a === 'left' ? [-1, 0] : [1, 0];
        c.fillRect(cx - s / 2 + dx * s, cy - s / 2 + dy * s, s, s);
        c.fillRect(cx - s / 4, cy - s / 4, s / 2, s / 2);
      }
    }
    if (opts.trail && opts.trail.length > 1) {
      c.strokeStyle = 'rgba(255,42,109,.75)'; c.lineWidth = Math.max(2, T / 8); c.beginPath();
      opts.trail.forEach(([x, y], i) => (i ? c.lineTo(x * T + T / 2, y * T + T / 2) : c.moveTo(x * T + T / 2, y * T + T / 2))); c.stroke();
    }
    const [kx, ky] = opts.knight ?? d.start;
    this.sprite(KNIGHT, kx * T, ky * T, { X: PAL.ink, O: '#000' });
    this.canvas.setAttribute('aria-label', `${d.name}: ${d.w} by ${d.h} dungeon. Knight at column ${kx + 1}, row ${ky + 1}.`);
  }
}

export function drawCurve(canvas: HTMLCanvasElement, width: number, returns: number[]): void {
  const w = Math.max(240, Math.floor(width)), h = 110, dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.height = `${h}px`;
  const c = canvas.getContext('2d')!;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
  c.fillStyle = PAL.cyan; c.font = '16px "LabArcade Term", monospace'; c.fillText('return per episode (moving average)', 8, 16);
  if (returns.length < 2) return;
  const avg = returns.map((_, i) => { const s = returns.slice(Math.max(0, i - 19), i + 1); return s.reduce((a, b) => a + b, 0) / s.length; });
  const lo = Math.min(...avg), hi = Math.max(...avg, lo + 1);
  c.strokeStyle = PAL.gold; c.lineWidth = 2; c.beginPath();
  avg.forEach((v, i) => { const x = 8 + (i / (avg.length - 1)) * (w - 16), y = h - 8 - ((v - lo) / (hi - lo)) * (h - 32); i ? c.lineTo(x, y) : c.moveTo(x, y); });
  c.stroke();
}
