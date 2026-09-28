import { afterEach, expect, test } from 'vitest';
import { detectTier } from '../../core/quality';

afterEach(() => history.replaceState(null, '', '/'));

test('honours the ?quality= override', () => {
  history.replaceState(null, '', '/?quality=low');
  expect(detectTier()).toBe('low');
  history.replaceState(null, '', '/?quality=high');
  expect(detectTier()).toBe('high');
});
test('falls back to low when WebGL2 is unavailable (jsdom has none)', () => {
  expect(detectTier()).toBe('low');
});
