// lab/03 Eval harness: phase 1 sets a ship threshold against a precision spec (live ROC/PR,
// confusion grid); phase 2 grades borderline outputs and measures κ against a second inspector.
import { announce, onKeys, prefersReducedMotion } from '../../core/a11y';
import { clear, el } from '../../core/dom';
import { dailySeed } from '../../core/seed';
import { mountLab } from '../../core/shell';
import { load, save } from '../../core/store';
import { Conveyor, Curves } from './render/conveyor';
import { RUBRIC } from './sim/bank';
import { auc, confusion, dealCase, f1, kappa, precision, prCurve, recall, rocPoints, shipScore, RUBRIC_ITEMS, type Confusion } from './sim/metrics';
import './lab.css';

const stage = mountLab('lab-eval');
const seed = dailySeed('03');
const reduced = prefersReducedMotion();
const today = new Date().toISOString().slice(0, 10);
const kase = dealCase(seed);
const rows = kase.items.map((s) => ({ score: s.score, label: s.item.label }));
const rocPts = rocPoints(rows), prPts = prCurve(rows), aucValue = auc(rows);

let threshold = 0.5;
let shipPoints: number | null = null;
let rubricIndex = 0;
const mine: boolean[] = [];

const score = el('span', { class: 'scale-score mono', 'aria-live': 'polite' });
const chrome = el('div', { class: 'scale-chrome' }, el('span', { class: 'mono' }, 'lab/03 · eval-harness · threshold + rubric'), score);
const seedLine = el('p', { class: 'mono mag-seed' }, `> DAILY SEED ${today} · ${kase.items.length} scored outputs · ${RUBRIC_ITEMS} borderline cases`);
const prompt = el('p', { class: 'scale-prompt mono' });
const main = el('div', { class: 'lab-stage eval-stage' });
const end = el('section', { class: 'bu-end', hidden: true });
stage.root.append(chrome, seedLine, prompt, main, end);

function renderChrome(): void {
  clear(score);
  score.append('PHASE ', el('strong', {}, shipPoints === null ? '1' : '2'), el('span', { class: 'scale-score-sep' }, '/'), '2',
    el('span', { class: 'scale-score-sep' }, ' · '), 'SCORE ', el('strong', {}, String((shipPoints ?? 0) + (mine.length === RUBRIC_ITEMS ? rubricPoints() : 0))), el('span', { class: 'scale-score-sep' }, '/'), '200');
}

// ---- Phase 1: threshold -----------------------------------------------------------
const conveyor = new Conveyor(kase.items, () => threshold, reduced);
const curves = new Curves();
const slider = el('input', { type: 'range', min: 0, max: 100, step: 1, value: 50, class: 'bu-slider', 'aria-label': 'Decision threshold: outputs scoring at or above it are shipped as PASS' });
const shipBtn = el('button', { type: 'button', class: 'btn btn-signal bu-ship' }, 'Ship at t = 0.50');
const cells = { tp: el('span', { class: 'eval-cell-n' }), fp: el('span', { class: 'eval-cell-n' }), fn: el('span', { class: 'eval-cell-n' }), tn: el('span', { class: 'eval-cell-n' }) };
const cell = (k: keyof Confusion, label: string, sub: string, agree: boolean) =>
  el('div', { role: 'cell', class: `eval-cell ${agree ? 'is-agree' : 'is-disagree'} is-lit` }, el('span', { class: 'eval-cell-label mono' }, label), cells[k], el('span', { class: 'eval-cell-sub mono' }, sub));
const dials = { p: el('dd', {}), r: el('dd', {}), f: el('dd', {}), a: el('dd', {}, aucValue.toFixed(2)) };
const shipResult = el('div', { class: 'lab-reveal', hidden: true });

function phaseOne(): void {
  prompt.textContent = `> SHIP SPEC: precision ≥ ${kase.spec.minPrecision}. Set the threshold that ships the most true PASSes (recall) without breaking the spec.`;
  const left = el('div', { class: 'eval-main' },
    el('div', { class: 'bu-conveyor-wrap' }, conveyor.canvas),
    el('label', { class: 'bu-field' }, el('span', { class: 'eval-k mono' }, 'decision threshold'), slider),
    el('div', { class: 'lab-actions' }, shipBtn),
    shipResult,
    el('p', { class: 'eval-note' }, 'Dots show the reference verdict (green PASS, red FAIL); card borders show where the threshold sends them.'));
  const side = el('div', { class: 'eval-side' },
    el('div', { class: 'eval-grid-axes mono', 'aria-hidden': 'true' }, el('span', {}), el('span', {}, 'ref PASS'), el('span', {}, 'ref FAIL')),
    el('div', { class: 'eval-grid-wrap' },
      el('div', { class: 'eval-grid-rows mono', 'aria-hidden': 'true' }, el('span', {}, 'ship'), el('span', {}, 'hold')),
      el('div', { class: 'eval-grid', role: 'table', 'aria-label': 'Confusion grid at the current threshold' },
        el('div', { role: 'row', class: 'bu-row' }, cell('tp', 'TP', 'ship · ref PASS', true), cell('fp', 'FP', 'ship · ref FAIL', false)),
        el('div', { role: 'row', class: 'bu-row' }, cell('fn', 'FN', 'hold · ref PASS', false), cell('tn', 'TN', 'hold · ref FAIL', true)))),
    el('dl', { class: 'eval-metrics' },
      el('div', {}, el('dt', {}, 'precision'), dials.p), el('div', {}, el('dt', {}, 'recall'), dials.r),
      el('div', {}, el('dt', {}, 'F1'), dials.f), el('div', {}, el('dt', {}, 'AUC'), dials.a)),
    el('div', { class: 'bu-curves-wrap' }, curves.canvas));
  clear(main);
  main.append(left, side);
  update();
}

function update(): void {
  const c = confusion(rows, threshold);
  cells.tp.textContent = String(c.tp); cells.fp.textContent = String(c.fp); cells.fn.textContent = String(c.fn); cells.tn.textContent = String(c.tn);
  const p = precision(c), r = recall(c);
  dials.p.textContent = p.toFixed(2); dials.r.textContent = r.toFixed(2); dials.f.textContent = f1(c).toFixed(2);
  dials.p.parentElement!.classList.toggle('is-under', p < kase.spec.minPrecision);
  shipBtn.textContent = `Ship at t = ${threshold.toFixed(2)}`;
  slider.setAttribute('aria-valuetext', `threshold ${threshold.toFixed(2)}: precision ${p.toFixed(2)}, recall ${r.toFixed(2)}`);
  const N = rows.filter((x) => !x.label).length, P = rows.length - N;
  curves.draw(rocPts, prPts, { fpr: N ? c.fp / N : 0, tpr: P ? c.tp / P : 0, recall: r, precision: p }, aucValue, kase.spec.minPrecision);
  conveyor.draw();
}

slider.addEventListener('input', () => { if (shipPoints === null) { threshold = Number(slider.value) / 100; update(); } });

function bestPossible(): number {
  return Math.max(...[...new Set(rows.map((r) => r.score)), 1.01].map((t) => shipScore(confusion(rows, t), kase.spec)));
}

shipBtn.addEventListener('click', () => {
  if (shipPoints !== null) return;
  const c = confusion(rows, threshold);
  shipPoints = shipScore(c, kase.spec);
  slider.disabled = true;
  shipBtn.hidden = true;
  const best = bestPossible();
  const ok = shipPoints > 0;
  shipResult.className = `lab-reveal ${ok ? 'is-hit' : 'is-miss'}`;
  const msg = ok
    ? `Shipped. Precision ${precision(c).toFixed(2)} meets the ${kase.spec.minPrecision} spec; recall ${recall(c).toFixed(2)} → ${shipPoints}/100. The best threshold today reaches ${best}.`
    : `Spec broken: precision ${precision(c).toFixed(2)} is under ${kase.spec.minPrecision}. Nothing ships → 0/100. The best threshold today reaches ${best}.`;
  clear(shipResult);
  shipResult.append(el('p', { class: 'mono' }, `> ${msg}`), el('div', { class: 'lab-actions' }, el('button', { type: 'button', class: 'btn btn-signal bu-to-rubric', onclick: phaseTwo }, 'Open the borderline cases →')));
  shipResult.hidden = false;
  announce(msg);
  renderChrome();
});

// ---- Phase 2: rubric ----------------------------------------------------------------
const rubricPoints = () => Math.max(0, Math.round(kappa(mine, kase.rubric.map((i) => i.inspector ?? i.label)) * 100));

function phaseTwo(): void {
  conveyor.dispose();
  rubricIndex = 0;
  renderRubric();
}

function renderRubric(): void {
  const item = kase.rubric[rubricIndex]!;
  prompt.textContent = `> CASE [${rubricIndex + 1}/${RUBRIC_ITEMS}]: borderline. Grade it against the rubric; a second inspector grades it too.`;
  const passBtn = el('button', { type: 'button', class: 'btn lab-btn-amber' }, 'PASS');
  const failBtn = el('button', { type: 'button', class: 'btn lab-btn-amber' }, 'FAIL');
  const reveal = el('div', { class: 'lab-reveal', hidden: true });
  const grade = (v: boolean) => {
    if (mine.length > rubricIndex) return;
    mine.push(v);
    passBtn.disabled = failBtn.disabled = true;
    const other = item.inspector ?? item.label;
    reveal.className = `lab-reveal ${v === item.label ? 'is-hit' : 'is-miss'}`;
    const last = rubricIndex === RUBRIC_ITEMS - 1;
    clear(reveal);
    reveal.append(
      el('p', { class: 'mono' }, `> you ${v ? 'PASS' : 'FAIL'} · reference ${item.label ? 'PASS' : 'FAIL'} · second inspector ${other ? 'PASS' : 'FAIL'}`),
      el('p', { class: 'lab-reveal-why' }, item.why),
      el('div', { class: 'lab-actions' }, el('button', { type: 'button', class: 'btn btn-signal bu-next', onclick: () => { if (last) finish(); else { rubricIndex++; renderRubric(); } } }, last ? 'Close the case file →' : 'Next case →')));
    reveal.hidden = false;
    announce(`Reference ${item.label ? 'PASS' : 'FAIL'}. ${item.why}`);
    renderChrome();
  };
  passBtn.addEventListener('click', () => grade(true));
  failBtn.addEventListener('click', () => grade(false));
  clear(main);
  main.append(
    el('div', { class: 'eval-main' },
      el('details', { class: 'eval-rubric', open: true }, el('summary', { class: 'mono' }, 'rubric'), el('ol', {}, ...RUBRIC.map((r) => el('li', {}, r)))),
      el('div', { class: 'eval-item' },
        el('div', { class: 'eval-field' }, el('span', { class: 'eval-k mono' }, 'task'), el('p', {}, item.task)),
        el('div', { class: 'eval-field' }, el('span', { class: 'eval-k mono' }, 'input'), el('p', { class: 'eval-context' }, item.input)),
        el('div', { class: 'eval-field' }, el('span', { class: 'eval-k mono' }, 'model output'), el('p', { class: 'eval-output' }, item.output)),
        el('div', { class: 'lab-actions' }, passBtn, failBtn),
        reveal)),
    el('div', { class: 'eval-side' },
      el('p', { class: 'eval-note' }, `Your verdicts so far: ${mine.map((v) => (v ? 'P' : 'F')).join(' ') || 'none'}`),
      el('p', { class: 'eval-note' }, 'Agreement is measured with Cohen’s κ: 1 is perfect agreement, 0 is what chance alone would give.')));
}

function finish(): void {
  const k = kappa(mine, kase.rubric.map((i) => i.inspector ?? i.label));
  const agreeRef = mine.filter((v, i) => v === kase.rubric[i]!.label).length;
  const total = (shipPoints ?? 0) + rubricPoints();
  const best = load<number | null>('bureau-best', null);
  if (best === null || total > best) save('bureau-best', total);
  const share = `Null Overflow · Eval harness ${today}: ${total}/200 · ship ${shipPoints}/100 · κ ${k.toFixed(2)}`;
  const copy = el('button', { type: 'button', class: 'btn' }, 'Copy result');
  copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(share); copy.textContent = 'Copied ✓'; } catch { copy.textContent = 'Copy failed'; } });
  clear(main);
  clear(end);
  prompt.textContent = '> CASE CLOSED.';
  end.append(
    el('p', { class: 'mono bu-end-kicker' }, 'Inspection report'),
    el('h4', { class: 'bu-end-score' }, `${total} / 200`),
    el('p', {}, `Ship decision: ${shipPoints}/100. Rubric: κ = ${k.toFixed(2)} with the second inspector (${agreeRef}/${RUBRIC_ITEMS} match the reference) → ${rubricPoints()}/100.`),
    el('p', {}, best === null ? 'First report filed on this device.' : `Best on this device: ${Math.max(best, total)}.`),
    el('div', { class: 'lab-actions' }, el('button', { type: 'button', class: 'btn btn-signal', onclick: () => location.reload() }, 'Reopen today’s case'), copy));
  end.hidden = false;
  renderChrome();
  announce(`Case closed: ${total} of 200.`);
}

onKeys({ p: () => main.querySelectorAll<HTMLButtonElement>('.lab-btn-amber')[0]?.click(), f: () => main.querySelectorAll<HTMLButtonElement>('.lab-btn-amber')[1]?.click() });

new ResizeObserver(() => {
  const wrap = main.querySelector('.bu-conveyor-wrap'), cw = main.querySelector('.bu-curves-wrap');
  if (wrap) conveyor.resize(wrap.clientWidth);
  if (cw) curves.resize(cw.clientWidth);
  if (shipPoints === null && wrap) update();
}).observe(main);
stage.ready();
phaseOne();
renderChrome();
