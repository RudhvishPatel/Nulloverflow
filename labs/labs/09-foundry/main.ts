// lab/09 Neuron Foundry: design a small network, train it live, and reach 95 % test accuracy
// with as few parameters as possible on three daily datasets.
import { announce, prefersReducedMotion } from '../../core/a11y';
import { clear, el } from '../../core/dom';
import { dailySeed, rng, shuffle } from '../../core/seed';
import { mountLab } from '../../core/shell';
import { load, save } from '../../core/store';
import { Boundary, Diagram, Trace } from './render/views';
import { DATASETS, accuracy, makeDataset, type DatasetId } from './sim/data';
import { Net, type Activation } from './sim/net';
import './lab.css';

const stage = mountLab('lab-foundry');
const seed = dailySeed('09');
const reduced = prefersReducedMotion();
const today = new Date().toISOString().slice(0, 10);
const easy: DatasetId[] = ['gaussians', 'circles', 'xor', 'moons'], hard: DatasetId[] = ['spiral', 'checker'];
const r0 = rng(seed);
const days: DatasetId[] = [...shuffle(easy, r0).slice(0, 2), shuffle(hard, r0)[0]!];

let round = 0;
let hidden = 1, width = 4, activation: Activation = 'tanh', lr = 0.03, batch = 32, l2 = 0;
let running = false, steps = 0, submitted = false;
let net: Net;
let data = makeDataset(days[0]!, rng(seed + 1), 200, 0.04);
let lossTrace: number[] = [], accTrace: number[] = [];
const results: number[] = [];

const boundary = new Boundary(), diagram = new Diagram(), trace = new Trace();
const score = el('span', { class: 'scale-score mono', 'aria-live': 'polite' });
const chrome = el('div', { class: 'scale-chrome' }, el('span', { class: 'mono' }, 'lab/09 · neuron-foundry · live training'), score);
const seedLine = el('p', { class: 'mono mag-seed' }, `> DAILY SEED ${today} · ${days.map((d) => DATASETS[d].name).join(' · ')} · backprop in your browser`);
const prompt = el('p', { class: 'scale-prompt mono' });
const controls = el('div', { class: 'fd-controls' });
const stats = el('dl', { class: 'fd-stats mono', 'aria-live': 'off' });
const playBtn = el('button', { type: 'button', class: 'btn btn-signal fd-play' }, 'Train ▶');
const resetBtn = el('button', { type: 'button', class: 'btn fd-reset' }, 'Re-seed weights');
const submitBtn = el('button', { type: 'button', class: 'btn fd-submit' }, 'Submit this net');
const nextBtn = el('button', { type: 'button', class: 'btn btn-signal fd-next', hidden: true }, 'Next dataset →');
const reveal = el('div', { class: 'lab-reveal', hidden: true });
const end = el('section', { class: 'fd-end', hidden: true });
stage.root.append(chrome, seedLine, prompt,
  el('div', { class: 'lab-stage fd-stage' },
    el('div', { class: 'fd-left' }, el('div', { class: 'fd-boundary-wrap' }, boundary.canvas), el('p', { class: 'fd-legend mono' }, '● training · ○ test · cyan = class 1 · magenta = class 0')),
    el('div', { class: 'fd-right' }, el('div', { class: 'fd-diagram-wrap' }, diagram.canvas), el('div', { class: 'fd-trace-wrap' }, trace.canvas), stats)),
  controls, el('div', { class: 'lab-actions' }, playBtn, resetBtn, submitBtn, nextBtn), reveal, end);

function newNet(): void {
  net = new Net([2, ...Array<number>(hidden).fill(width), 1], activation, rng(seed + round * 13 + steps));
  steps = 0; lossTrace = []; accTrace = [];
}

function select(label: string, value: string, options: [string, string][], onChange: (v: string) => void): HTMLElement {
  const s = el('select', { 'aria-label': label, disabled: submitted }, ...options.map(([v, t]) => el('option', { value: v, selected: v === value }, t)));
  s.addEventListener('change', () => onChange(s.value));
  return el('label', { class: 'fd-field' }, el('span', { class: 'mono' }, label), s);
}
function range(label: string, min: number, max: number, step: number, value: number, onInput: (v: number) => void, show: (v: number) => string): HTMLElement {
  const out = el('strong', {}, show(value));
  const r = el('input', { type: 'range', min, max, step, value, 'aria-label': label, disabled: submitted });
  r.addEventListener('input', () => { const v = Number(r.value); out.textContent = show(v); r.setAttribute('aria-valuetext', `${label} ${show(v)}`); onInput(v); });
  return el('label', { class: 'fd-field' }, el('span', { class: 'mono' }, `${label} `, out), r);
}

function renderControls(): void {
  clear(controls);
  const rebuild = () => { newNet(); renderControls(); frameOnce(); };
  controls.append(
    range('hidden layers', 0, 3, 1, hidden, (v) => { hidden = v; rebuild(); }, String),
    range('neurons per layer', 1, 8, 1, width, (v) => { width = v; rebuild(); }, String),
    select('activation', activation, [['tanh', 'tanh'], ['relu', 'ReLU'], ['gelu', 'GELU']], (v) => { activation = v as Activation; rebuild(); }),
    range('learning rate', -3, -0.5, 0.1, Math.log10(lr), (v) => { lr = 10 ** v; }, (v) => (10 ** v).toPrecision(2)),
    select('batch size', String(batch), [['8', '8'], ['32', '32'], ['128', '128']], (v) => { batch = Number(v); }),
    range('L2 weight decay', -5, -1, 0.5, l2 ? Math.log10(l2) : -5, (v) => { l2 = v <= -5 ? 0 : 10 ** v; }, (v) => (v <= -5 ? '0' : `1e${v}`)),
  );
}

function renderChrome(): void {
  clear(score);
  score.append('DATASET ', el('strong', {}, String(round + 1)), el('span', { class: 'scale-score-sep' }, '/'), '3',
    el('span', { class: 'scale-score-sep' }, ' · '), 'SCORE ', el('strong', {}, String(results.reduce((a, b) => a + b, 0))), el('span', { class: 'scale-score-sep' }, '/'), '300');
}

function renderStats(): void {
  const tr = accuracy(net, data.train), te = accuracy(net, data.test);
  clear(stats);
  const row = (k: string, v: string) => [el('div', {}, el('dt', {}, k), el('dd', {}, v))];
  stats.append(...row('steps', String(steps)), ...row('loss', (lossTrace.at(-1) ?? NaN).toFixed(3)), ...row('train acc', `${(tr * 100).toFixed(1)}%`),
    ...row('test acc', `${(te * 100).toFixed(1)}%`), ...row('params', `${net.params} (par ${DATASETS[days[round]!].par})`));
  submitBtn.classList.toggle('is-ready', te >= 0.95);
}

let t = 0;
function frameOnce(): void {
  boundary.draw(net, data.train, data.test, t);
  diagram.draw(net, t);
  trace.draw(lossTrace, accTrace);
  renderStats();
  boundary.canvas.setAttribute('aria-label', `Decision boundary on ${DATASETS[days[round]!].name}. Test accuracy ${(accuracy(net, data.test) * 100).toFixed(0)}%.`);
}

let raf = 0;
function loop(): void {
  if (!running) return;
  const r = rng(seed + steps);
  let loss = 0;
  for (let k = 0; k < 6; k++) { loss = net.trainStep(data.train.x, data.train.y, { lr, l2, batch, rand: r }); steps++; }
  if (!Number.isFinite(loss)) { running = false; playBtn.textContent = 'Train ▶'; prompt.textContent = '> The loss exploded (NaN). Lower the learning rate and re-seed.'; announce(prompt.textContent); return; }
  if (steps % 30 === 0) { lossTrace.push(loss); accTrace.push(accuracy(net, data.test)); if (lossTrace.length > 200) { lossTrace.shift(); accTrace.shift(); } }
  t += 1 / 60;
  if (steps % 18 === 0 || reduced) frameOnce();
  raf = requestAnimationFrame(loop);
}

function toggle(): void {
  if (submitted) return;
  running = !running;
  playBtn.textContent = running ? 'Pause ❚❚' : 'Train ▶';
  if (running) raf = requestAnimationFrame(loop); else { cancelAnimationFrame(raf); frameOnce(); }
}

function setPrompt(): void {
  const d = DATASETS[days[round]!];
  prompt.textContent = `> DATASET [${round + 1}/3]: ${d.name}. Reach 95% test accuracy with as few parameters as you can (par ${d.par}). Train, watch the currents settle, then submit.`;
}

function submit(): void {
  if (submitted) return;
  running = false; cancelAnimationFrame(raf); playBtn.textContent = 'Train ▶';
  submitted = true;
  const te = accuracy(net, data.test), par = DATASETS[days[round]!].par;
  const pts = te >= 0.95 ? Math.round(100 * Math.min(1, par / net.params)) : Math.round(te * 60);
  results.push(pts);
  reveal.className = `lab-reveal ${te >= 0.95 ? 'is-hit' : 'is-miss'}`;
  clear(reveal);
  const msg = te >= 0.95
    ? `Test accuracy ${(te * 100).toFixed(1)}% with ${net.params} parameters (par ${par}) → ${pts}/100.`
    : `Test accuracy ${(te * 100).toFixed(1)}% is under 95% → ${pts}/100. More capacity, more steps or a different activation would help.`;
  reveal.append(el('p', { class: 'mono' }, `> ${msg}`));
  reveal.hidden = false;
  announce(msg);
  renderControls();
  renderChrome();
  submitBtn.hidden = true; playBtn.hidden = true; resetBtn.hidden = true;
  if (round === 2) finish(); else nextBtn.hidden = false;
}

function next(): void {
  round++;
  submitted = false;
  data = makeDataset(days[round]!, rng(seed + round + 1), 200, 0.04);
  newNet();
  reveal.hidden = true; nextBtn.hidden = true; submitBtn.hidden = false; playBtn.hidden = false; resetBtn.hidden = false;
  setPrompt(); renderControls(); renderChrome(); frameOnce();
}

function finish(): void {
  const total = results.reduce((a, b) => a + b, 0);
  const best = load<number | null>('foundry-best', null);
  if (best === null || total > best) save('foundry-best', total);
  const share = `Null Overflow · Neuron Foundry ${today}: ${total}/300 · ${days.map((d, i) => `${DATASETS[d].name} ${results[i]}`).join(' · ')}`;
  const copy = el('button', { type: 'button', class: 'btn' }, 'Copy result');
  copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(share); copy.textContent = 'Copied ✓'; } catch { copy.textContent = 'Copy failed'; } });
  clear(end);
  end.append(el('p', { class: 'mono fd-end-kicker' }, 'Surfacing'), el('h4', { class: 'fd-end-score' }, `${total} / 300`),
    el('p', {}, best === null ? 'First dive logged on this device.' : `Best on this device: ${Math.max(best, total)}.`),
    el('div', { class: 'lab-actions' }, el('button', { type: 'button', class: 'btn btn-signal', onclick: () => location.reload() }, 'Dive again'), copy));
  end.hidden = false;
  announce(`Surfacing: ${total} of 300.`);
}

playBtn.addEventListener('click', toggle);
resetBtn.addEventListener('click', () => { if (!submitted) { steps += 7; newNet(); frameOnce(); } });
submitBtn.addEventListener('click', submit);
nextBtn.addEventListener('click', next);

const resize = () => {
  boundary.resize(boundary.canvas.parentElement!.clientWidth);
  diagram.resize(diagram.canvas.parentElement!.clientWidth);
  trace.resize(trace.canvas.parentElement!.clientWidth);
  frameOnce();
};
newNet();
new ResizeObserver(resize).observe(stage.root);
setPrompt();
renderControls();
renderChrome();
resize();
stage.ready();
