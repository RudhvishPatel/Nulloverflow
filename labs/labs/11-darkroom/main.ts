// lab/11 CNN Vision Lab: draw digits for a real CNN, watch every feature map develop, see
// saliency, then flip the network's mind with as few pixel edits as possible.
import { announce, prefersReducedMotion } from '../../core/a11y';
import { clear, el } from '../../core/dom';
import { dailySeed, rng, shuffle } from '../../core/seed';
import { mountLab } from '../../core/shell';
import { load, save } from '../../core/store';
import { centre, forward, loadModel, saliency, type Forward, type Model } from './sim/cnn';
import './lab.css';

const stage = mountLab('lab-vision');
const seed = dailySeed('11');
const reduced = prefersReducedMotion();
const today = new Date().toISOString().slice(0, 10);
const r0 = rng(seed);
const drawTargets = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], r0).slice(0, 5);

let model: Model;
let digits: { labels: number[]; pixels: string[] };
let mode: 'draw' | 'adversary' = 'draw';
let drawIdx = 0, advIdx = 0;
let drawPts = 0, advPts = 0;
let ink = new Float32Array(784);          // raw 28×28 from the pad
let adv = new Float32Array(784), advOrig = new Float32Array(784), advLabel = 0, edits = 0;
let showSal = false;
let current: Forward | null = null;
const log: string[] = [];

// ---- DOM ---------------------------------------------------------------------------------
const score = el('span', { class: 'scale-score mono', 'aria-live': 'polite' });
const chrome = el('div', { class: 'scale-chrome' }, el('span', { class: 'mono' }, 'lab/11 · cnn-vision · real model, in your browser'), score);
const tabs = el('div', { class: 'mag-tabs', role: 'tablist', 'aria-label': 'Vision Lab modes' });
const seedLine = el('p', { class: 'mono mag-seed' });
const prompt = el('p', { class: 'scale-prompt mono' });
const pad = el('canvas', { class: 'dk-pad', width: 280, height: 280, role: 'img', 'aria-label': 'Drawing paper: draw one digit with your mouse, finger or pen' });
const input = el('canvas', { class: 'dk-input', width: 28, height: 28, role: 'img' });
const probs = el('ol', { class: 'dk-probs', 'aria-label': 'Class probabilities' });
const tray1 = el('div', { class: 'dk-tray', role: 'group', 'aria-label': 'Layer 1: eight 26 by 26 feature maps' });
const tray2 = el('div', { class: 'dk-tray dk-tray-2', role: 'group', 'aria-label': 'Layer 2: sixteen 11 by 11 feature maps' });
const salBox = el('input', { type: 'checkbox' });
const clearBtn = el('button', { type: 'button', class: 'btn dk-clear' }, 'Clear paper');
const submitBtn = el('button', { type: 'button', class: 'btn btn-signal dk-submit' }, 'Submit print');
const reveal = el('div', { class: 'lab-reveal', hidden: true });
const end = el('section', { class: 'dk-end', hidden: true });
stage.root.append(chrome, tabs, seedLine, prompt,
  el('div', { class: 'lab-stage dk-stage' },
    el('div', { class: 'dk-left' }, el('div', { class: 'dk-pad-wrap' }, pad),
      el('div', { class: 'lab-actions' }, clearBtn, submitBtn),
      el('label', { class: 'dk-toggle' }, salBox, ' Saliency: where the pixels matter most for the top guess')),
    el('div', { class: 'dk-right' },
      el('div', { class: 'dk-row' }, el('figure', { class: 'dk-fig' }, input, el('figcaption', { class: 'mono' }, 'what the network sees (28×28)')), el('div', { class: 'dk-meter' }, el('p', { class: 'mono dk-cap' }, 'enlarger meter · class probability'), probs)),
      el('p', { class: 'mono dk-cap' }, 'conv layer 1 · 8 filters'), tray1,
      el('p', { class: 'mono dk-cap' }, 'conv layer 2 · 16 filters'), tray2)),
  reveal, end);

for (const [i, name] of ['Draw for the machine', 'Adversary'].entries()) {
  tabs.append(el('button', { type: 'button', role: 'tab', 'aria-selected': String(i === 0), class: `mag-tab${i === 0 ? ' is-active' : ''}`, onclick: () => setMode(i === 0 ? 'draw' : 'adversary') }, name));
}

// ---- Rendering -------------------------------------------------------------------------------
function paintGray(canvas: HTMLCanvasElement, data: Float32Array, w: number, h: number, tint: 'paper' | 'red' = 'paper', overlay?: Float32Array): void {
  canvas.width = w; canvas.height = h;
  const c = canvas.getContext('2d')!, img = c.createImageData(w, h);
  let max = 1e-9; for (const v of data) max = Math.max(max, v);
  let omax = 1e-9; if (overlay) for (const v of overlay) omax = Math.max(omax, Math.abs(v));
  for (let i = 0; i < w * h; i++) {
    const v = data[i]! / max;
    const paper = tint === 'paper' ? 244 - 230 * v : 30 + 225 * v;
    const o = overlay ? Math.abs(overlay[i]!) / omax : 0;
    img.data[i * 4] = tint === 'red' ? paper : paper * (1 - o) + 255 * o;
    img.data[i * 4 + 1] = tint === 'red' ? paper * 0.35 : paper * (1 - o) + 59 * o;
    img.data[i * 4 + 2] = tint === 'red' ? paper * 0.3 : paper * (1 - o) + 47 * o;
    img.data[i * 4 + 3] = 255;
  }
  c.putImageData(img, 0, 0);
}

function develop(tray: HTMLElement, maps: Float32Array[], size: number): void {
  clear(tray);
  maps.forEach((m, i) => {
    const cv = el('canvas', { class: `dk-print${reduced ? '' : ' is-developing'}`, 'aria-hidden': 'true' });
    cv.style.setProperty('--i', String(i));
    paintGray(cv, m, size, size, 'red');
    tray.append(cv);
  });
}

function currentImage(): Float32Array { return mode === 'draw' ? centre(ink) : adv; }

function analyse(): void {
  if (!model) return;
  const x = currentImage();
  current = forward(model, x);
  const top = current.probs.indexOf(Math.max(...current.probs));
  paintGray(input, x, 28, 28, 'paper', showSal ? saliency(model, x, top) : undefined);
  input.setAttribute('aria-label', `The network's 28 by 28 view. Top guess: ${top} at ${(current.probs[top]! * 100).toFixed(0)}%.`);
  clear(probs);
  current.probs.forEach((p, d) => probs.append(el('li', { class: d === top ? 'is-top' : '' }, el('span', { class: 'mono' }, String(d)), el('span', { class: 'dk-bar', style: `--p:${(p * 100).toFixed(1)}%` }), el('span', { class: 'mono dk-pct' }, `${(p * 100).toFixed(0)}%`))));
  develop(tray1, current.maps1, 26);
  develop(tray2, current.maps2, 11);
}

function renderChrome(): void {
  clear(score);
  score.append('DRAW ', el('strong', {}, String(drawPts)), el('span', { class: 'scale-score-sep' }, '/'), '100',
    el('span', { class: 'scale-score-sep' }, ' · '), 'ADVERSARY ', el('strong', {}, String(advPts)), el('span', { class: 'scale-score-sep' }, '/'), '100');
}

// ---- Drawing pad ------------------------------------------------------------------------------
const pc = pad.getContext('2d')!;
function paper(): void { pc.fillStyle = '#f4efe6'; pc.fillRect(0, 0, 280, 280); }
function padToInk(): void {
  const small = document.createElement('canvas'); small.width = small.height = 28;
  const sc = small.getContext('2d')!;
  sc.drawImage(pad, 0, 0, 28, 28);
  const d = sc.getImageData(0, 0, 28, 28).data;
  ink = new Float32Array(784);
  for (let i = 0; i < 784; i++) ink[i] = Math.max(0, Math.min(1, (244 - d[i * 4]!) / 230));
}
function renderAdversaryPad(): void {
  paper();
  const s = 10;
  for (let i = 0; i < 784; i++) {
    const v = adv[i]!, changed = Math.abs(v - advOrig[i]!) > 0.01;
    pc.fillStyle = changed ? (v > 0.5 ? '#b3261e' : '#ffc2bd') : `rgb(${244 - 230 * v},${239 - 230 * v},${230 - 225 * v})`;
    pc.fillRect((i % 28) * s, Math.floor(i / 28) * s, s, s);
  }
}
let drawing = false, lastX = 0, lastY = 0;
const pos = (e: PointerEvent) => { const r = pad.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * 280, ((e.clientY - r.top) / r.height) * 280] as const; };
pad.addEventListener('pointerdown', (e) => {
  pad.setPointerCapture(e.pointerId);
  const [x, y] = pos(e);
  if (mode === 'adversary') { toggleAdv(x, y); drawing = true; return; }
  drawing = true; lastX = x; lastY = y;
  pc.fillStyle = '#111'; pc.beginPath(); pc.arc(x, y, 11, 0, Math.PI * 2); pc.fill();
});
pad.addEventListener('pointermove', (e) => {
  if (!drawing) return;
  const [x, y] = pos(e);
  if (mode === 'adversary') { toggleAdv(x, y, true); return; }
  pc.strokeStyle = '#111'; pc.lineWidth = 22; pc.lineCap = 'round';
  pc.beginPath(); pc.moveTo(lastX, lastY); pc.lineTo(x, y); pc.stroke();
  lastX = x; lastY = y;
});
pad.addEventListener('pointerup', () => { if (!drawing) return; drawing = false; if (mode === 'draw') { padToInk(); analyse(); } });

let lastToggled = -1;
function toggleAdv(x: number, y: number, dragging = false): void {
  const i = Math.floor(y / 10) * 28 + Math.floor(x / 10);
  if (i < 0 || i >= 784 || (dragging && i === lastToggled)) return;
  lastToggled = i;
  adv[i] = adv[i]! > 0.5 ? 0 : 1;
  edits = adv.reduce((a, v, k) => a + (Math.abs(v - advOrig[k]!) > 0.01 ? 1 : 0), 0);
  renderAdversaryPad();
  analyse();
  const top = current!.probs.indexOf(Math.max(...current!.probs));
  prompt.textContent = `> ADVERSARY [${advIdx + 1}/2]: the ink shows a ${advLabel}. Flip the prediction with as few pixel edits as you can. Edits: ${edits} · model now says ${top}${top !== advLabel ? ' (flipped!)' : ''}.`;
}

// ---- Rounds ------------------------------------------------------------------------------------
function setMode(m: 'draw' | 'adversary'): void {
  mode = m;
  tabs.querySelectorAll('.mag-tab').forEach((t, j) => { const on = (j === 0) === (m === 'draw'); t.classList.toggle('is-active', on); t.setAttribute('aria-selected', String(on)); });
  reveal.hidden = true;
  if (m === 'draw') startDraw(); else startAdversary();
}

function startDraw(): void {
  if (drawIdx >= 5) { prompt.textContent = '> All five drawings submitted. Try the Adversary tab.'; return; }
  paper(); ink = new Float32Array(784); analyse();
  prompt.textContent = `> DRAW [${drawIdx + 1}/5]: draw a ${drawTargets[drawIdx]} large and clear. Submit when the meter shows it at 80% or more.`;
  submitBtn.textContent = 'Submit print';
}

function startAdversary(): void {
  if (advIdx >= 2 || !digits) { prompt.textContent = advIdx >= 2 ? '> Both adversary rounds done.' : '> Loading digits…'; return; }
  const pick = Math.floor(rng(seed + advIdx)() * digits.labels.length);
  advLabel = digits.labels[pick]!;
  advOrig = Float32Array.from(atob(digits.pixels[pick]!), (ch) => ch.charCodeAt(0) / 255);
  adv = Float32Array.from(advOrig);
  edits = 0;
  renderAdversaryPad();
  analyse();
  prompt.textContent = `> ADVERSARY [${advIdx + 1}/2]: the ink shows a ${advLabel}. Click pixels to toggle them and flip the prediction with as few edits as you can. Edits: 0.`;
  submitBtn.textContent = 'Submit flip';
}

function submit(): void {
  if (!current) return;
  const top = current.probs.indexOf(Math.max(...current.probs));
  let msg: string, ok: boolean;
  if (mode === 'draw') {
    if (drawIdx >= 5) return;
    const target = drawTargets[drawIdx]!;
    ok = top === target && current.probs[target]! >= 0.8;
    const pts = ok ? 20 : 0;
    drawPts += pts; log.push(ok ? '🖼' : '▫');
    msg = ok ? `The network sees a ${target} at ${(current.probs[target]! * 100).toFixed(0)}% → +20.` : `It saw a ${top} (${(current.probs[top]! * 100).toFixed(0)}%), not a ${target} at 80%+ → 0.`;
    drawIdx++;
  } else {
    if (advIdx >= 2) return;
    ok = top !== advLabel;
    if (!ok) { announce('Not flipped yet: the model still says ' + advLabel); prompt.textContent += ' Not flipped yet.'; return; }
    const pts = Math.max(10, 50 - 2 * edits);
    advPts += pts; log.push(edits <= 10 ? '🎯' : '✂');
    msg = `Flipped a ${advLabel} into a ${top} with ${edits} pixel edit${edits === 1 ? '' : 's'} → +${pts}. Small edits fooling a 98%-accurate model is why adversarial robustness matters.`;
    advIdx++;
  }
  reveal.className = `lab-reveal ${ok ? 'is-hit' : 'is-miss'}`;
  clear(reveal);
  reveal.append(el('p', { class: 'mono' }, `> ${msg}`));
  reveal.hidden = false;
  announce(msg);
  renderChrome();
  if (drawIdx >= 5 && advIdx >= 2) finish();
  else setTimeout(() => (mode === 'draw' ? startDraw() : startAdversary()), reduced ? 0 : 900);
}

function finish(): void {
  const total = drawPts + advPts;
  const best = load<number | null>('darkroom-best', null);
  if (best === null || total > best) save('darkroom-best', total);
  const share = `Null Overflow · CNN Vision Lab ${today}: ${total}/200 ${log.join('')}`;
  const copy = el('button', { type: 'button', class: 'btn' }, 'Copy result');
  copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(share); copy.textContent = 'Copied ✓'; } catch { copy.textContent = 'Copy failed'; } });
  clear(end);
  end.append(el('p', { class: 'mono dk-end-kicker' }, 'Contact sheet'), el('h4', { class: 'dk-end-score' }, `${total} / 200`),
    el('p', {}, best === null ? 'First contact sheet on this device.' : `Best on this device: ${Math.max(best, total)}.`),
    el('div', { class: 'lab-actions' }, el('button', { type: 'button', class: 'btn btn-signal', onclick: () => location.reload() }, 'Back into the darkroom'), copy));
  end.hidden = false;
  announce(`Contact sheet: ${total} of 200.`);
}

clearBtn.addEventListener('click', () => { if (mode === 'draw') { paper(); ink = new Float32Array(784); analyse(); } else { adv = Float32Array.from(advOrig); edits = 0; renderAdversaryPad(); analyse(); } });
submitBtn.addEventListener('click', submit);
salBox.addEventListener('change', () => { showSal = salBox.checked; analyse(); });

async function boot(): Promise<void> {
  const base = '/assets/lab/11/data/';
  const [m, d] = await Promise.all([fetch(`${base}cnn.json`).then((r) => r.json()), fetch(`${base}digits.json`).then((r) => r.json())]);
  model = loadModel(m);
  digits = d;
  seedLine.textContent = `> DAILY SEED ${today} · CNN with ${(model.accuracy * 100).toFixed(1)}% MNIST test accuracy · 5 drawings · 2 adversary digits`;
  renderChrome();
  stage.ready();
  startDraw();
}
boot().catch((e) => { stage.ready(); prompt.textContent = `> The model failed to load: ${String(e)}`; });
