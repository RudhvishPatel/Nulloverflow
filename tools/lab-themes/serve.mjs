// Static server for local QA that sends the same security headers as ../../.htaccess
// (minus the HTTPS redirect and HSTS, which don't apply on http://127.0.0.1).
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const PORT = Number(process.env.PORT || 8081);

const CSP = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";
const HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': CSP,
  'Cache-Control': 'no-store',
};
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon',
};

async function resolveFile(urlPath) {
  const p = normalize(join(ROOT, decodeURIComponent(urlPath)));
  if (!p.startsWith(ROOT)) return null;
  try {
    const s = await stat(p);
    if (s.isDirectory()) return (await stat(join(p, 'index.html')).catch(() => null)) ? join(p, 'index.html') : null;
    return p;
  } catch { return null; }
}

http.createServer(async (req, res) => {
  const urlPath = new URL(req.url, 'http://x').pathname;
  let file = await resolveFile(urlPath);
  let status = 200;
  if (!file) { file = join(ROOT, '404.html'); status = 404; }
  res.writeHead(status, { ...HEADERS, 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
  res.end(await readFile(file));
}).listen(PORT, '127.0.0.1', () => console.log(`serving ${ROOT} on http://127.0.0.1:${PORT}`));
