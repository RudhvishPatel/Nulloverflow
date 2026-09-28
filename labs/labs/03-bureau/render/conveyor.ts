// The inspection line: index cards ride a conveyor, positioned by model confidence. A gate
// at the threshold splits them into PASS and FAIL trays.
import type { Item } from '../sim/bank';

const MANILA = '#e9d8a6', CARD = '#fbf7ea', INK = '#1f1d1a', RED = '#a8231b', GREEN = '#22613a';
const frame = () => new Promise<number>((r) => requestAnimationFrame(r));

export class Conveyor {
  readonly canvas = document.createElement('canvas');
  private c = this.canvas.getContext('2d')!;
  private w = 700;
  private h = 250;
  private arrive = 1;       // 0 → 1 as cards ride in
  private raf = 0;
  private t0 = performance.now();

  constructor(private items: { item: Item; score: number }[], private threshold: () => number, reduced: boolean) {
    this.canvas.className = 'bu-conveyor';
    this.canvas.setAttribute('role', 'img');
    if (!reduced) {
      this.arrive = 0;
      const tick = () => {
        const t = (performance.now() - this.t0) / 1000;
        this.arrive = Math.min(1, t / 1.6);
        this.draw(t);
        if (this.arrive < 1) this.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    }
  }

  resize(width: number): void {
    this.w = Math.max(300, Math.floor(width));
    this.h = this.w < 520 ? 290 : 250;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = this.w * dpr; this.canvas.height = this.h * dpr;
    this.canvas.style.height = `${this.h}px`;
    this.c.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw((performance.now() - this.t0) / 1000);
  }

  private xOf(score: number): number { return 30 + score * (this.w - 60); }

  draw(time = 0): void {
    const { c, w, h } = this, t = this.threshold();
    const beltY = h * 0.56, beltH = 34;
    c.fillStyle = '#36413b'; c.fillRect(0, 0, w, h);
    // Trays.
    const gx = this.xOf(t);
    c.fillStyle = 'rgba(168, 35, 27, .16)'; c.fillRect(0, beltY + beltH, gx, h - beltY - beltH);
    c.fillStyle = 'rgba(34, 97, 58, .2)'; c.fillRect(gx, beltY + beltH, w - gx, h - beltY - beltH);
    c.font = '700 13px "LabBureau Courier", "Courier New", monospace';
    c.fillStyle = '#f5b5ae'; c.textAlign = 'left'; c.fillText('FAIL TRAY', 12, h - 12);
    c.fillStyle = '#a9e3bb'; c.textAlign = 'right'; c.fillText('PASS TRAY', w - 12, h - 12);
    // Belt with rolling slats.
    c.fillStyle = '#23201b'; c.fillRect(0, beltY, w, beltH);
    c.fillStyle = '#3b352c';
    const shift = (time * 60) % 22;
    for (let x = -22 + shift; x < w; x += 22) c.fillRect(x, beltY + 3, 10, beltH - 6);
    // Score axis.
    c.fillStyle = '#d3cab3'; c.font = '600 11px "LabBureau Courier", monospace'; c.textAlign = 'center';
    for (let k = 0; k <= 10; k++) { const x = this.xOf(k / 10); c.fillRect(x, beltY + beltH, 1, 6); c.fillText((k / 10).toFixed(1), x, beltY + beltH + 18); }
    // Cards, stacked where scores collide.
    const lanes: number[] = [];
    const sorted = [...this.items].sort((a, b) => a.score - b.score);
    for (const s of sorted) {
      const x = this.xOf(s.score) - (1 - this.arrive) * w;
      let lane = 0;
      while (lanes[lane] !== undefined && x - lanes[lane]! < 22) lane++;
      lanes[lane] = x;
      const y = beltY - 30 - lane * 20;
      const pass = s.score >= t;
      c.fillStyle = CARD; c.strokeStyle = pass ? GREEN : RED; c.lineWidth = 2;
      c.beginPath(); c.roundRect(x - 10, y, 20, 26, 2); c.fill(); c.stroke();
      c.fillStyle = s.item.label ? GREEN : RED;
      c.beginPath(); c.arc(x, y + 9, 4.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = INK; c.fillRect(x - 6, y + 17, 12, 1.5); c.fillRect(x - 6, y + 21, 8, 1.5);
    }
    // Gate.
    c.strokeStyle = MANILA; c.lineWidth = 3; c.setLineDash([6, 4]);
    c.beginPath(); c.moveTo(gx, 14); c.lineTo(gx, beltY + beltH); c.stroke(); c.setLineDash([]);
    c.fillStyle = MANILA; c.beginPath(); c.roundRect(gx - 34, 4, 68, 20, 4); c.fill();
    c.fillStyle = INK; c.font = '700 12px "LabBureau Courier", monospace'; c.textAlign = 'center'; c.fillText(`t = ${t.toFixed(2)}`, gx, 18);
    const pass = this.items.filter((s) => s.score >= t).length;
    this.canvas.setAttribute('aria-label', `Conveyor of ${this.items.length} outputs by model confidence. Threshold ${t.toFixed(2)}: ${pass} in the pass tray, ${this.items.length - pass} in the fail tray.`);
  }

  dispose(): void { cancelAnimationFrame(this.raf); }
}

/** ROC and PR curves with the current operating point, drawn in ink. */
export class Curves {
  readonly canvas = document.createElement('canvas');
  private c = this.canvas.getContext('2d')!;
  private w = 320;
  private h = 170;

  constructor() {
    this.canvas.className = 'bu-curves';
    this.canvas.setAttribute('role', 'img');
  }

  resize(width: number): void {
    this.w = Math.max(240, Math.floor(width));
    this.h = Math.round(this.w * 0.52);
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = this.w * dpr; this.canvas.height = this.h * dpr;
    this.canvas.style.height = `${this.h}px`;
    this.c.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  draw(roc: { fpr: number; tpr: number }[], pr: { recall: number; precision: number }[], op: { fpr: number; tpr: number; recall: number; precision: number }, aucValue: number, minPrecision: number): void {
    const { c, w, h } = this;
    c.fillStyle = CARD; c.fillRect(0, 0, w, h);
    const pw = (w - 36) / 2, ph = h - 44;
    const plot = (ox: number, title: string, xs: number[], ys: number[], px: number, py: number, hline?: number) => {
      const X = (v: number) => ox + v * pw, Y = (v: number) => 14 + (1 - v) * ph;
      c.strokeStyle = 'rgba(31,29,26,.25)'; c.lineWidth = 1; c.strokeRect(ox, 14, pw, ph);
      if (hline !== undefined) { c.strokeStyle = RED; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(X(0), Y(hline)); c.lineTo(X(1), Y(hline)); c.stroke(); c.setLineDash([]); }
      c.strokeStyle = INK; c.lineWidth = 2; c.beginPath();
      xs.forEach((x, i) => (i ? c.lineTo(X(x), Y(ys[i]!)) : c.moveTo(X(x), Y(ys[i]!))));
      c.stroke();
      c.fillStyle = RED; c.beginPath(); c.arc(X(px), Y(py), 5, 0, Math.PI * 2); c.fill();
      c.fillStyle = INK; c.font = '700 11px "LabBureau Courier", monospace'; c.textAlign = 'left'; c.fillText(title, ox, h - 12);
    };
    plot(12, `ROC · AUC ${aucValue.toFixed(2)}`, roc.map((p) => p.fpr), roc.map((p) => p.tpr), op.fpr, op.tpr);
    plot(24 + pw, `PR · spec ≥ ${minPrecision}`, pr.map((p) => p.recall), pr.map((p) => p.precision), op.recall, op.precision, minPrecision);
    this.canvas.setAttribute('aria-label', `ROC curve, AUC ${aucValue.toFixed(2)}. Operating point: recall ${op.recall.toFixed(2)}, precision ${op.precision.toFixed(2)}.`);
  }
}

export { frame };
