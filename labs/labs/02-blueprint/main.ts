// lab/02 Magnitude Run: 90 % confidence intervals on a log ruler, scored with the interval
// score, ending in a calibration verdict.
import { announce, onKeys, prefersReducedMotion } from '../../core/a11y';
import { clear, el } from '../../core/dom';
import { dailySeed } from '../../core/seed';
import { mountLab } from '../../core/shell';
import { load, save } from '../../core/store';
import { Ruler } from './render/ruler';
import { QUESTIONS, Run, valueLabel } from './sim/run';
import './lab.css';

const stage = mountLab('magnitude-run');
const seed = dailySeed('02');
const reduced = prefersReducedMotion();
const today = new Date().toISOString().slice(0, 10);

let run = new Run(seed);
let busy = false;

const score = el('span', { class: 'scale-score mono', 'aria-live': 'polite' });
const chrome = el('div', { class: 'scale-chrome' }, el('span', { class: 'mono' }, 'lab/02 · magnitude-run · calibration'), score);
const seedLine = el('p', { class: 'mono mag-seed' }, `> DAILY SEED ${today} · ${QUESTIONS} estimates · 90% intervals`);
const prompt = el('p', { class: 'scale-prompt mono' });
const ruler = new Ruler();
const rulerWrap = el('div', { class: 'lab-stage bp-stage' }, ruler.canvas);
const lowIn = el('input', { type: 'range', class: 'bp-slider', 'aria-label': 'Low end of your 90% interval' });
const highIn = el('input', { type: 'range', class: 'bp-slider', 'aria-label': 'High end of your 90% interval' });
const estimate = el('p', { class: 'mono mag-estimate', 'aria-live': 'polite' });
const lockBtn = el('button', { type: 'button', class: 'btn btn-signal mag-lock' }, 'Lock in');
const nextBtn = el('button', { type: 'button', class: 'btn bp-next', hidden: true }, 'Next estimate →');
const controls = el('div', { class: 'bp-controls' },
  el('label', { class: 'bp-field' }, el('span', { class: 'mono' }, 'LOW'), lowIn),
  el('label', { class: 'bp-field' }, el('span', { class: 'mono' }, 'HIGH'), highIn),
  estimate, el('div', { class: 'mag-actions lab-actions' }, lockBtn, nextBtn));
const reveal = el('div', { class: 'mag-reveal', hidden: true });
const end = el('section', { class: 'bp-end', hidden: true });
stage.root.append(chrome, seedLine, prompt, rulerWrap, controls, reveal, end);

const toD = (input: HTMLInputElement) => Number(input.value) / 100;
function syncEstimate(): void {
  const q = run.question;
  const l = Math.min(toD(lowIn), toD(highIn)), u = Math.max(toD(lowIn), toD(highIn));
  const text = `90% sure: between ${valueLabel(l, q.fact.unit)} and ${valueLabel(u, q.fact.unit)} · width ${(u - l).toFixed(2)} decades`;
  estimate.textContent = text;
  lowIn.setAttribute('aria-valuetext', valueLabel(toD(lowIn), q.fact.unit));
  highIn.setAttribute('aria-valuetext', valueLabel(toD(highIn), q.fact.unit));
  if (!run.answered) ruler.draw(q, l, u);
}
lowIn.addEventListener('input', syncEstimate);
highIn.addEventListener('input', syncEstimate);

function renderChrome(): void {
  clear(score);
  score.append('ESTIMATE ', el('strong', {}, String(run.index + 1)), el('span', { class: 'scale-score-sep' }, '/'), String(QUESTIONS),
    el('span', { class: 'scale-score-sep' }, ' · '), 'SCORE ', el('strong', {}, String(run.total)), el('span', { class: 'scale-score-sep' }, '/'), String(QUESTIONS * 100));
}

function renderQuestion(): void {
  const q = run.question;
  prompt.textContent = `> ESTIMATE [${run.index + 1}/${QUESTIONS}]: ${q.fact.label} (in ${q.fact.unit})`;
  for (const input of [lowIn, highIn]) {
    input.min = String(Math.round(q.lo * 100));
    input.max = String(Math.round(q.hi * 100));
    input.step = '1';
    input.disabled = false;
  }
  const mid = (q.lo + q.hi) / 2;
  lowIn.value = String(Math.round((mid - 1) * 100));
  highIn.value = String(Math.round((mid + 1) * 100));
  lockBtn.hidden = false;
  nextBtn.hidden = true;
  reveal.hidden = true;
  renderChrome();
  syncEstimate();
}

async function lockIn(): Promise<void> {
  if (busy || run.answered) return;
  busy = true;
  const q = run.question;
  const a = run.answer(toD(lowIn), toD(highIn));
  lowIn.disabled = highIn.disabled = true;
  lockBtn.hidden = true;
  await ruler.revealTruth(q, a, reduced);
  clear(reveal);
  reveal.className = `mag-reveal ${a.hit ? 'is-hit' : 'is-miss'}`;
  const msg = `${a.hit ? 'Inside your bracket.' : 'Outside your bracket.'} ${q.fact.label}: ${valueLabel(a.truth, q.fact.unit)}. Interval score ${a.score.toFixed(2)} → ${a.points}/100.`;
  reveal.append(el('p', { class: 'mono' }, `> ${msg}`), el('p', { class: 'mono mag-truth' }, a.hit ? 'Narrower brackets that still hit score higher.' : 'A miss costs 20× its distance outside: widen when unsure.'));
  reveal.hidden = false;
  announce(msg);
  renderChrome();
  if (run.finished) await finish();
  else nextBtn.hidden = false;
  busy = false;
}

async function finish(): Promise<void> {
  const cal = run.calibration;
  const best = load<number | null>('blueprint-best', null);
  if (best === null || run.total > best) save('blueprint-best', run.total);
  clear(end);
  const chart = new Ruler();
  const words = {
    overconfident: `Overconfident: only ${Math.round(cal.hitRate * 100)}% of your 90% intervals held the truth. Widen your brackets.`,
    calibrated: `Calibrated: ${Math.round(cal.hitRate * 100)}% of your 90% intervals held the truth, at an average width of ${cal.meanWidth.toFixed(1)} decades.`,
    underconfident: `Underconfident: every interval hit, but at ${cal.meanWidth.toFixed(1)} decades wide. You can afford to commit harder.`,
  };
  const share = `Null Overflow · Magnitude Run ${today}: ${run.total}/${QUESTIONS * 100}, ${Math.round(cal.hitRate * 100)}% hit rate (${cal.verdict}) ${run.answers.map((a) => (a.hit ? '📐' : '✏️')).join('')}`;
  const copy = el('button', { type: 'button', class: 'btn' }, 'Copy result');
  copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(share); copy.textContent = 'Copied ✓'; } catch { copy.textContent = 'Copy failed'; } });
  end.append(
    el('h3', { class: 'bp-end-title' }, `Calibration report · ${cal.verdict.toUpperCase()}`),
    el('p', { class: 'bp-end-copy' }, words[cal.verdict]),
    el('div', { class: 'lab-stage bp-stage' }, chart.canvas),
    el('p', { class: 'bp-end-copy' }, `Score ${run.total}/${QUESTIONS * 100}. ${best === null ? 'First run on this device.' : `Best on this device: ${Math.max(best, run.total)}.`}`),
    el('div', { class: 'lab-actions' }, el('button', { type: 'button', class: 'btn btn-signal', onclick: () => { run = new Run(seed); end.hidden = true; renderQuestion(); } }, 'Redraw today’s sheet'), copy));
  end.hidden = false;
  chart.resize(end.clientWidth - 40 || 700);
  await chart.calibrationChart(run.questions, run.answers, reduced);
  announce(words[cal.verdict]);
}

lockBtn.addEventListener('click', () => void lockIn());
nextBtn.addEventListener('click', () => { if (!busy && run.answered && !run.finished) { run.next(); renderQuestion(); } });
onKeys({ Enter: () => (nextBtn.hidden ? void lockIn() : nextBtn.click()) });

new ResizeObserver(() => { ruler.resize(rulerWrap.clientWidth - 2); if (!run.answered) syncEstimate(); else { const a = run.answers.at(-1)!; ruler.draw(run.question, a.low, a.high, { value: a.truth, frac: 1, hit: a.hit }); } }).observe(rulerWrap);
ruler.resize(rulerWrap.clientWidth || 800);
stage.ready();
renderQuestion();
