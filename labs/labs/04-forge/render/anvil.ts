// The forge scene: anvil under a hanging hammer, fire glow, a strike + pour when you run the
// suite, then the red-team wave (attack darts that deflect off the shield or crack through).
const frame = () => new Promise<number>((r) => requestAnimationFrame(r));
const EMBER = '#ff8a2a', HOT = '#ffd98a', IRON = '#45403b', SOOT = '#0e0b09';

interface Spark { x: number; y: number; vx: number; vy: number; life: number }
export interface WaveShot { name: string; blocked: boolean }

export class Anvil {
  readonly canvas = document.createElement('canvas');
  private c = this.canvas.getContext('2d')!;
  private w = 760;
  private h = 230;
  private sparks: Spark[] = [];
  private heat = 0.35;       // glow of the ingot on the anvil (0–1)
  private hammer = 0;        // 0 up, 1 striking
  private cracks: number[] = [];
  private raf = 0;
  private darts: { y: number; x: number; blocked: boolean; name: string; done: boolean }[] = [];

  constructor(private reduced: boolean) {
    this.canvas.className = 'fg-anvil';
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute('aria-label', 'The forge: an anvil under a hammer. Runs strike the prompt; red-team waves test its shield.');
    const loop = (t: number) => { this.draw(t / 1000); this.raf = requestAnimationFrame(loop); };
    if (!reduced) this.raf = requestAnimationFrame(loop);
  }

  resize(width: number): void {
    this.w = Math.max(300, Math.floor(width));
    this.h = this.w < 520 ? 200 : 230;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = this.w * dpr; this.canvas.height = this.h * dpr;
    this.canvas.style.height = `${this.h}px`;
    this.c.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw(performance.now() / 1000);
  }

  private draw(t: number): void {
    const { c, w, h } = this;
    const g = c.createRadialGradient(w * 0.34, h * 1.05, 10, w * 0.34, h * 1.05, h * 1.3);
    g.addColorStop(0, `rgba(255,120,30,${0.35 + 0.12 * Math.sin(t * 3)})`); g.addColorStop(1, SOOT);
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    // Brick back wall.
    c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 1;
    for (let y = 0; y < h; y += 22) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); for (let x = (y / 22) % 2 ? 0 : 30; x < w; x += 60) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 22); c.stroke(); } }
    // Anvil.
    const ax = w * 0.34, ay = h * 0.66;
    c.fillStyle = IRON;
    c.beginPath(); c.moveTo(ax - 110, ay - 30); c.lineTo(ax + 70, ay - 30); c.quadraticCurveTo(ax + 125, ay - 26, ax + 150, ay - 14);
    c.quadraticCurveTo(ax + 95, ay - 6, ax + 45, ay - 6); c.lineTo(ax + 30, ay + 22); c.lineTo(ax + 55, ay + 48); c.lineTo(ax - 85, ay + 48); c.lineTo(ax - 60, ay + 22); c.lineTo(ax - 75, ay - 6); c.lineTo(ax - 110, ay - 6); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,200,150,.12)'; c.fillRect(ax - 110, ay - 30, 180, 4);
    // Ingot (the prompt) glowing on the anvil.
    const ig = c.createLinearGradient(ax - 60, ay - 44, ax + 40, ay - 30);
    ig.addColorStop(0, HOT); ig.addColorStop(0.6, EMBER); ig.addColorStop(1, '#b8400f');
    c.globalAlpha = 0.35 + 0.65 * this.heat; c.fillStyle = ig;
    c.beginPath(); c.roundRect(ax - 60, ay - 46, 100, 16, 4); c.fill(); c.globalAlpha = 1;
    c.shadowColor = EMBER; c.shadowBlur = 24 * this.heat; c.fillStyle = 'rgba(255,190,90,.25)'; c.fillRect(ax - 60, ay - 46, 100, 16); c.shadowBlur = 0;
    // Hammer.
    c.save();
    c.translate(ax + 150, 18);
    c.rotate(-0.9 + this.hammer * 0.95);
    c.fillStyle = '#6b4a2b'; c.fillRect(-4, 0, 8, 120);
    c.fillStyle = '#2e2926'; c.fillRect(-26, 110, 52, 26);
    c.restore();
    // Shield (right) for red-team waves, with cracks from breaches.
    const sx = w * 0.78, sy = h * 0.46;
    c.fillStyle = '#2c2520'; c.strokeStyle = '#c98a55'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(sx, sy - 58); c.lineTo(sx + 44, sy - 40); c.lineTo(sx + 38, sy + 20); c.lineTo(sx, sy + 58); c.lineTo(sx - 38, sy + 20); c.lineTo(sx - 44, sy - 40); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = HOT; c.font = '700 12px "LabForge Serif", Georgia, serif'; c.textAlign = 'center'; c.fillText('PROMPT', sx, sy + 4);
    c.strokeStyle = '#0b0706'; c.lineWidth = 2;
    for (const k of this.cracks) { c.beginPath(); c.moveTo(sx + k * 6, sy - 30); c.lineTo(sx + k * 10 - 6, sy); c.lineTo(sx + k * 4, sy + 26); c.stroke(); }
    // Darts.
    for (const d of this.darts) {
      c.fillStyle = d.blocked ? HOT : '#ff5a4f';
      c.beginPath(); c.moveTo(d.x, d.y); c.lineTo(d.x + 26, d.y - 6); c.lineTo(d.x + 26, d.y + 6); c.closePath(); c.fill();
      c.fillStyle = '#f3e6d8'; c.font = '600 11px "LabForge Serif", Georgia, serif'; c.textAlign = 'left';
      c.fillText(d.name, d.x + 30, d.y + 4);
    }
    // Sparks.
    for (const p of this.sparks) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.life -= 0.025;
      c.globalAlpha = Math.max(0, p.life); c.fillStyle = p.life > 0.5 ? HOT : EMBER; c.fillRect(p.x, p.y, 3, 3);
    }
    c.globalAlpha = 1;
    this.sparks = this.sparks.filter((p) => p.life > 0);
  }

  private burst(x: number, y: number, n: number): void {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, s = 2 + Math.random() * 6;
      this.sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1 });
    }
  }

  /** Hammer strike + reheat: plays when the suite runs. */
  async strike(passRate: number): Promise<void> {
    this.heat = 1;
    this.cracks = [];
    if (this.reduced) { this.heat = 0.35 + 0.65 * passRate; this.draw(0); return; }
    const ax = this.w * 0.34, ay = this.h * 0.66;
    for (let k = 0; k < 3; k++) {
      const t0 = performance.now();
      for (;;) {
        const u = Math.min(1, (performance.now() - t0) / 220);
        this.hammer = u < 0.6 ? u / 0.6 : 1 - (u - 0.6) / 0.4;
        if (u >= 0.6 && this.hammer > 0.95) this.burst(ax - 10, ay - 46, 28);
        if (u >= 1) break;
        await frame();
      }
    }
    this.hammer = 0;
    const t1 = performance.now();
    while (performance.now() - t1 < 500) { this.heat = 1 - ((performance.now() - t1) / 500) * (1 - (0.35 + 0.65 * passRate)); await frame(); }
  }

  /** Red-team wave: darts fly at the shield; blocked ones deflect in sparks, breaches crack it. */
  async wave(shots: WaveShot[]): Promise<void> {
    if (this.reduced) { this.cracks = shots.map((s, i) => (s.blocked ? NaN : i - 1)).filter((k) => !Number.isNaN(k)); this.draw(0); return; }
    const sx = this.w * 0.78;
    this.darts = shots.map((s, i) => ({ y: this.h * 0.25 + i * 44, x: -170 - i * 60, blocked: s.blocked, name: s.name, done: false }));
    const t0 = performance.now();
    while (performance.now() - t0 < 1500 && this.darts.some((d) => !d.done)) {
      for (const [i, d] of this.darts.entries()) {
        if (d.done) continue;
        d.x += 17;
        if (d.x + 26 >= sx - 44) {
          d.done = true;
          if (d.blocked) this.burst(sx - 44, d.y, 18);
          else this.cracks.push(i - 1);
        }
      }
      await frame();
    }
    this.darts = [];
  }

  dispose(): void { cancelAnimationFrame(this.raf); }
}
