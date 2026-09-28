// Build every lab in labs/labs/NN-slug into the static site.
//   node scripts/build-all.mjs            all labs
//   node scripts/build-all.mjs 06 09      only these
// For each lab: render the page from lab.json (site <head> + themed skeleton), bundle it
// with Vite, write lab/NN/index.html + assets/lab/NN/*, delete lab/NN/index.txt (so the
// Next router falls back to a full page load), then re-run the lab-themes build so every
// page links the current theme stylesheet.
import { execFileSync } from 'node:child_process';
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const LABS_DIR = resolve(fileURLToPath(new URL('..', import.meta.url)));
const SITE = resolve(LABS_DIR, '..');
const TMP = join(LABS_DIR, '.build');
const GLOBAL_CSS = '<link rel="stylesheet" href="/_next/static/css/c3513951b0532cb5.css" data-precedence="next"/>';
const DESCRIPTION = 'Retro-terminal AI/ML studio led by Rudhvish Patel. Production GenAI, ML engineering, research — inquiry only.';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function page(lab, entry) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<!--SITE-CSS-->
<title>${esc(lab.title)} · lab/${lab.n} · Null Overflow</title>
<meta name="description" content="${esc(lab.description || DESCRIPTION)}"/>
<script type="module" src="${entry}"></script>
</head>
<body>
<main>
<section class="section">
<div class="wrap">
<div class="section-head"><h2>${esc(lab.title)}</h2><span class="meta">lab/${lab.n} · ${esc(lab.meta)}</span></div>
<p class="lab-lede">${esc(lab.lede)}</p>
<article class="lab-game-panel">
<div class="lab-game-head"><div><div class="mono">lab/${lab.n} · game</div><h3>${esc(lab.title)}</h3></div><span class="meta">${esc(lab.meta)}</span></div>
<div class="${lab.root}">
<p class="mono lab-loading" aria-live="polite">&gt; warming phosphor<span class="lab-caret" aria-hidden="true"></span></p>
<noscript><p class="mono">This lab needs JavaScript to run. Nothing is sent anywhere; it all runs in your browser.</p></noscript>
</div>
</article>
<p class="lab-page-nav"><a class="btn" href="/lab/">← Lab</a><a class="btn" href="/lab/blog/">Lab blog</a><a class="btn" href="/">Home</a></p>
</div>
</section>
</main>
<footer class="site-footer"><div class="wrap footer-row"><span>NULL∅VERFLOW · AI/ML studio · inquiry only · no public pricing</span></div></footer>
</body>
</html>
`;
}

const only = process.argv.slice(2);
const dirs = (await readdir(join(LABS_DIR, 'labs'))).filter((d) => /^\d\d-/.test(d)).filter((d) => !only.length || only.includes(d.slice(0, 2))).sort();
if (!dirs.length) throw new Error('no labs matched');

for (const dir of dirs) {
  const lab = JSON.parse(await readFile(join(LABS_DIR, 'labs', dir, 'lab.json'), 'utf8'));
  const n = lab.n;
  const tmpDir = join(TMP, n);
  const outDir = join(TMP, `dist-${n}`);
  await rm(tmpDir, { recursive: true, force: true });
  await rm(outDir, { recursive: true, force: true });
  await mkdir(tmpDir, { recursive: true });
  await writeFile(join(tmpDir, 'index.html'), page(lab, `/labs/${dir}/main.ts`));

  await build({
    root: LABS_DIR,
    base: '/',
    logLevel: 'warn',
    publicDir: false,
    build: {
      outDir,
      emptyOutDir: true,
      assetsDir: `assets/lab/${n}`,
      modulePreload: { polyfill: false },
      rollupOptions: { input: join(tmpDir, 'index.html') },
    },
  });

  // Place outputs: page + hashed assets (keep assets/lab/NN/data, which is not built).
  const siteAssets = join(SITE, 'assets/lab', n);
  await mkdir(siteAssets, { recursive: true });
  for (const f of await readdir(siteAssets)) if (f !== 'data') await rm(join(siteAssets, f), { recursive: true, force: true });
  await cp(join(outDir, 'assets/lab', n), siteAssets, { recursive: true });
  await mkdir(join(SITE, 'lab', n), { recursive: true });
  // The site stylesheet lives outside the Vite root, so it is linked after bundling.
  const built = await readFile(join(outDir, '.build', n, 'index.html'), 'utf8');
  if (!built.includes('<!--SITE-CSS-->')) throw new Error(`lab/${n}: site CSS placeholder missing`);
  await writeFile(join(SITE, 'lab', n, 'index.html'), built.replace('<!--SITE-CSS-->', GLOBAL_CSS));
  const txt = join(SITE, 'lab', n, 'index.txt');
  if (existsSync(txt)) await rm(txt);
  console.log(`built lab/${n} (${dir})`);
}

// Link the current theme stylesheet into every page (including the ones just written).
execFileSync(process.execPath, [join(SITE, 'tools/lab-themes/build.mjs')], { stdio: 'inherit' });
// Keep the /lab/ hub in sync: plain links, a card per lab, the live count.
execFileSync(process.execPath, [join(LABS_DIR, 'scripts/patch-hub.mjs')], { stdio: 'inherit' });
