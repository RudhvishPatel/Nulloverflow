import { expect, test } from 'vitest';
import { mountLab } from '../../core/shell';

test('finds the themed root and removes the loading line when ready', () => {
  document.body.innerHTML = '<main><div class="lab-golf"><p class="lab-loading">&gt; warming</p></div></main>';
  const stage = mountLab('lab-golf');
  expect(stage.root.className).toBe('lab-golf');
  stage.ready();
  expect(document.querySelector('.lab-loading')).toBeNull();
});
test('throws a clear error when the page is missing its root', () => {
  document.body.innerHTML = '<main></main>';
  expect(() => mountLab('lab-golf')).toThrow('lab root .lab-golf missing');
});
