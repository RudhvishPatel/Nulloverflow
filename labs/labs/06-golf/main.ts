// lab/06 GD Golf 3D: entry point. Wires the round, the renderer and the UI together.
import { announce, onKeys, prefersReducedMotion } from '../../core/a11y';
import { detectTier } from '../../core/quality';
import { dailySeed } from '../../core/seed';
import { mountLab } from '../../core/shell';
import { load, save } from '../../core/store';
import { CanvasRenderer } from './render/canvas-renderer';
import type { Renderer } from './render/types';
import { Round } from './sim/game';
import { CLUB_IDS } from './sim/optimizers';
import { GolfUI } from './ui/panel';
import './lab.css';

const stage = mountLab('lab-golf');
const seed = dailySeed('06');
const today = new Date().toISOString().slice(0, 10);
const reduced = prefersReducedMotion();

async function makeRenderer(): Promise<Renderer> {
  const tier = detectTier();
  if (tier !== 'low') {
    try {
      const { ThreeRenderer } = await import('./render/three-renderer');
      return new ThreeRenderer(tier);
    } catch {
      /* WebGL context failed: fall through to 2D */
    }
  }
  return new CanvasRenderer();
}

async function start(): Promise<void> {
  let round = new Round(seed);
  let busy = false;
  const renderer = await makeRenderer();
  stage.root.dataset.renderer = renderer.kind;

  const ui = new GolfUI(stage.root, round, {
    onShoot: () => void shootNow(),
    onNext: () => void nextHole(),
    onReplay: () => void replay(),
  });
  ui.canvasWrap.prepend(renderer.canvas);
  renderer.canvas.setAttribute('role', 'img');

  const resize = () => {
    const w = ui.canvasWrap.clientWidth;
    renderer.resize(w, renderer.kind === '3d' ? Math.round(Math.min(w * 0.72, 620)) : w);
  };
  new ResizeObserver(resize).observe(ui.canvasWrap);
  resize();

  const describe = () => {
    const h = round.hole;
    renderer.canvas.setAttribute('aria-label', `Hole ${h.number}: ${h.surface.name}. Ball at (${round.pos[0].toFixed(2)}, ${round.pos[1].toFixed(2)}), cup at (${h.cup[0].toFixed(2)}, ${h.cup[1].toFixed(2)}).`);
    const [gx, gy] = h.surface.grad(round.pos[0], round.pos[1]);
    ui.updateReadout(h.surface.f(round.pos[0], round.pos[1]), Math.hypot(gx, gy), round.pos);
  };

  const showHole = async (flyover: boolean) => {
    ui.renderHole();
    describe();
    busy = true;
    ui.setBusy(true);
    await renderer.setHole(round.hole, round.pos, flyover && !reduced);
    busy = false;
    ui.setBusy(false);
    announce(`Hole ${round.hole.number}, ${round.hole.surface.name}, par ${round.hole.par}.`);
  };

  const shootNow = async () => {
    if (busy || round.holeDone) return;
    busy = true;
    ui.setBusy(true);
    const outcome = round.play(ui.club, { ...ui.currentParams }, { clip: ui.clipOn ? ui.clip : undefined, schedule: ui.schedule });
    await renderer.playShot({ path: outcome.shot.path, ghosts: outcome.ghosts, hazard: outcome.hazard, holed: outcome.holed, instant: reduced });
    const end = round.pos;
    const d = Math.hypot(end[0] - round.hole.cup[0], end[1] - round.hole.cup[1]);
    announce(ui.showOutcome(outcome, d));
    describe();
    busy = false;
    ui.setBusy(false);
    if (round.finished) finish();
  };

  const nextHole = async () => {
    if (busy || !round.holeDone || round.finished) return;
    round.advance();
    await showHole(true);
  };

  const finish = () => {
    const key = `golf-best`;
    const prev = load<number | null>(key, null);
    if (prev === null || round.vsPar < prev) save(key, round.vsPar);
    const marks: Record<string, string> = { eagle: '🦅', birdie: '🐦', par: '⛳', bogey: '🟧', 'double+': '🟥' };
    const vs = round.vsPar === 0 ? 'E' : round.vsPar > 0 ? `+${round.vsPar}` : String(round.vsPar);
    const share = `Null Overflow · GD Golf ${today}: ${round.total} (${vs}) ${round.card.map((c) => marks[c.result]).join('')}`;
    ui.showEnd(prev, share);
    announce(`Round complete: ${round.total} strokes, ${vs}.`);
  };

  const replay = async () => {
    round = new Round(seed);
    ui.round = round;
    ui.hideEnd();
    await showHole(true);
  };

  onKeys({
    ' ': () => void shootNow(),
    n: () => void nextHole(),
    ArrowRight: () => ui.nudgeLr(1),
    ArrowLeft: () => ui.nudgeLr(-1),
    ...Object.fromEntries(CLUB_IDS.map((c, i) => [String(i + 1), () => ui.selectClub(c)])),
  });

  stage.ready();
  await showHole(true);
}

start().catch((err) => {
  stage.ready();
  stage.root.append(Object.assign(document.createElement('p'), { className: 'mono', textContent: `The lab failed to start: ${String(err)}` }));
  console.error(err);
});
