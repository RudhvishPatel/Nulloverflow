// Build the lab theme layer into the compiled site.
//  1. Concatenate src/shared.css + src/themes/*.css, minify, write _next/static/css/lab-themes.<hash8>.css
//  2. Inject (or update) its <link> in every page's <head>
// Idempotent: re-running replaces the previous build's outputs.
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile, unlink } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(HERE, '../..');
const CSS_DIR = join(ROOT, '_next/static/css');
const SKIP = new Set(['.backup', '.git', '.claude', '.agents', '.superpowers', 'tools', 'docs', 'labs', 'node_modules']);
const hash = (s, n) => createHash('sha256').update(s).digest('hex').slice(0, n);

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
}

// Safe minify only: comments + whitespace runs outside strings. Spaces before ':'
// are descendant combinators and string contents are shown text, so both are kept.
function minify(css) {
  const parts = css.replace(/\/\*[\s\S]*?\*\//g, '').split(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/);
  const body = parts
    .map((p, i) => (i % 2 ? p : p
      .replace(/\s+/g, ' ')
      .replace(/\s*([{};,>])\s*/g, '$1') // never significant around these
      .replace(/:\s+/g, ':')             // after ':' never significant (before it is a combinator)
      .replace(/;}/g, '}')))
    .join('')
    .trim();
  return `@charset "utf-8";${body}`;
}

// 1. Stylesheet
const themeFiles = (await readdir(join(HERE, 'src/themes'))).filter((f) => f.endsWith('.css')).sort();
const sources = [join(HERE, 'src/shared.css'), ...themeFiles.map((f) => join(HERE, 'src/themes', f))];
const css = minify((await Promise.all(sources.map((f) => readFile(f, 'utf8')))).join('\n'));
const cssName = `lab-themes.${hash(css, 8)}.css`;
for (const f of await readdir(CSS_DIR)) if (/^lab-themes\.[0-9a-f]{8}\.css$/.test(f) && f !== cssName) await unlink(join(CSS_DIR, f));
await writeFile(join(CSS_DIR, cssName), css);
console.log(`css   ${cssName}  ${(css.length / 1024).toFixed(1)} KB  (${sources.length} sources)`);

// 2. Rewrite pages
const LINK_RE = /<link rel="stylesheet" href="\/_next\/static\/css\/lab-themes\.[0-9a-f]{8}\.css"\/>/;
const GLOBAL_LINK_RE = /(<link rel="stylesheet" href="\/_next\/static\/css\/[0-9a-f]+\.css" data-precedence="next"\/>)/;
const link = `<link rel="stylesheet" href="/_next/static/css/${cssName}"/>`;
let pages = 0;
for (const file of await walk(ROOT)) {
  const rel = relative(ROOT, file);
  const isHtml = /(^|\/)(index|404)\.html$/.test(rel);
  if (!isHtml) continue;
  let s = await readFile(file, 'utf8');
  const before = s;
  if (LINK_RE.test(s)) s = s.replace(LINK_RE, link);
  else if (GLOBAL_LINK_RE.test(s)) s = s.replace(GLOBAL_LINK_RE, `$1${link}`);
  else throw new Error(`no global stylesheet link in ${rel}`);
  if (s !== before) { await writeFile(file, s); pages++; }
}
console.log(`pages ${pages} updated`);
