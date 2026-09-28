// DOM for the golf game: HUD, clubs + dials, maths panel, ghost results, scorecard, end card.
import { el, clear } from '../../../core/dom';
import { CLUBS, clubInfo, type ClubInfo, type Dial } from '../clubs';
import type { CardEntry, Round, StrokeOutcome } from '../sim/game';
import type { Club, Params, Schedule } from '../sim/optimizers';
import type { Vec2 } from '../sim/surfaces';

const RESULT_LABEL: Record<string, string> = { eagle: 'EAGLE', birdie: 'BIRDIE', par: 'PAR', bogey: 'BOGEY', 'double+': 'DOUBLE BOGEY+' };

const toSlider = (d: Dial, v: number) => (d.log ? (Math.log10(v) - Math.log10(d.min)) / (Math.log10(d.max) - Math.log10(d.min)) : (v - d.min) / (d.max - d.min)) * 1000;
const fromSlider = (d: Dial, s: number) => {
  const t = s / 1000;
  return d.log ? 10 ** (Math.log10(d.min) + t * (Math.log10(d.max) - Math.log10(d.min))) : d.min + t * (d.max - d.min);
};
export const fmt = (v: number) => (v === 0 ? '0' : Math.abs(v) >= 100 || Math.abs(v) < 1e-3 ? v.toExponential(2) : v.toPrecision(3));

export interface UiHandlers {
  onShoot(): void;
  onNext(): void;
  onReplay(): void;
}

export class GolfUI {
  readonly canvasWrap = el('div', { class: 'golf-canvas-wrap' });
  private hud = el('div', { class: 'golf-hud' });
  private toast = el('div', { class: 'golf-toast', 'aria-hidden': 'true' });
  private clubsRow = el('div', { class: 'golf-clubs', role: 'radiogroup', 'aria-label': 'Club (optimiser)' });
  private dials = el('div', { class: 'golf-dials' });
  private extras = el('div', { class: 'golf-extras' });
  private shootBtn = el('button', { type: 'button', class: 'btn btn-signal golf-shoot' }, 'Shoot');
  private nextBtn = el('button', { type: 'button', class: 'btn golf-next', hidden: true }, 'Next hole →');
  private formula = el('p', { class: 'golf-formula mono' });
  private readout = el('dl', { class: 'golf-readout' });
  private result = el('p', { class: 'golf-result', 'aria-live': 'polite' });
  private ghostList = el('ul', { class: 'golf-ghosts', 'aria-label': 'Rival optimisers on the same shot' });
  private card = el('table', { class: 'golf-card' });
  private end = el('section', { class: 'golf-end', hidden: true, 'aria-labelledby': 'golf-end-title' });

  club: Club = 'adam';
  params: Record<Club, Params> = Object.fromEntries(CLUBS.map((c) => [c.id, { ...c.defaults }])) as Record<Club, Params>;
  clip = 5;
  clipOn = true;
  schedule: Schedule = 'cos';

  constructor(root: HTMLElement, public round: Round, private h: UiHandlers) {
    this.canvasWrap.append(this.toast);
    const controls = el('div', { class: 'golf-controls' },
      el('p', { class: 'golf-controls-title mono' }, 'Choose a club'),
      this.clubsRow, this.dials, this.extras,
      el('div', { class: 'lab-actions' }, this.shootBtn, this.nextBtn),
      el('div', { class: 'golf-math' }, el('p', { class: 'golf-math-title mono' }, 'Update rule'), this.formula, this.readout),
      this.result, this.ghostList);
    root.append(this.hud, el('div', { class: 'lab-stage golf-stage' }, this.canvasWrap, controls), this.card, this.end);
    this.shootBtn.addEventListener('click', () => h.onShoot());
    this.nextBtn.addEventListener('click', () => h.onNext());
    for (const c of CLUBS) {
      const b = el('button', { type: 'button', class: 'golf-club', role: 'radio', 'aria-checked': 'false', 'data-club': c.id, title: `${c.optimizer} (key ${c.key})` },
        el('span', { class: 'golf-club-key mono', 'aria-hidden': 'true' }, c.key),
        el('span', { class: 'golf-club-name' }, c.name),
        el('span', { class: 'golf-club-opt mono' }, c.optimizer));
      b.style.setProperty('--club', c.colour);
      b.addEventListener('click', () => this.selectClub(c.id));
      this.clubsRow.append(b);
    }
    this.selectClub('adam');
  }

  get currentParams(): Params { return this.params[this.club]; }

  selectClub(id: Club): void {
    this.club = id;
    for (const b of this.clubsRow.querySelectorAll<HTMLButtonElement>('.golf-club')) b.setAttribute('aria-checked', String(b.dataset.club === id));
    this.renderDials(clubInfo(id));
  }

  private renderDials(info: ClubInfo): void {
    clear(this.dials);
    for (const d of info.dials) {
      const value = el('strong', {}, fmt(this.params[info.id][d.key] ?? 0));
      const input = el('input', { type: 'range', min: 0, max: 1000, step: 1, value: Math.round(toSlider(d, this.params[info.id][d.key] ?? d.min)), 'aria-label': d.label });
      const sync = () => {
        const v = fromSlider(d, Number(input.value));
        this.params[info.id][d.key] = v;
        value.textContent = fmt(v);
        input.setAttribute('aria-valuetext', `${d.label} ${fmt(v)}`);
      };
      input.addEventListener('input', sync);
      sync();
      this.dials.append(el('label', { class: 'golf-slider' }, el('span', { class: 'golf-slider-label mono' }, `${d.label} `, value), input));
    }
    this.formula.textContent = info.rule;
  }

  /** Nudge the learning rate by one slider notch (keyboard arrows). */
  nudgeLr(dir: 1 | -1): void {
    const input = this.dials.querySelector<HTMLInputElement>('input[type=range]');
    if (!input) return;
    input.value = String(Math.min(1000, Math.max(0, Number(input.value) + dir * 20)));
    input.dispatchEvent(new Event('input'));
  }

  renderHole(): void {
    const r = this.round, h = r.hole;
    clear(this.hud);
    this.hud.append(
      el('div', { class: 'golf-hud-main' },
        el('span', { class: 'golf-hud-hole mono' }, `Hole ${h.number}/${r.holes.length}`),
        el('h4', { class: 'golf-hud-name' }, h.surface.name),
        el('p', { class: 'golf-hud-blurb' }, h.surface.blurb)),
      el('div', { class: 'golf-hud-stats mono' },
        el('span', {}, 'PAR ', el('strong', {}, h.par)),
        el('span', {}, 'STROKE ', el('strong', {}, r.strokes)),
        el('span', {}, 'STEPS/SHOT ', el('strong', {}, h.steps))));
    clear(this.extras);
    if (h.unlocks.clip) {
      const box = el('input', { type: 'checkbox', checked: this.clipOn });
      box.addEventListener('change', () => { this.clipOn = box.checked; });
      this.extras.append(el('label', { class: 'golf-toggle' }, box, ' Gradient clipping ‖g‖ ≤ 5 ', el('span', { class: 'golf-unlock mono' }, 'unlocked')));
    }
    if (h.unlocks.schedule) {
      const sel = el('select', { 'aria-label': 'Learning-rate schedule' },
        ...(['const', 'step', 'cos'] as Schedule[]).map((s) => el('option', { value: s, selected: s === this.schedule }, s === 'const' ? 'constant' : s === 'step' ? 'step decay' : 'cosine')));
      sel.addEventListener('change', () => { this.schedule = sel.value as Schedule; });
      this.extras.append(el('label', { class: 'golf-toggle' }, 'LR schedule ', sel, ' ', el('span', { class: 'golf-unlock mono' }, 'unlocked')));
    }
    this.nextBtn.hidden = true;
    this.shootBtn.hidden = false;
    this.result.textContent = `Tee off. Par ${h.par}.`;
    clear(this.ghostList);
    this.renderCard();
  }

  setBusy(busy: boolean): void {
    this.shootBtn.disabled = busy;
    this.shootBtn.textContent = busy ? 'Rolling…' : 'Shoot';
  }

  updateReadout(loss: number, grad: number, pos: Vec2): void {
    clear(this.readout);
    const row = (k: string, v: string) => [el('dt', {}, k), el('dd', {}, v)];
    this.readout.append(...row('loss f(p)', fmt(loss)), ...row('‖∇f(p)‖', fmt(grad)), ...row('p', `(${fmt(pos[0])}, ${fmt(pos[1])})`));
  }

  showOutcome(o: StrokeOutcome, distance: number): string {
    const r = this.round;
    let msg: string;
    if (o.hazard) { msg = 'Splash! The optimiser diverged: water hazard, +1 penalty stroke. The ball is back where you hit it.'; this.flash('SPLASH', 'hazard'); }
    else if (o.holed) { const c = r.card.at(-1)!; msg = `Holed in ${c.strokes}: ${RESULT_LABEL[c.result]}.`; this.flash(RESULT_LABEL[c.result]!, 'holed'); }
    else if (o.pickedUp) { msg = `Picked up at ${r.card.at(-1)!.strokes} strokes. On to the next hole.`; this.flash('PICKED UP', 'hazard'); }
    else msg = `Stroke ${r.strokes}: ${fmt(distance)} from the cup.`;
    this.result.textContent = msg;
    clear(this.ghostList);
    const sorted = [...o.ghosts].sort((a, b) => Number(b.holed) - Number(a.holed));
    for (const g of sorted) {
      const info = clubInfo(g.club);
      const end = g.path.at(-1)!;
      const d = Math.hypot(end[0] - r.hole.cup[0], end[1] - r.hole.cup[1]);
      const li = el('li', {}, el('span', { class: 'golf-ghost-dot', 'aria-hidden': 'true' }), `${info.optimizer} ghost (η ${fmt(g.params.lr)}): `, el('strong', {}, g.holed ? 'holed' : `${fmt(d)} away`));
      li.style.setProperty('--club', info.colour);
      this.ghostList.append(li);
    }
    this.renderHudStroke();
    if (r.holeDone) {
      this.shootBtn.hidden = true;
      this.nextBtn.hidden = r.finished;
      this.renderCard();
    }
    return msg;
  }

  private renderHudStroke(): void {
    const s = this.hud.querySelectorAll('.golf-hud-stats strong')[1];
    if (s) s.textContent = String(this.round.strokes);
  }

  private flash(text: string, kind: 'holed' | 'hazard'): void {
    this.toast.textContent = text;
    this.toast.className = `golf-toast is-${kind}`;
    void this.toast.offsetWidth;
    this.toast.classList.add('is-on');
  }

  private renderCard(): void {
    const r = this.round;
    clear(this.card);
    const byHole = new Map<number, CardEntry>(r.card.map((c) => [c.hole, c]));
    this.card.append(
      el('caption', { class: 'mono' }, 'Scorecard'),
      el('thead', {}, el('tr', {}, el('th', { scope: 'row' }, 'Hole'), ...r.holes.map((h) => el('th', { scope: 'col', class: h.number === r.hole.number ? 'is-current' : '' }, h.number)), el('th', { scope: 'col' }, 'Total'))),
      el('tbody', {},
        el('tr', {}, el('th', { scope: 'row' }, 'Par'), ...r.holes.map((h) => el('td', {}, h.par)), el('td', {}, r.holes.reduce((a, h) => a + h.par, 0))),
        el('tr', {}, el('th', { scope: 'row' }, 'Strokes'), ...r.holes.map((h) => {
          const c = byHole.get(h.number);
          return el('td', { class: c ? `is-${c.result.replace('+', 'plus')}` : '' }, c ? c.strokes : '·');
        }), el('td', {}, r.card.length ? r.total : '·'))));
  }

  showEnd(best: number | null, shareText: string): void {
    const r = this.round;
    clear(this.end);
    const vs = r.vsPar === 0 ? 'E' : r.vsPar > 0 ? `+${r.vsPar}` : String(r.vsPar);
    const copy = el('button', { type: 'button', class: 'btn' }, 'Copy result');
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(shareText); copy.textContent = 'Copied ✓'; } catch { copy.textContent = 'Copy failed'; }
    });
    const again = el('button', { type: 'button', class: 'btn btn-signal' }, 'Replay today’s course');
    again.addEventListener('click', () => this.h.onReplay());
    this.end.append(
      el('p', { class: 'mono golf-end-kicker' }, 'Round complete'),
      el('h4', { id: 'golf-end-title', class: 'golf-end-score' }, `${r.total} strokes · ${vs}`),
      el('p', { class: 'golf-end-best' }, best === null ? 'First round logged on this device.' : `Your best on this device: ${best === 0 ? 'E' : best > 0 ? `+${best}` : best}.`),
      el('div', { class: 'lab-actions' }, again, copy));
    this.end.hidden = false;
    this.end.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  hideEnd(): void { this.end.hidden = true; }
}
