// lab/01 Scale Arena: ratio bets on a log scale, revealed by a powers-of-ten zoom.
import { announce, onKeys, prefersReducedMotion } from '../../core/a11y';
import { clear, el } from '../../core/dom';
import { dailySeed } from '../../core/seed';
import { mountLab } from '../../core/shell';
import { load, save } from '../../core/store';
import { ZoomView } from './render/zoom';
import { Match, ROUNDS, ratioLabel, sizeLabel, type BetResult } from './sim/match';
import './lab.css';

const stage = mountLab('scale-arena');
const seed = dailySeed('01');
const reduced = prefersReducedMotion();
const today = new Date().toISOString().slice(0, 10);
const MAX = 42;

let match = new Match(seed);
let busy = false;

const score = el('span', { class: 'scale-score mono', 'aria-live': 'polite' });
const streak = el('span', { class: 'scale-streak' });
const chrome = el('div', { class: 'scale-chrome' }, el('span', { class: 'mono' }, 'lab/01 · scale-arena · ratio bets'), el('span', { class: 'arena-chrome-right' }, streak, score));
const seedLine = el('p', { class: 'mono mag-seed' }, `> DAILY SEED ${today} · ${ROUNDS}-bout card`);
const prompt = el('p', { class: 'scale-prompt mono' });
const zoom = new ZoomView();
const zoomWrap = el('div', { class: 'arena-zoom-wrap' }, zoom.canvas);
const cardA = el('button', { type: 'button', class: 'scale-card' });
const cardB = el('button', { type: 'button', class: 'scale-card' });
const grid = el('div', { class: 'scale-grid' }, cardA, cardB);
const slider = el('input', { type: 'range', min: -MAX * 10, max: MAX * 10, step: 1, value: 0, class: 'arena-slider', 'aria-label': 'How many times bigger, on a log scale. Left: A is bigger. Right: B is bigger.' });
const readout = el('p', { class: 'arena-readout', 'aria-live': 'polite' });
const nudge = (d: number) => el('button', { type: 'button', class: 'btn arena-nudge', onclick: () => setGuess(guess() + d) }, d > 0 ? `+${d}` : String(d));
const lockBtn = el('button', { type: 'button', class: 'btn btn-signal arena-lock' }, 'Lock in');
const nextBtn = el('button', { type: 'button', class: 'btn arena-next', hidden: true }, 'Next bout →');
const bet = el('div', { class: 'arena-bet' },
  el('div', { class: 'arena-scale mono', 'aria-hidden': 'true' }, el('span', {}, 'A bigger ←'), el('span', {}, 'same'), el('span', {}, '→ B bigger')),
  slider, readout,
  el('div', { class: 'lab-actions' }, nudge(-1), nudge(-0.1), nudge(0.1), nudge(1), lockBtn, nextBtn));
const feedback = el('div', { class: 'scale-feedback' });
const done = el('div', { class: 'scale-done', hidden: true });
stage.root.append(chrome, seedLine, prompt, zoomWrap, grid, bet, feedback, done);

const guess = () => Number(slider.value) / 10;
function setGuess(d: number): void {
  slider.value = String(Math.round(Math.max(-MAX, Math.min(MAX, d)) * 10));
  renderReadout();
}
function renderReadout(): void {
  const g = guess(), p = match.pair;
  const text = Math.abs(g) < 0.05 ? 'Same size' : `${g > 0 ? p.b.name : p.a.name} is ${ratioLabel(g)} bigger`;
  readout.textContent = text;
  slider.setAttribute('aria-valuetext', text);
  cardA.setAttribute('aria-pressed', String(g < -0.05));
  cardB.setAttribute('aria-pressed', String(g > 0.05));
}
slider.addEventListener('input', renderReadout);
cardA.addEventListener('click', () => { if (!match.answered) setGuess(-Math.max(1, Math.abs(guess()))); });
cardB.addEventListener('click', () => { if (!match.answered) setGuess(Math.max(1, Math.abs(guess()))); });

function card(btn: HTMLButtonElement, side: 'A' | 'B', name: string, size?: string): void {
  clear(btn);
  btn.className = 'scale-card';
  btn.append(el('span', { class: 'mono scale-card-side' }, side), el('span', { class: 'scale-card-name' }, name),
    size ? el('span', { class: 'mono scale-card-size' }, size) : el('span', { class: 'mono scale-card-hint' }, 'tap to back this corner'));
}

function renderChrome(): void {
  clear(score);
  score.append('BOUT ', el('strong', {}, String(match.index + 1)), el('span', { class: 'scale-score-sep' }, '/'), String(ROUNDS),
    el('span', { class: 'scale-score-sep' }, ' · '), 'POINTS ', el('strong', {}, String(match.total)));
  streak.textContent = match.streak > 0 ? `streak ${match.streak} · ×${Math.min(2, 1 + 0.1 * match.streak).toFixed(1)}` : 'no streak';
}

function renderRound(): void {
  const p = match.pair;
  prompt.textContent = `> BOUT [${match.index + 1}/${ROUNDS}]${p.boss ? ' · BOSS BOUT' : ''}: how many times bigger is the bigger one?`;
  prompt.classList.toggle('is-boss', p.boss);
  card(cardA, 'A', p.a.name);
  card(cardB, 'B', p.b.name);
  cardA.disabled = cardB.disabled = false;
  slider.disabled = false;
  lockBtn.hidden = false;
  nextBtn.hidden = true;
  clear(feedback);
  setGuess(0);
  renderChrome();
  zoom.idle(p);
}

async function lockIn(): Promise<void> {
  if (busy || match.answered) return;
  busy = true;
  const p = match.pair;
  const r: BetResult = match.bet(guess());
  lockBtn.hidden = true;
  slider.disabled = true;
  cardA.disabled = cardB.disabled = true;
  const verdict = r.score >= 90 ? 'ko' : r.score < 20 ? 'miss' : 'ok';
  await zoom.reveal(p, reduced, verdict);
  card(cardA, 'A', p.a.name, sizeLabel(p.a.metres));
  card(cardB, 'B', p.b.name, sizeLabel(p.b.metres));
  const winner = p.decades > 0 ? cardB : cardA, loser = winner === cardA ? cardB : cardA;
  winner.classList.add('is-correct');
  if (Math.sign(r.guess) !== Math.sign(r.truth)) loser.classList.add('is-wrong');
  const truthText = `${p.decades > 0 ? p.b.name : p.a.name} is ${ratioLabel(p.decades)} bigger`;
  const msg = `${verdict === 'ko' ? 'KNOCKOUT!' : verdict === 'miss' ? 'Down goes your bet.' : 'Scored.'} ${truthText}. You bet ${Math.abs(r.guess) < 0.05 ? 'same size' : ratioLabel(r.guess)}: ${r.score.toFixed(0)}/100${r.multiplier > 1 ? ` × ${r.multiplier.toFixed(1)} streak` : ''} = ${r.points} points.`;
  clear(feedback);
  feedback.append(el('p', {}, `> ${msg}`));
  announce(msg);
  renderChrome();
  if (match.finished) finish();
  else nextBtn.hidden = false;
  busy = false;
}

function finish(): void {
  const best = load<number | null>('arena-best', null);
  if (best === null || match.total > best) save('arena-best', match.total);
  const kos = match.results.filter((r) => r.score >= 90).length;
  const share = `Null Overflow · Scale Arena ${today}: ${match.total} pts, ${kos} KO ${match.results.map((r) => (r.score >= 90 ? '🥊' : r.score >= 60 ? '🟨' : '⬛')).join('')}`;
  clear(done);
  const copy = el('button', { type: 'button', class: 'btn' }, 'Copy result');
  copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(share); copy.textContent = 'Copied ✓'; } catch { copy.textContent = 'Copy failed'; } });
  done.append(
    el('p', { class: 'mono' }, 'Final bell'),
    el('h3', {}, `${match.total} points`),
    el('p', { class: 'scale-done-copy' }, `${kos} knockout${kos === 1 ? '' : 's'} in ${ROUNDS} bouts. ${best === null ? 'First card logged on this device.' : `Best on this device: ${Math.max(best, match.total)}.`}`),
    el('div', { class: 'lab-actions' }, el('button', { type: 'button', class: 'btn btn-signal', onclick: () => { match = new Match(seed); done.hidden = true; renderRound(); } }, 'Rematch today’s card'), copy));
  done.hidden = false;
  announce(`Final bell: ${match.total} points.`);
}

lockBtn.addEventListener('click', () => void lockIn());
nextBtn.addEventListener('click', () => { if (!busy && match.answered && !match.finished) { match.next(); renderRound(); } });
onKeys({
  Enter: () => (nextBtn.hidden ? void lockIn() : nextBtn.click()),
  a: () => cardA.click(),
  b: () => cardB.click(),
});

new ResizeObserver(() => { zoom.resize(zoomWrap.clientWidth); if (!match.answered) zoom.idle(match.pair); }).observe(zoomWrap);
zoom.resize(zoomWrap.clientWidth || 800);
stage.ready();
renderRound();
