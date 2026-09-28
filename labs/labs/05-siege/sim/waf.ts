// The player's WAF rule: a regex, compiled defensively. Catastrophic-backtracking shapes
// (a quantified group that itself contains a quantifier) are refused before they can hang the page.
export interface Waf { ok: boolean; reason?: string; test?: (line: string) => boolean; source?: string }

const MAX_LEN = 80;
const NESTED = /\((?:[^()\\]|\\.)*[+*}](?:[^()\\]|\\.)*\)\s*[+*{]/;

export function compileWaf(pattern: string): Waf {
  const p = pattern.trim();
  if (!p) return { ok: false, reason: 'Empty rule.' };
  if (p.length > MAX_LEN) return { ok: false, reason: `Keep rules under ${MAX_LEN} characters.` };
  if (NESTED.test(p)) return { ok: false, reason: 'Nested quantifiers like (a+)+ can backtrack catastrophically (ReDoS). Flatten the group.' };
  let re: RegExp;
  try {
    re = new RegExp(p, 'i');
  } catch (e) {
    return { ok: false, reason: `Invalid regex: ${(e as Error).message}` };
  }
  return { ok: true, source: p, test: (line) => re.test(line.slice(0, 300)) };
}
