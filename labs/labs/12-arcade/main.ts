// lab/12 RL Arena: train a tabular agent in three daily dungeons. Tune α, γ, ε, pick
// Q-learning or SARSA, place breadcrumbs, then watch the greedy knight try for the treasure.
import { announce, prefersReducedMotion } from '../../core/a11y';
import { clear, el } from '../../core/dom';
import { dailySeed, rng } from '../../core/seed';
import { mountLab } from '../../core/shell';
import { load, save } from '../../core/store';
import { DungeonView, drawCurve } from './render/pixels';
import { Agent, greedyRollout, type AgentConfig } from './sim/agent';
import { dealDungeons, type Dungeon } from './sim/dungeon';
import { roundScore, shortestPath } from './sim/score';
import './lab.css';

const stage = mountLab('lab-rl');
const seed = dailySeed('12');
const reduced = prefersReducedMotion();
const today = new Date().toISOString().slice(0, 10);
const dungeons = dealDungeons(seed);
const frame = () => new Promise<number>((r) => requestAnimationFrame(r));

let round = 0;
let base: Dungeon = dungeons[0]!;
let crumbs: [number, number][] = [];
let cfg: AgentConfig = { algo: 'q', alpha: 0.5, gamma: 0.9, epsilon: 0.2, decay: true };
let agent = new Agent(base, cfg, rng(seed));
let returns: number[] = [];
let busy = false, placing = false, submitted = false, showValues = true, showPolicy = true;
let t = 0;
const results: number[] = [];

const view = new DungeonView(base);
const curve = el('canvas', { class: 'ar-curve', 'aria-hidden': 'true' });
const score = el('span', { class: 'scale-score mono', 'aria-live': 'polite' });
const chrome = el('div', { class: 'scale-chrome' }, el('span', { class: 'mono' }, 'lab/12 · rl-arena · tabular RL'), score);
const seedLine = el('p', { class: 'mono mag-seed' }, `> DAILY SEED ${today} · ${dungeons.map((d) => d.name).join(' · ')}`);
const prompt = el('p', { class: 'scale-prompt mono' });
const blurb = el('p', { class: 'ar-blurb mono' });
const controls = el('div', { class: 'ar-controls' });
const status = el('p', { class: 'ar-status mono', 'aria-live': 'polite' });
const trainBtn = el('button', { type: 'button', class: 'btn btn-signal ar-train' }, 'Train 50 episodes');
const runBtn = el('button', { type: 'button', class: 'btn ar-run' }, 'Watch greedy run');
const crumbBtn = el('button', { type: 'button', class: 'btn ar-crumb', 'aria-pressed': 'false' }, 'Place breadcrumbs (0/2)');
const resetBtn = el('button', { type: 'button', class: 'btn ar-reset' }, 'Reset agent');
const submitBtn = el('button', { type: 'button', class: 'btn btn-signal ar-submit' }, 'Submit run');
const nextBtn = el('button', { type: 'button', class: 'btn btn-signal ar-next', hidden: true }, 'Next dungeon →');
const reveal = el('div', { class: 'lab-reveal', hidden: true });
const end = el('section', { class: 'ar-end', hidden: true });
stage.root.append(chrome, seedLine, prompt, blurb,
  el('div', { class: 'lab-stage ar-stage' }, el('div', { class: 'ar-dungeon-wrap' }, view.canvas), el('div', { class: 'ar-curve-wrap' }, curve)),
  el('p', { class: 'ar-legend mono' }, 'gold glow = learnt value (torchlight) · cyan pips = greedy action · pink = last path · ▣ chest = treasure +10 · grey chest = decoy +1 · lava −100 · ↑ wind 30% · key opens the door'),
  controls, el('div', { class: 'lab-actions' }, trainBtn, runBtn, crumbBtn, resetBtn, submitBtn, nextBtn), status, reveal, end);

function draw(trail?: [number, number][], knight?: [number, number]): void {
  view.draw({ agent, showValues, showPolicy, trail, knight, t });
  drawCurve(curve, curve.parentElement!.clientWidth, returns);
}

function newAgent(): void {
  agent = new Agent(base.withCrumbs(crumbs), cfg, rng(seed + round * 31 + returns.length));
  returns = [];
}

function range(label: string, min: number, max: number, step: number, value: number, set: (v: number) => void): HTMLElement {
  const out = el('strong', {}, value.toFixed(2));
  const r = el('input', { type: 'range', min, max, step, value, 'aria-label': label, disabled: submitted });
  r.addEventListener('input', () => { const v = Number(r.value); out.textContent = v.toFixed(2); r.setAttribute('aria-valuetext', `${label} ${v.toFixed(2)}`); set(v); newAgent(); draw(); });
  return el('label', { class: 'ar-field' }, el('span', { class: 'mono' }, `${label} `, out), r);
}

function renderControls(): void {
  clear(controls);
  const algo = el('select', { 'aria-label': 'Algorithm', disabled: submitted }, el('option', { value: 'q', selected: cfg.algo === 'q' }, 'Q-learning (off-policy)'), el('option', { value: 'sarsa', selected: cfg.algo === 'sarsa' }, 'SARSA (on-policy)'));
  algo.addEventListener('change', () => { cfg = { ...cfg, algo: algo.value as AgentConfig['algo'] }; newAgent(); draw(); });
  const decay = el('input', { type: 'checkbox', checked: cfg.decay, disabled: submitted });
  decay.addEventListener('change', () => { cfg = { ...cfg, decay: decay.checked }; newAgent(); draw(); });
  const vals = el('input', { type: 'checkbox', checked: showValues });
  vals.addEventListener('change', () => { showValues = vals.checked; draw(); });
  const pol = el('input', { type: 'checkbox', checked: showPolicy });
  pol.addEventListener('change', () => { showPolicy = pol.checked; draw(); });
  controls.append(
    el('label', { class: 'ar-field' }, el('span', { class: 'mono' }, 'algorithm'), algo),
    range('learning rate α', 0.05, 1, 0.05, cfg.alpha, (v) => { cfg = { ...cfg, alpha: v }; }),
    range('discount γ', 0.5, 0.99, 0.01, cfg.gamma, (v) => { cfg = { ...cfg, gamma: v }; }),
    range('exploration ε', 0, 0.6, 0.02, cfg.epsilon, (v) => { cfg = { ...cfg, epsilon: v }; }),
    el('label', { class: 'ar-toggle' }, decay, ' decay ε each episode'),
    el('label', { class: 'ar-toggle' }, vals, ' torchlight (values)'),
    el('label', { class: 'ar-toggle' }, pol, ' policy arrows'));
}

function renderChrome(): void {
  clear(score);
  score.append('DUNGEON ', el('strong', {}, String(round + 1)), el('span', { class: 'scale-score-sep' }, '/'), '3',
    el('span', { class: 'scale-score-sep' }, ' · '), 'EPISODES ', el('strong', {}, String(agent.episodes)),
    el('span', { class: 'scale-score-sep' }, ' · '), 'SCORE ', el('strong', {}, String(results.reduce((a, b) => a + b, 0))), el('span', { class: 'scale-score-sep' }, '/'), '300');
}

function setPrompt(): void {
  prompt.textContent = `> DUNGEON [${round + 1}/3]: ${base.name}. Train the knight, then submit its greedy run. Treasure = 60 + efficiency; decoy = 25; lava = 0.`;
  blurb.textContent = base.blurb;
}

async function train(): Promise<void> {
  if (busy || submitted) return;
  busy = true;
  for (let i = 0; i < 50; i++) {
    const log = agent.episode();
    returns.push(log.ret);
    if (!reduced && i % 5 === 4) { t += 0.2; draw(log.path, log.path.at(-1)); await frame(); }
  }
  draw();
  renderChrome();
  const last = returns.slice(-50), avg = last.reduce((a, b) => a + b, 0) / last.length;
  status.textContent = `${agent.episodes} episodes · ε now ${agent.epsilon.toFixed(3)} · average return over the last 50: ${avg.toFixed(1)}`;
  busy = false;
}

async function watch(): Promise<ReturnType<typeof greedyRollout>> {
  const r = greedyRollout(base, agent, rng(seed + round + 99));
  if (!reduced) for (let i = 1; i <= r.path.length; i++) { t += 0.1; draw(r.path.slice(0, i), r.path[i - 1]); await new Promise((res) => setTimeout(res, 90)); }
  else draw(r.path, r.path.at(-1));
  status.textContent = `Greedy run: ${r.outcome === 'treasure' ? `treasure in ${r.path.length - 1} steps` : r.outcome === 'decoy' ? 'settled for the decoy chest' : r.outcome === 'lava' ? 'fell into the lava' : 'wandered without finding an exit'}.`;
  announce(status.textContent);
  return r;
}

async function submit(): Promise<void> {
  if (busy || submitted) return;
  busy = true;
  const r = await watch();
  const optimal = shortestPath(base);
  const pts = roundScore(r.outcome, r.path.length - 1, optimal);
  results.push(pts);
  submitted = true;
  reveal.className = `lab-reveal ${r.outcome === 'treasure' ? 'is-hit' : 'is-miss'}`;
  clear(reveal);
  const msg = `${r.outcome === 'treasure' ? `Treasure in ${r.path.length - 1} steps (shortest ${optimal})` : r.outcome === 'decoy' ? 'The knight took the decoy' : 'No treasure'} → ${pts}/100 after ${agent.episodes} episodes of ${cfg.algo === 'q' ? 'Q-learning' : 'SARSA'}.`;
  reveal.append(el('p', { class: 'mono' }, `> ${msg}`));
  reveal.hidden = false;
  announce(msg);
  renderControls(); renderChrome();
  [trainBtn, runBtn, crumbBtn, resetBtn, submitBtn].forEach((b) => (b.hidden = true));
  if (round === 2) finish(); else nextBtn.hidden = false;
  busy = false;
}

function next(): void {
  round++;
  base = dungeons[round]!;
  crumbs = []; submitted = false; placing = false;
  view.setDungeon(base);
  newAgent();
  reveal.hidden = true; nextBtn.hidden = true;
  [trainBtn, runBtn, crumbBtn, resetBtn, submitBtn].forEach((b) => (b.hidden = false));
  crumbBtn.textContent = 'Place breadcrumbs (0/2)';
  setPrompt(); renderControls(); renderChrome();
  view.resize(view.canvas.parentElement!.clientWidth); draw();
}

function finish(): void {
  const total = results.reduce((a, b) => a + b, 0);
  const best = load<number | null>('arcade-best', null);
  if (best === null || total > best) save('arcade-best', total);
  const share = `Null Overflow · RL Arena ${today}: ${total}/300 ${results.map((r) => (r >= 90 ? '👑' : r >= 60 ? '💰' : r > 0 ? '🪙' : '🔥')).join('')}`;
  const copy = el('button', { type: 'button', class: 'btn' }, 'Copy result');
  copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(share); copy.textContent = 'Copied ✓'; } catch { copy.textContent = 'Copy failed'; } });
  clear(end);
  end.append(el('p', { class: 'mono ar-end-kicker' }, 'GAME OVER'), el('h4', { class: 'ar-end-score' }, `${total} / 300`),
    el('p', { class: 'mono' }, best === null ? 'First high score on this cabinet.' : `High score on this cabinet: ${Math.max(best, total)}.`),
    el('div', { class: 'lab-actions' }, el('button', { type: 'button', class: 'btn btn-signal', onclick: () => location.reload() }, 'Play again'), copy));
  end.hidden = false;
  announce(`Game over: ${total} of 300.`);
}

view.canvas.addEventListener('click', (e) => {
  if (!placing || submitted) return;
  const r = view.canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - r.left) / view.tile), y = Math.floor((e.clientY - r.top) / view.tile);
  const k = base.cell(x, y).kind;
  if (k !== 'floor' && k !== 'wind') return;
  const i = crumbs.findIndex(([cx, cy]) => cx === x && cy === y);
  if (i >= 0) crumbs.splice(i, 1); else if (crumbs.length < 2) crumbs.push([x, y]);
  crumbBtn.textContent = `Place breadcrumbs (${crumbs.length}/2)`;
  newAgent(); view.setDungeon(base.withCrumbs(crumbs)); draw();
});
crumbBtn.addEventListener('click', () => { placing = !placing; crumbBtn.setAttribute('aria-pressed', String(placing)); status.textContent = placing ? 'Click floor tiles to drop up to two breadcrumbs (+5 once per episode). Click again to pick one up.' : ''; });
trainBtn.addEventListener('click', () => void train());
runBtn.addEventListener('click', () => { if (!busy) { busy = true; void watch().then(() => { busy = false; }); } });
resetBtn.addEventListener('click', () => { if (!busy && !submitted) { newAgent(); draw(); renderChrome(); status.textContent = 'Fresh agent: Q-table zeroed.'; } });
submitBtn.addEventListener('click', () => void submit());
nextBtn.addEventListener('click', next);

new ResizeObserver(() => { view.resize(view.canvas.parentElement!.clientWidth); draw(); }).observe(stage.root);
view.resize(view.canvas.parentElement!.clientWidth || 640);
setPrompt(); renderControls(); renderChrome(); draw();
stage.ready();
