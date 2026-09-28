// Patch the compiled /lab/ hub so lab cards are plain <a> links (no Next prefetch of the
// deleted lab/NN/index.txt, full page load into the static lab pages).
// Works on both payload forms: lab/index.txt (raw RSC) and the escaped copy embedded in
// lab/index.html. Idempotent: a second run changes nothing.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';


/** Replace Link element refs for /lab/NN cards with "a" and add the trailing slash. */
export function plainLabLinks(src, escaped) {
  const q = escaped ? '\\\\"' : '"';          // regex for a quote in this form
  const Q = escaped ? '\\"' : '"';            // literal quote in this form
  const re = new RegExp(`\\[${q}\\$${q},${q}\\$L[0-9a-z]+${q},null,\\{${q}href${q}:${q}/lab/(\\d\\d)/?${q}`, 'g');
  let count = 0;
  const out = src.replace(re, (_m, n) => {
    count++;
    return `[${Q}$${Q},${Q}a${Q},null,{${Q}href${Q}:${Q}/lab/${n}/${Q}`;
  });
  return { out, count };
}

const escHtml = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');

function cardHtml(c) {
  return `<li><a class="lab-card" href="/lab/${c.n}/"><span class="lab-card-top"><span class="mono">lab/<!-- -->${c.n}</span><span class="lab-live mono">live</span></span><span class="lab-card-title">${escHtml(c.title)}</span><span class="lab-card-kind mono">${escHtml(c.kind)}</span><span class="lab-card-blurb">${escHtml(c.blurb)}</span><span class="lab-card-go mono">play →</span></a></li>`;
}

function cardRsc(c) {
  const span = (cls, children) => ['$', 'span', null, { className: cls, children }];
  return JSON.stringify(['$', 'li', `/lab/${c.n}`, { children: ['$', 'a', null, { href: `/lab/${c.n}/`, className: 'lab-card', children: [
    span('lab-card-top', [span('mono', ['lab/', c.n]), span('lab-live mono', 'live')]),
    span('lab-card-title', c.title), span('lab-card-kind mono', c.kind), span('lab-card-blurb', c.blurb), span('lab-card-go mono', 'play →'),
  ] }] }]);
}

/** [start, end) of the card for lab `n` in `src`, or null. */
function locate(src, n, form) {
  if (form === 'html') {
    const start = src.indexOf(`<li><a class="lab-card" href="/lab/${n}/">`);
    return start < 0 ? null : [start, src.indexOf('</li>', start) + 5];
  }
  const q = form === 'escaped' ? '\\"' : '"';
  const start = src.indexOf(`[${q}$${q},${q}li${q},${q}/lab/${n}${q}`);
  if (start < 0) return null;
  const end = matchEnd(src, start, q);
  return end < 0 ? null : [start, end];
}

/** Index just past the bracket that closes the one at `start`, skipping quoted strings. */
function matchEnd(src, start, q) {
  let depth = 0, inStr = false;
  for (let i = start; i < src.length; i++) {
    if (src.startsWith(q, i) && !(q === '"' && src[i - 1] === '\\') && !(q !== '"' && src[i - 1] === '\\' && src[i - 2] === '\\')) {
      inStr = !inStr; i += q.length - 1; continue;
    }
    if (inStr) continue;
    const ch = src[i];
    if (ch === '[' || ch === '{') depth++;
    else if (ch === ']' || ch === '}') { depth--; if (depth === 0) return i + 1; }
  }
  return -1;
}

/** Insert (after the highest-numbered existing card) or replace the card for `c.n`. */
export function upsertCard(src, c, form) {
  let block = form === 'html' ? cardHtml(c) : cardRsc(c);
  if (form === 'escaped') block = block.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const here = locate(src, c.n, form);
  if (here) return src.slice(0, here[0]) + block + src.slice(here[1]);
  let prev = null;
  for (let k = Number(c.n) - 1; k >= 1 && !prev; k--) prev = locate(src, String(k).padStart(2, '0'), form);
  if (!prev) throw new Error(`no earlier card to insert lab ${c.n} after (${form})`);
  if (form === 'html') return src.slice(0, prev[1]) + block + src.slice(prev[1]);
  // RSC: if the previous card is its own streamed row ("d:[...]"), insert after the list's
  // lazy reference to that row ("$Ld"); otherwise it is inline and we insert right after it.
  const q = form === 'escaped' ? '\\"' : '"';
  const before = src.slice(Math.max(0, prev[0] - 12), prev[0]);
  const row = /(?:^|\n|\\n|")([0-9a-f]+):$/.exec(before);
  let at = prev[1];
  if (row) {
    const ref = `${q}$L${row[1]}${q}`;
    const i = src.indexOf(ref);
    if (i < 0) throw new Error(`lazy reference ${ref} not found for lab ${c.n}`);
    at = i + ref.length;
  }
  return src.slice(0, at) + ',' + block + src.slice(at);
}

export function setLiveCount(src, count, form) {
  if (form === 'html') return src.replace(/(phosphor · <!-- -->)\d+(<!-- --> live)/, `$1${count}$2`);
  const q = form === 'escaped' ? '\\"' : '"';
  const lit = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${lit(`${q}interactive · phosphor · ${q},`)})\\d+(${lit(`,${q} live${q}`)})`);
  return src.replace(re, `$1${count}$2`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const SITE = resolve(fileURLToPath(new URL('../..', import.meta.url)));
  const { readdir } = await import('node:fs/promises');
  const labsDir = resolve(SITE, 'labs/labs');
  const cards = [];
  for (const d of (await readdir(labsDir)).sort()) {
    try { const j = JSON.parse(await readFile(resolve(labsDir, d, 'lab.json'), 'utf8')); if (j.card) cards.push({ n: j.n, ...j.card }); } catch { /* not a lab */ }
  }
  for (const [file, escaped] of [['lab/index.txt', false], ['lab/index.html', true]]) {
    const path = resolve(SITE, file);
    let src = await readFile(path, 'utf8');
    const { out, count } = plainLabLinks(src, escaped);
    src = out;
    for (const c of cards) {
      if (file.endsWith('.html')) src = upsertCard(src, c, 'html');
      src = upsertCard(src, c, escaped ? 'escaped' : 'raw');
    }
    const live = (src.match(/<li><a class="lab-card" href="\/lab\/\d\d\/">/g) ?? []).length || cards.length;
    if (file.endsWith('.html')) src = setLiveCount(src, live, 'html');
    src = setLiveCount(src, live, escaped ? 'escaped' : 'raw');
    await writeFile(path, src);
    console.log(`${file}: ${count} link(s) converted, ${cards.length} card(s) upserted, ${live} live`);
  }
}
