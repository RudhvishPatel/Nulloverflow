import { describe, expect, test } from 'vitest';
import { BLOCKS, blockById, BUDGET, tokens } from '../../labs/04-forge/sim/blocks';
import { TESTS, ATTACKS, evaluate, dealDay } from '../../labs/04-forge/sim/judge';
import { History, diffLines, MAX_VERSIONS } from '../../labs/04-forge/sim/history';

const ids = (...xs: string[]) => xs;

describe('blocks + budget', () => {
  test('every block has a kind and a positive token cost; the full set does not fit the budget', () => {
    for (const b of BLOCKS) { expect(['role', 'rule', 'example', 'defence']).toContain(b.kind); expect(b.tokens).toBeGreaterThan(0); }
    expect(tokens(BLOCKS.map((b) => b.id))).toBeGreaterThan(BUDGET);
  });
  test('evaluate refuses an over-budget prompt', () => {
    const r = evaluate(BLOCKS.map((b) => b.id), dealDay(1));
    expect(r.overBudget).toBe(true);
    expect(r.score).toBe(0);
  });
});

describe('tests (scripted regression)', () => {
  const day = { tests: TESTS, attacks: [] as typeof ATTACKS };
  const pass = (prompt: string[], id: string) => evaluate(prompt, day).tests.find((t) => t.id === id)!.pass;
  test('JSON example must follow its rule', () => {
    expect(pass(ids('rule-json', 'ex-json'), 'json-order')).toBe(true);
    expect(pass(ids('ex-json', 'rule-json'), 'json-order')).toBe(false);
  });
  test('the chatty persona breaks brevity and the refund-dispute tone', () => {
    expect(pass(ids('role-billing', 'rule-brief'), 'brief')).toBe(true);
    expect(pass(ids('role-chatty', 'rule-brief'), 'brief')).toBe(false);
  });
  test('"always sound sure" breaks abstention', () => {
    expect(pass(ids('rule-abstain'), 'abstain')).toBe(true);
    expect(pass(ids('rule-abstain', 'rule-sure'), 'abstain')).toBe(false);
  });
  test('examples must come after every rule', () => {
    expect(pass(ids('rule-json', 'rule-brief', 'ex-json'), 'examples-last')).toBe(true);
    expect(pass(ids('rule-json', 'ex-json', 'rule-brief'), 'examples-last')).toBe(false);
  });
});

describe('red-team attacks', () => {
  test.each(ATTACKS.map((a) => [a.id, a] as const))('%s is blocked exactly when its defence is present', (_id, a) => {
    const day = { tests: [] as typeof TESTS, attacks: [a] };
    expect(evaluate([a.defence], day).attacks[0]!.blocked).toBe(true);
    const others = BLOCKS.filter((b) => b.id !== a.defence).map((b) => b.id).slice(0, 3);
    expect(evaluate(others.filter((x) => x !== a.defence), day).attacks[0]!.blocked).toBe(false);
  });
});

describe('dealDay + score', () => {
  test('deterministic: 8 tests and 3 waves of 3 distinct attacks', () => {
    const a = dealDay(4), b = dealDay(4);
    expect(a.tests.map((t) => t.id)).toEqual(b.tests.map((t) => t.id));
    expect(a.tests).toHaveLength(8);
    expect(a.attacks).toHaveLength(9);
    expect(new Set(a.attacks.map((x) => x.id)).size).toBe(9);
  });
  test('a perfect in-budget prompt exists for every day (the puzzle is solvable)', () => {
    for (let seed = 1; seed <= 15; seed++) {
      const day = dealDay(seed);
      const best = evaluate(day.solution, day);
      expect(best.overBudget).toBe(false);
      expect(best.tests.every((t) => t.pass)).toBe(true);
      expect(best.score).toBeGreaterThanOrEqual(80);
    }
  });
});

describe('history', () => {
  test('commits chain, rollback moves HEAD, and a new commit after rollback branches', () => {
    const h = new History();
    const v1 = h.commit(['rule-json'], 40);
    const v2 = h.commit(['rule-json', 'ex-json'], 60);
    expect(h.get(v2).parent).toBe(v1);
    h.checkout(v1);
    expect(h.head).toBe(v1);
    const v3 = h.commit(['rule-json', 'rule-brief'], 55);
    expect(h.get(v3).parent).toBe(v1);
    expect(h.get(v3).lane).not.toBe(h.get(v2).lane);
    expect(h.best!.id).toBe(v2);
  });
  test(`stops at ${MAX_VERSIONS} versions`, () => {
    const h = new History();
    for (let i = 0; i < MAX_VERSIONS; i++) h.commit([], i);
    expect(h.full).toBe(true);
    expect(() => h.commit([], 1)).toThrow();
  });
  test('diffLines marks additions and removals', () => {
    const d = diffLines(['a', 'b', 'c'], ['a', 'c', 'd']);
    expect(d).toEqual([{ op: 'same', text: 'a' }, { op: 'del', text: 'b' }, { op: 'same', text: 'c' }, { op: 'add', text: 'd' }]);
  });
  test('blockById throws on an unknown id', () => { expect(() => blockById('nope')).toThrow(); });
});
