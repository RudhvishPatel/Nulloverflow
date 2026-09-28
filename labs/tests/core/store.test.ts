import { afterEach, expect, test, vi } from 'vitest';
import { load, save } from '../../core/store';

afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); });

test('round-trips JSON values under a namespaced key', () => {
  save('best', { score: 12 });
  expect(load('best', null)).toEqual({ score: 12 });
  expect(localStorage.getItem('n0-lab:best')).toBe('{"score":12}');
});
test('returns the fallback for missing or corrupt values', () => {
  expect(load('missing', 7)).toBe(7);
  localStorage.setItem('n0-lab:bad', '{nope');
  expect(load('bad', 'x')).toBe('x');
});
test('never throws when storage is unavailable', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied'); });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('denied'); });
  expect(load('best', 3)).toBe(3);
  expect(() => save('best', 5)).not.toThrow();
});
