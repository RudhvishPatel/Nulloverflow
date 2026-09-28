// Drafting-table canvas: a log ruler with the red-pencil interval, an animated truth
// line drawn by a pen, and the end-of-run calibration chart.
import { valueLabel, type Answer, type Question } from '../sim/run';

const WHITE = '#ffffff', PENCIL = '#ff8a80', INK = '#ffe08a', PAPER = '#163f75', GRID = 'rgba(255,255,255,.13)';
const frame = () => new Promise<number>((r) => requestAnimationFrame(r));
const HAND = '"LabBlueprint Hand", "Comic Neue", cursive';
const MONO = '"LabBlueprint Mono", "IBM Plex Mono", monospace';
const sup = (n: number) => String(n).replace('-', '⁻').replace(/\d/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]!);

export class Ruler {
  readonly canvas = document.createElement('canvas');
  private c = this.canvas.getContext('2d')!;
  private w = 800;
  private h = 260;

  constructor() {
    this.canvas.className = 'bp-ruler';
    this.canvas.setAttribute('role', 'img');
  }

  resize(width: number, height = 260): void {
    this.w = Math.max(280, Math.floor(width));
    this.h = height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = this.w * dpr; this.canvas.height = this.h * dpr;
    this.canvas.style.height = `${this.h}px`;
    this.c.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private paper(): void {
    const { c, w, h } = this;
    c.fillStyle = PAPER; c.fillRect(0, 0, w, h);
    c.strokeStyle = GRID; c.lineWidth = 1;
    for (let x = 0; x < w; x += 24) { c.beginPath(); c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, h); c.stroke(); }
    for (let y = 0; y < h; y += 24) { c.beginPath(); c.moveTo(0, y + 0.5); c.lineTo(w, y + 0.5); c.stroke(); }
  }

  private x(q: Question, d: number): number {
    const pad = 28;
    return pad + ((d - q.lo) / (q.hi - q.lo)) * (this.w - pad * 2);
  }

  /** The ruler plus the current interval; `truthFrac` 0–1 animates the pen. */
  draw(q: Question, low: number, high: number, truth?: { value: number; frac: number; hit: boolean }): void {
    const { c, w, h } = this;
    const u = q.fact.unit;
    this.canvas.setAttribute('aria-label', `Log ruler for ${q.fact.label}. Your 90% interval: ${valueLabel(Math.min(low, high), u)} to ${valueLabel(Math.max(low, high), u)}.`
      + (truth && truth.frac >= 1 ? ` Truth: ${valueLabel(truth.value, u)}, ${truth.hit ? 'inside' : 'outside'} your interval.` : ''));
    this.paper();
    const axisY = h * 0.62;
    c.strokeStyle = WHITE; c.fillStyle = WHITE; c.lineWidth = 2;
    c.beginPath(); c.moveTo(20, axisY); c.lineTo(w - 20, axisY); c.stroke();
    c.font = `600 13px ${MONO}`; c.textAlign = 'center';
    for (let d = Math.ceil(q.lo); d <= Math.floor(q.hi); d++) {
      const x = this.x(q, d);
      c.lineWidth = 2; c.beginPath(); c.moveTo(x, axisY); c.lineTo(x, axisY + 16); c.stroke();
      c.fillText(`10${sup(d)}`, x, axisY + 34);
      c.lineWidth = 1;
      for (let k = 2; k <= 9; k++) {
        const sx = this.x(q, d + Math.log10(k));
        if (sx > w - 20) break;
        c.beginPath(); c.moveTo(sx, axisY); c.lineTo(sx, axisY + (k === 5 ? 11 : 7)); c.stroke();
      }
    }
    c.font = `400 15px ${HAND}`; c.textAlign = 'right';
    c.fillText(`unit: ${q.fact.unit}`, w - 24, h - 12);

    // Red-pencil interval: shaded band + bracket ends.
    const x1 = this.x(q, Math.min(low, high)), x2 = this.x(q, Math.max(low, high));
    c.fillStyle = 'rgba(255, 138, 128, .18)';
    c.fillRect(x1, axisY - 58, x2 - x1, 58);
    c.strokeStyle = PENCIL; c.lineWidth = 2.5; c.setLineDash([7, 4]);
    c.beginPath(); c.moveTo(x1, axisY - 58); c.lineTo(x1, axisY); c.moveTo(x2, axisY - 58); c.lineTo(x2, axisY);
    c.moveTo(x1, axisY - 58); c.lineTo(x2, axisY - 58); c.stroke();
    c.setLineDash([]);
    c.fillStyle = PENCIL; c.font = `400 15px ${HAND}`; c.textAlign = 'center';
    c.fillText('90% sure it lands here', (x1 + x2) / 2, axisY - 68);

    if (truth) {
      const tx = this.x(q, truth.value);
      const px = 20 + (tx - 20) * truth.frac;
      c.strokeStyle = INK; c.lineWidth = 3;
      c.beginPath(); c.moveTo(20, axisY - 90); c.lineTo(px, axisY - 90); c.stroke();
      // Pen nib.
      c.fillStyle = WHITE;
      c.beginPath(); c.moveTo(px, axisY - 90); c.lineTo(px - 10, axisY - 104); c.lineTo(px - 4, axisY - 108); c.closePath(); c.fill();
      if (truth.frac >= 1) {
        c.strokeStyle = INK; c.lineWidth = 3;
        c.beginPath(); c.moveTo(tx, axisY - 90); c.lineTo(tx, axisY + 4); c.stroke();
        c.fillStyle = INK;
        for (let k = 0; k < 9; k++) {
          const a = k * 0.7, rr = 6 + (k % 3) * 4;
          c.beginPath(); c.arc(tx + Math.cos(a) * rr, axisY + Math.sin(a) * rr * 0.5, 2 + (k % 2), 0, Math.PI * 2); c.fill();
        }
        c.font = `400 17px ${HAND}`; c.textAlign = tx > w * 0.7 ? 'right' : 'left';
        c.fillText(truth.hit ? 'truth: inside your bracket' : 'truth: outside', tx + (tx > w * 0.7 ? -10 : 10), axisY - 98);
      }
    }
  }

  async revealTruth(q: Question, a: Answer, instant: boolean): Promise<void> {
    if (instant) { this.draw(q, a.low, a.high, { value: a.truth, frac: 1, hit: a.hit }); return; }
    const t0 = performance.now(), dur = 1100;
    for (;;) {
      const t = Math.min(1, (performance.now() - t0) / dur);
      this.draw(q, a.low, a.high, { value: a.truth, frac: 1 - (1 - t) ** 3, hit: a.hit });
      if (t >= 1) break;
      await frame();
    }
  }

  /** End of run: every interval relative to its truth (x = decades from truth), plus hit rate vs 90 %. */
  async calibrationChart(qs: Question[], answers: Answer[], instant: boolean): Promise<void> {
    const { c, w } = this;
    const rows = answers.length, h = 60 + rows * 34 + 80;
    this.resize(w, h);
    const span = 3, mid = w * 0.42, scale = (w * 0.34) / span;
    const t0 = performance.now(), dur = instant ? 0 : 1600;
    for (;;) {
      const t = dur === 0 ? 1 : Math.min(1, (performance.now() - t0) / dur);
      this.paper();
      c.strokeStyle = INK; c.lineWidth = 2; c.setLineDash([4, 4]);
      c.beginPath(); c.moveTo(mid, 30); c.lineTo(mid, 50 + rows * 34); c.stroke(); c.setLineDash([]);
      c.fillStyle = INK; c.font = `400 15px ${HAND}`; c.textAlign = 'center'; c.fillText('truth', mid, 22);
      answers.forEach((a, i) => {
        const shown = Math.min(1, Math.max(0, t * rows - i));
        if (shown <= 0) return;
        const y = 50 + i * 34;
        const l = mid + Math.max(-span, a.low - a.truth) * scale, u = mid + Math.min(span, a.high - a.truth) * scale;
        c.strokeStyle = a.hit ? '#9df0b4' : PENCIL; c.lineWidth = 4;
        c.beginPath(); c.moveTo(l, y); c.lineTo(l + (u - l) * shown, y); c.stroke();
        c.fillStyle = WHITE; c.font = `500 12px ${MONO}`; c.textAlign = 'left';
        const label = qs[i]!.fact.label;
        c.fillText(label.length > 34 ? `${label.slice(0, 33)}…` : label, Math.min(w * 0.8, mid + span * scale + 14), y + 4);
      });
      // Hit-rate bar vs the 90 % target.
      const hits = answers.filter((a) => a.hit).length / rows;
      const by = 70 + rows * 34, bw = w - 60;
      c.strokeStyle = WHITE; c.lineWidth = 1.5; c.strokeRect(30, by, bw, 18);
      c.fillStyle = hits >= 0.75 ? '#9df0b4' : PENCIL; c.fillRect(30, by, bw * hits * t, 18);
      c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(30 + bw * 0.9, by - 6); c.lineTo(30 + bw * 0.9, by + 24); c.stroke();
      c.fillStyle = WHITE; c.font = `400 15px ${HAND}`; c.textAlign = 'left';
      c.fillText(`your hit rate ${Math.round(hits * 100)}%  ·  target 90%`, 30, by + 44);
      if (t >= 1) break;
      await frame();
    }
    this.canvas.setAttribute('aria-label', `Calibration chart: ${answers.filter((a) => a.hit).length} of ${rows} intervals contained the truth.`);
  }
}
