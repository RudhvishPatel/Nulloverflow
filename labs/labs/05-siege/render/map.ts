// The campaign map: five roads to five gates in the castle wall. Traffic marches in real
// time; blocked raiders recoil in sparks, breaches flash the gate red.
import { ROUTES, type Config, type WaveResult } from '../sim/siege';

const frame = () => new Promise<number>((r) => requestAnimationFrame(r));
const INK = '#2b1d10', PARCH = '#efe2c0', ROAD = '#b89a6a', GREEN = '#2f6b3a', RED = '#8e1b1b', GOLD = '#b8860b';
const GLYPH: Record<string, string> = { stuffing: 'S', ddos: 'D', xss: 'X', sqli: 'Q', scraper: 'C', ssrf: 'F' };
const SPARK: Record<string, string> = { rate: '#f2c14e', auth: '#7fb2ff', csp: '#62c2d0', vault: '#d9a441', waf: '#ff8a5c' };

interface Unit { res: WaveResult; spawn: number; x: number; state: 'walk' | 'bounce' | 'in' | 'gone'; bounce: number }
interface Spark { x: number; y: number; vx: number; vy: number; life: number; c: string }

export class SiegeMap {
  readonly canvas = document.createElement('canvas');
  private c = this.canvas.getContext('2d')!;
  private w = 760;
  private h = 320;
  private sparks: Spark[] = [];
  private scorch: number[] = [0, 0, 0, 0, 0];

  constructor() {
    this.canvas.className = 'sg-map';
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute('aria-label', 'Campaign map: five roads lead to five gates in the castle wall.');
  }

  resize(width: number): void {
    this.w = Math.max(300, Math.floor(width));
    this.h = this.w < 520 ? 300 : 320;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = this.w * dpr; this.canvas.height = this.h * dpr;
    this.canvas.style.height = `${this.h}px`;
    this.c.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private laneY(i: number): number { return 34 + i * ((this.h - 58) / (ROUTES.length - 1)); }
  private get gateX(): number { return Math.max(110, this.w * 0.2); }

  draw(cfg: Config, units: Unit[] = []): void {
    const { c, w, h } = this, gx = this.gateX;
    c.fillStyle = PARCH; c.fillRect(0, 0, w, h);
    // Parchment stains.
    const g = c.createRadialGradient(w * 0.6, h * 0.5, 10, w * 0.6, h * 0.5, w * 0.7);
    g.addColorStop(0, 'rgba(255,250,235,.5)'); g.addColorStop(1, 'rgba(140,100,40,.25)');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    // Castle wall.
    c.fillStyle = '#8a7a60'; c.fillRect(0, 0, gx - 36, h);
    c.fillStyle = '#6e604b';
    for (let y = 0; y < h; y += 18) for (let x = (y / 18) % 2 ? 0 : 14; x < gx - 36; x += 28) c.fillRect(x, y, 26, 2);
    ROUTES.forEach((route, i) => {
      const y = this.laneY(i);
      // Road.
      c.strokeStyle = ROAD; c.lineWidth = 14; c.lineCap = 'round';
      c.beginPath(); c.moveTo(gx, y); c.lineTo(w - 10, y); c.stroke();
      c.strokeStyle = 'rgba(43,29,16,.35)'; c.lineWidth = 1.5; c.setLineDash([8, 6]);
      c.beginPath(); c.moveTo(gx, y); c.lineTo(w - 10, y); c.stroke(); c.setLineDash([]);
      // Gate.
      const burn = this.scorch[i]!;
      c.fillStyle = burn > 0 ? `rgb(${120 + 100 * burn},${50},${30})` : '#5a4630';
      c.beginPath(); c.roundRect(gx - 36, y - 18, 36, 36, [16, 16, 0, 0]); c.fill();
      c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
      c.fillStyle = PARCH; c.font = '600 12px "LabSiege Caps", Georgia, serif'; c.textAlign = 'right';
      c.fillText(route, gx - 42, y + 4);
      // Defence pips on the gate.
      const d = cfg[route] ?? {};
      ['rate', 'auth', 'csp', 'vault'].forEach((k, j) => {
        const tier = d[k] ?? 0;
        c.fillStyle = tier ? SPARK[k]! : 'rgba(239,226,192,.25)';
        c.beginPath(); c.arc(gx - 30 + j * 8, y + 12, tier === 2 ? 3.5 : 2.5, 0, Math.PI * 2); c.fill();
      });
      this.scorch[i] = Math.max(0, burn - 0.01);
    });
    // Units.
    for (const u of units) {
      if (u.state === 'gone' || u.state === 'in') continue;
      const lane = ROUTES.indexOf(u.res.request.route as (typeof ROUTES)[number]);
      const y = this.laneY(lane) + ((u.res.request.id % 3) - 1) * 4;
      if (u.res.request.kind === 'visitor') {
        c.fillStyle = GREEN; c.strokeStyle = '#173a1f'; c.lineWidth = 1.5;
        c.beginPath(); c.arc(u.x, y, 6, 0, Math.PI * 2); c.fill(); c.stroke();
      } else {
        c.save(); c.translate(u.x, y); c.rotate(Math.PI / 4);
        c.fillStyle = RED; c.fillRect(-6, -6, 12, 12); c.restore();
        c.fillStyle = PARCH; c.font = '700 9px Georgia, serif'; c.textAlign = 'center'; c.fillText(GLYPH[u.res.request.kind] ?? '?', u.x, y + 3);
      }
    }
    // Sparks.
    for (const p of this.sparks) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 0.03;
      c.globalAlpha = Math.max(0, p.life); c.fillStyle = p.c; c.fillRect(p.x, p.y, 3, 3);
    }
    c.globalAlpha = 1;
    this.sparks = this.sparks.filter((p) => p.life > 0);
  }

  /** Animate a wave; resolves when every unit has arrived. */
  async play(results: WaveResult[], cfg: Config, instant: boolean): Promise<void> {
    if (instant) {
      results.forEach((r) => { if (!r.verdict.blocked && r.request.kind !== 'visitor') this.scorch[ROUTES.indexOf(r.request.route as (typeof ROUTES)[number])] = 1; });
      this.draw(cfg);
      return;
    }
    const units: Unit[] = results.map((res) => ({ res, spawn: res.request.t * 40, x: this.w + 10, state: 'walk', bounce: 0 }));
    const t0 = performance.now(), speed = (this.w - this.gateX) / 1400;
    let last = t0;
    while (units.some((u) => u.state === 'walk' || u.state === 'bounce')) {
      const now = performance.now(), dt = now - last; last = now;
      for (const u of units) {
        if (now - t0 < u.spawn) continue;
        const lane = ROUTES.indexOf(u.res.request.route as (typeof ROUTES)[number]);
        if (u.state === 'walk') {
          u.x -= speed * dt;
          if (u.x <= this.gateX + 6) {
            if (u.res.verdict.blocked) {
              u.state = 'bounce';
              this.burst(this.gateX + 6, this.laneY(lane), SPARK[u.res.verdict.by ?? 'rate'] ?? '#fff');
            } else {
              u.state = 'in';
              if (u.res.request.kind !== 'visitor') this.scorch[lane] = 1;
            }
          }
        } else if (u.state === 'bounce') {
          u.bounce += dt;
          u.x += speed * dt * 1.4;
          if (u.bounce > 400) u.state = 'gone';
        }
      }
      this.draw(cfg, units);
      await frame();
    }
    this.draw(cfg);
  }

  private burst(x: number, y: number, c: string): void {
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI - Math.PI / 2, s = 1 + Math.random() * 3;
      this.sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, c });
    }
  }
}
