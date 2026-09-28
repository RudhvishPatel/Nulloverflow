import { describe, expect, test } from 'vitest';
import { compileWaf } from '../../labs/05-siege/sim/waf';
import { ROUTES, DEFENCES, dealWaves, judge, emptyConfig, cost, START_GOLD, type Request, type Config } from '../../labs/05-siege/sim/siege';

const req = (over: Partial<Request>): Request => ({ id: 1, t: 0, route: '/', kind: 'visitor', client: 'c1', line: 'GET / HTTP/1.1', ...over });

describe('WAF regex guard', () => {
  test('rejects catastrophic patterns quickly', () => {
    const t0 = performance.now();
    const r = compileWaf('(a+)+$');
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/nested/i);
    expect(performance.now() - t0).toBeLessThan(50);
  });
  test('rejects invalid and over-long patterns', () => {
    expect(compileWaf('([a-z').ok).toBe(false);
    expect(compileWaf('a'.repeat(200)).ok).toBe(false);
  });
  test('a sane SQLi rule compiles, matches the attack and spares visitors', () => {
    const r = compileWaf("union\\s+select|'\\s*or\\s+1=1");
    expect(r.ok).toBe(true);
    expect(r.test!("GET /api/contact?q=' OR 1=1-- HTTP/1.1")).toBe(true);
    expect(r.test!('GET /api/contact?q=pricing HTTP/1.1')).toBe(false);
  });
});

describe('defences', () => {
  const cfg = (route: string, def: string, tier = 1): Config => { const c = emptyConfig(); c[route]![def] = tier; return c; };
  test('XSS is stopped by CSP on its route, nothing else', () => {
    const r = req({ route: '/api/contact', kind: 'xss', line: 'POST /api/contact body=<script>fetch(evil)</script>' });
    expect(judge(r, cfg('/api/contact', 'csp'), [], null).blocked).toBe(true);
    expect(judge(r, cfg('/api/contact', 'rate'), [], null).blocked).toBe(false);
    expect(judge(r, cfg('/', 'csp'), [], null).blocked).toBe(false);
  });
  test('SQL injection is only stopped by a WAF rule', () => {
    const r = req({ route: '/api/contact', kind: 'sqli', line: "GET /api/contact?q=' OR 1=1-- HTTP/1.1" });
    const all = emptyConfig();
    for (const d of DEFENCES) all['/api/contact']![d.id] = 2;
    expect(judge(r, all, [], null).blocked).toBe(false);
    expect(judge(r, emptyConfig(), [], compileWaf("'\\s*or\\s+1=1")).blocked).toBe(true);
  });
  test('rate limiting blocks the 4th request from one client in a window (tier 1) and the 3rd at tier 2', () => {
    const history = [req({ client: 'x', t: 0 }), req({ client: 'x', t: 1 })];
    const third = req({ client: 'x', t: 2, kind: 'stuffing', route: '/login' });
    const c1 = cfg('/login', 'rate', 1), c2 = cfg('/login', 'rate', 2);
    expect(judge(third, c1, history.map((h) => ({ ...h, route: '/login' })), null).blocked).toBe(false);
    expect(judge(third, c2, history.map((h) => ({ ...h, route: '/login' })), null).blocked).toBe(true);
  });
  test('an auth gate on a public route blocks real visitors (false positive)', () => {
    const r = judge(req({ route: '/', kind: 'visitor' }), cfg('/', 'auth'), [], null);
    expect(r.blocked).toBe(true);
    expect(r.falsePositive).toBe(true);
  });
  test('SSRF is contained by the secrets vault; scrapers by an auth gate', () => {
    expect(judge(req({ route: '/api/export', kind: 'ssrf', line: 'GET /api/export?url=http://169.254.169.254/latest/meta-data' }), cfg('/api/export', 'vault'), [], null).blocked).toBe(true);
    expect(judge(req({ route: '/api/export', kind: 'scraper' }), cfg('/api/export', 'auth'), [], null).blocked).toBe(true);
  });
});

describe('waves + economy', () => {
  test('three deterministic waves mixing visitors with every attack type by the end', () => {
    const a = dealWaves(9), b = dealWaves(9);
    expect(a.map((w) => w.length)).toEqual(b.map((w) => w.length));
    expect(a).toHaveLength(3);
    const kinds = new Set(a.flat().map((r) => r.kind));
    for (const k of ['visitor', 'stuffing', 'ddos', 'xss', 'sqli', 'scraper', 'ssrf']) expect(kinds.has(k as Request['kind'])).toBe(true);
    for (const w of a) for (const r of w) expect(ROUTES).toContain(r.route);
  });
  test('cost counts tiers across the config', () => {
    const c = emptyConfig();
    c['/login']!.rate = 2; c['/admin']!.auth = 1;
    expect(cost(c)).toBe(2 + 2);
    expect(START_GOLD).toBeGreaterThan(0);
  });
});
