// lab/07 Overfit or Not: pick a model family and its settings, buy data, run CV, see the
// bias–variance fan, try double descent, and lock the fit with the best held-out error.
import { announce, onKeys, prefersReducedMotion } from '../../core/a11y';
import { clear, el } from '../../core/dom';
import { dailySeed, rng, shuffle } from '../../core/seed';
import { mountLab } from '../../core/shell';
import { load, save } from '../../core/store';
import { Cloth, Ledger } from './render/plots';
import { bootstrapFan, cvError, fit, kfold, makeData, mse, predict, SHAPES, type ModelSpec, type Shape } from './sim/models';
import { BASE_N, MAX_N, bestTestError, lockScore } from './sim/round';
import './lab.css';

const stage = mountLab('lab-overfit');
const seed = dailySeed('07');
const reduced = prefersReducedMotion();
const today = new Date().toISOString().slice(0, 10);
const ROUNDS = 3;
const shapes = shuffle(Object.keys(SHAPES) as Shape[], rng(seed)).slice(0, ROUNDS);
const GRID = Array.from({ length: 161 }, (_, i) => -1 + i / 80);
const frame = () => new Promise<number>((r) => requestAnimationFrame(r));

let round = 0;
let n = BASE_N;
let family: ModelSpec['family'] = 'poly';
let degree = 3, lambda = 0, k = 5, depth = 3;
let fan = false, doubleDescent = false, locked = false, busy = false;
let heldOut: Set<number> | undefined;
let total = 0;
const results: number[] = [];

const dataFor = (r: number, count: number) => makeData(rng(seed + r * 101), shapes[r]!, count, 0.15);
let data = dataFor(0, MAX_N);
const trainOf = () => ({ x: data.train.x.slice(0, n), y: data.train.y.slice(0, n) });
const spec = (): ModelSpec => (family === 'poly' ? { family, degree, lambda: doubleDescent ? 0 : lambda } : family === 'knn' ? { family, k } : { family, depth });
const specLabel = (s: ModelSpec) => (s.family === 'poly' ? `degree ${s.degree}${s.lambda ? ` · λ ${s.lambda.toExponential(0)}` : ''}` : s.family === 'knn' ? `kNN · k ${s.k}` : `tree · depth ${s.depth}`);

// ---- DOM ---------------------------------------------------------------------------------
const score = el('span', { class: 'scale-score mono', 'aria-live': 'polite' });
const chrome = el('div', { class: 'scale-chrome' }, el('span', { class: 'mono' }, 'lab/07 · overfit-or-not · bias vs variance'), score);
const seedLine = el('p', { class: 'mono mag-seed' }, `> DAILY SEED ${today} · ${ROUNDS} fittings · noise σ = 0.15 · ${BASE_N} free samples, +1 point per extra`);
const prompt = el('p', { class: 'scale-prompt mono' });
const cloth = new Cloth(), ledger = new Ledger();
const families = el('div', { class: 'at-families', role: 'radiogroup', 'aria-label': 'Model family' });
const dials = el('div', { class: 'overfit-controls at-dials' });
const toggles = el('div', { class: 'at-toggles' });
const cvOut = el('p', { class: 'at-cv mono', 'aria-live': 'polite' });
const errors = el('p', { class: 'at-errors mono' });
const lockBtn = el('button', { type: 'button', class: 'btn btn-signal at-lock' }, 'Lock this fit');
const cvBtn = el('button', { type: 'button', class: 'btn at-cvbtn' }, 'Run 5-fold CV');
const nextBtn = el('button', { type: 'button', class: 'btn at-next', hidden: true }, 'Next fitting →');
const reveal = el('div', { class: 'lab-reveal', hidden: true });
const end = el('section', { class: 'at-end', hidden: true });
stage.root.append(chrome, seedLine, prompt,
  el('div', { class: 'lab-stage overfit-stage' },
    el('div', { class: 'at-cloth-wrap' }, cloth.canvas),
    el('p', { class: 'overfit-legend mono' }, el('span', { class: 'lg-train', 'aria-hidden': 'true' }), ' training pins ', el('span', { class: 'lg-val', 'aria-hidden': 'true' }), ' validation ', el('span', { class: 'lg-fit', 'aria-hidden': 'true' }), ' your fit ', el('span', { class: 'lg-true', 'aria-hidden': 'true' }), ' true curve (after lock)'),
    families, dials, toggles,
    el('div', { class: 'lab-actions' }, cvBtn, lockBtn, nextBtn), cvOut, errors,
    el('div', { class: 'scope' }, el('div', { class: 'scope-head mono' }, el('span', {}, 'CH1 ', el('strong', { class: 'scope-g' }, 'train'), ' vs CH2 ', el('strong', { class: 'scope-a' }, 'validation'))), ledger.canvas)),
  reveal, end);

function slider(label: string, min: number, max: number, step: number, value: number, onInput: (v: number) => void, fmt = (v: number) => String(v)): HTMLElement {
  const out = el('strong', {}, fmt(value));
  const input = el('input', { type: 'range', min, max, step, value, 'aria-label': label, disabled: locked });
  input.addEventListener('input', () => { const v = Number(input.value); out.textContent = fmt(v); input.setAttribute('aria-valuetext', `${label} ${fmt(v)}`); onInput(v); });
  return el('label', { class: 'at-slider' }, el('span', { class: 'mono' }, `${label} `, out), input);
}

function renderControls(): void {
  clear(families);
  for (const [f, name] of [['poly', 'Polynomial'], ['knn', 'k-nearest'], ['tree', 'Tree']] as const) {
    families.append(el('button', { type: 'button', role: 'radio', 'aria-checked': String(family === f), class: 'at-family', disabled: locked, onclick: () => { family = f; if (f !== 'poly') doubleDescent = false; renderControls(); update(); } }, name));
  }
  clear(dials);
  if (family === 'poly') {
    dials.append(slider('degree', 1, doubleDescent ? 40 : 15, 1, Math.min(degree, doubleDescent ? 40 : 15), (v) => { degree = v; update(); }));
    if (!doubleDescent) dials.append(slider('ridge λ', -5, 1, 0.5, lambda ? Math.log10(lambda) : -5, (v) => { lambda = v <= -5 ? 0 : 10 ** v; update(); }, (v) => (v <= -5 ? '0' : `1e${v}`)));
  } else if (family === 'knn') dials.append(slider('neighbours k', 1, 20, 1, k, (v) => { k = v; update(); }));
  else dials.append(slider('tree depth', 1, 6, 1, depth, (v) => { depth = v; update(); }));
  dials.append(slider('training samples', BASE_N, MAX_N, 1, n, (v) => { n = v; update(); }, (v) => `${v}${v > BASE_N ? ` (−${v - BASE_N} pts)` : ''}`));
  clear(toggles);
  const tog = (label: string, on: boolean, fn: (v: boolean) => void, disabled = false) => {
    const box = el('input', { type: 'checkbox', checked: on, disabled: disabled || locked });
    box.addEventListener('change', () => fn(box.checked));
    return el('label', { class: 'at-toggle' }, box, ` ${label}`);
  };
  toggles.append(
    tog('Show the bootstrap fan (variance)', fan, (v) => { fan = v; update(); }),
    tog('Double-descent mode (degree to 40, λ = 0)', doubleDescent, (v) => { doubleDescent = v; if (!v && degree > 15) degree = 15; renderControls(); update(); }, family !== 'poly'));
}

function sweep() {
  const tr = trainOf();
  if (family === 'poly') {
    const xs = Array.from({ length: doubleDescent ? 40 : 15 }, (_, i) => i + 1);
    const ms = xs.map((d) => fit(tr, { family: 'poly', degree: d, lambda: doubleDescent ? 0 : lambda }));
    return { xs, train: ms.map((m) => mse(m, tr)), val: ms.map((m) => mse(m, data.val)), current: degree, label: 'polynomial degree', marker: doubleDescent ? { x: Math.min(40, n - 1), text: 'p = n (interpolation)' } : undefined };
  }
  if (family === 'knn') {
    const xs = Array.from({ length: 20 }, (_, i) => i + 1);
    const ms = xs.map((kk) => fit(tr, { family: 'knn', k: kk }));
    return { xs, train: ms.map((m) => mse(m, tr)), val: ms.map((m) => mse(m, data.val)), current: k, label: 'k (fewer = wigglier)' };
  }
  const xs = [1, 2, 3, 4, 5, 6];
  const ms = xs.map((dd) => fit(tr, { family: 'tree', depth: dd }));
  return { xs, train: ms.map((m) => mse(m, tr)), val: ms.map((m) => mse(m, data.val)), current: depth, label: 'tree depth' };
}

function update(showTruth = false): void {
  const tr = trainOf(), s = spec(), m = fit(tr, s);
  cloth.draw({ train: tr, val: data.val, grid: GRID, fitY: predict(m, GRID), fan: fan ? bootstrapFan(tr, s, rng(seed + round), 20, GRID) : undefined, truth: showTruth ? data.f : undefined, heldOut, label: specLabel(s) });
  ledger.draw(sweep());
  errors.textContent = `train MSE ${mse(m, tr).toFixed(4)} · validation MSE ${mse(m, data.val).toFixed(4)}`;
  renderChrome();
}

function renderChrome(): void {
  clear(score);
  score.append('FITTING ', el('strong', {}, String(round + 1)), el('span', { class: 'scale-score-sep' }, '/'), String(ROUNDS),
    el('span', { class: 'scale-score-sep' }, ' · '), 'SCORE ', el('strong', {}, String(total)), el('span', { class: 'scale-score-sep' }, '/'), String(ROUNDS * 100));
}

async function runCV(): Promise<void> {
  if (busy || locked) return;
  busy = true;
  const tr = trainOf();
  const folds = kfold(tr.x.length, 5, rng(seed + round + 7));
  for (const [i, f] of folds.entries()) {
    heldOut = new Set(f);
    cvOut.textContent = `Fold ${i + 1}/5: fitting on ${tr.x.length - f.length} pins, testing on the ${f.length} yellow ones…`;
    update();
    if (!reduced) { const t0 = performance.now(); while (performance.now() - t0 < 420) await frame(); }
  }
  heldOut = undefined;
  const cv = cvError(tr, spec(), rng(seed + round + 7));
  cvOut.textContent = `5-fold CV error for ${specLabel(spec())}: ${cv.toFixed(4)} (lower is better; it uses only your training pins).`;
  announce(cvOut.textContent);
  update();
  busy = false;
}

function lock(): void {
  if (busy || locked) return;
  locked = true;
  const m = fit(trainOf(), spec());
  const yours = mse(m, data.test);
  const best = bestTestError({ ...data, train: trainOf() });
  const pts = lockScore(yours, best.error, n);
  results.push(pts);
  total += pts;
  const good = pts >= 70;
  reveal.className = `lab-reveal ${good ? 'is-hit' : 'is-miss'}`;
  clear(reveal);
  const msg = `Test error on 300 unseen points: ${yours.toFixed(4)}. Best model in the grid (${specLabel(best.spec)}): ${best.error.toFixed(4)}. ${n > BASE_N ? `Extra fabric −${n - BASE_N}. ` : ''}Score ${pts}/100.`;
  reveal.append(el('p', { class: 'mono' }, `> ${msg}`), el('p', { class: 'lab-reveal-why' }, `The hidden curve was a ${SHAPES[shapes[round]!].name}; it's now chalked on the cloth.`));
  reveal.hidden = false;
  lockBtn.hidden = true; cvBtn.disabled = true;
  renderControls();
  update(true);
  announce(msg);
  if (round === ROUNDS - 1) finish(); else nextBtn.hidden = false;
}

function next(): void {
  round++;
  data = dataFor(round, MAX_N);
  n = BASE_N; locked = false; heldOut = undefined;
  reveal.hidden = true; nextBtn.hidden = true; lockBtn.hidden = false; cvBtn.disabled = false; cvOut.textContent = '';
  setPrompt();
  renderControls();
  update();
}

function setPrompt(): void {
  prompt.textContent = `> FITTING [${round + 1}/${ROUNDS}]: a hidden curve under noise. Choose a family and its settings, check validation or CV error, then lock the fit that will generalise.`;
}

function finish(): void {
  const best = load<number | null>('atelier-best', null);
  if (best === null || total > best) save('atelier-best', total);
  const share = `Null Overflow · Overfit or Not ${today}: ${total}/${ROUNDS * 100} ${results.map((r) => (r >= 90 ? '✂️' : r >= 70 ? '🧵' : '📏')).join('')}`;
  const copy = el('button', { type: 'button', class: 'btn' }, 'Copy result');
  copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(share); copy.textContent = 'Copied ✓'; } catch { copy.textContent = 'Copy failed'; } });
  clear(end);
  end.append(el('p', { class: 'mono at-end-kicker' }, 'Final fitting'), el('h4', { class: 'at-end-score' }, `${total} / ${ROUNDS * 100}`),
    el('p', {}, best === null ? 'First suit on this device.' : `Best on this device: ${Math.max(best, total)}.`),
    el('div', { class: 'lab-actions' }, el('button', { type: 'button', class: 'btn btn-signal', onclick: () => location.reload() }, 'Refit today’s cloth'), copy));
  end.hidden = false;
  announce(`All fittings done: ${total} of ${ROUNDS * 100}.`);
}

cvBtn.addEventListener('click', () => void runCV());
lockBtn.addEventListener('click', lock);
nextBtn.addEventListener('click', next);
onKeys({ Enter: () => (nextBtn.hidden ? lock() : next()) });

new ResizeObserver(() => { cloth.resize(cloth.canvas.parentElement!.clientWidth); ledger.resize(ledger.canvas.parentElement!.clientWidth - 24); update(locked); }).observe(cloth.canvas.parentElement!);
cloth.resize(cloth.canvas.parentElement!.clientWidth || 700);
ledger.resize(700);
setPrompt();
renderControls();
update();
stage.ready();
