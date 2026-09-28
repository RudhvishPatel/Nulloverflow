import { describe, expect, test } from 'vitest';
// @ts-expect-error: plain ESM script without types
import { plainLabLinks } from '../../scripts/patch-hub.mjs';

const raw = '["$","li","/lab/01",{"children":["$","$L7",null,{"href":"/lab/01","className":"lab-card"}]}],["$","$L7",null,{"href":"/lab/blog/"}]';
const escaped = raw.replace(/"/g, '\\"');

test('converts lab card Links to plain anchors with a trailing slash (raw RSC)', () => {
  const { out, count } = plainLabLinks(raw, false);
  expect(count).toBe(1);
  expect(out).toContain('["$","a",null,{"href":"/lab/01/"');
  expect(out).toContain('["$","$L7",null,{"href":"/lab/blog/"}]'); // non-lab links untouched
});

test('handles the escaped copy embedded in index.html', () => {
  const { out, count } = plainLabLinks(escaped, true);
  expect(count).toBe(1);
  expect(out).toContain('[\\"$\\",\\"a\\",null,{\\"href\\":\\"/lab/01/\\"');
});

test('is idempotent', () => {
  const once = plainLabLinks(raw, false).out;
  expect(plainLabLinks(once, false).count).toBe(0);
});

// @ts-expect-error: plain ESM script without types
import { upsertCard, setLiveCount } from '../../scripts/patch-hub.mjs';

const card08html = '<ul class="lab-grid lab-grid-8"><li><a class="lab-card" href="/lab/08/"><span class="lab-card-top"><span class="mono">lab/<!-- -->08</span><span class="lab-live mono">live</span></span><span class="lab-card-title">Attention Lens</span><span class="lab-card-kind mono">illustrative attention</span><span class="lab-card-blurb">Hover words.</span><span class="lab-card-go mono">play →</span></a></li></ul>';
const card08rsc = '["$","li","/lab/08",{"children":["$","a",null,{"href":"/lab/08/","className":"lab-card","children":[["$","span",null,{"className":"lab-card-top","children":[["$","span",null,{"className":"mono","children":["lab/","08"]}],["$","span",null,{"className":"lab-live mono","children":"live"}]]}],["$","span",null,{"className":"lab-card-title","children":"Attention Lens"}],["$","span",null,{"className":"lab-card-kind mono","children":"illustrative attention"}],["$","span",null,{"className":"lab-card-blurb","children":"Hover words."}],["$","span",null,{"className":"lab-card-go mono","children":"play →"}]]}]}]';

describe('hub cards', () => {
  const card = { n: '09', title: 'Neuron Foundry', kind: 'live training', blurb: "Train a net; it's live." };
  test('adds a new card after the last one in HTML, raw RSC and escaped RSC', () => {
    const html = upsertCard(card08html, card, 'html');
    expect(html).toContain('href="/lab/09/"');
    expect(html).toContain('<span class="lab-card-blurb">Train a net; it&#x27;s live.</span>');
    expect(html.indexOf('/lab/09/')).toBeGreaterThan(html.indexOf('/lab/08/'));
    const raw = upsertCard(card08rsc, card, 'raw');
    expect(raw).toContain('["$","li","/lab/09",');
    expect(JSON.parse(`[${raw}]`)).toHaveLength(2);
    const esc = upsertCard(card08rsc.replace(/"/g, '\\"'), card, 'escaped');
    expect(esc).toContain('[\\"$\\",\\"li\\",\\"/lab/09\\"');
  });
  test('updates an existing card in place and is idempotent', () => {
    const once = upsertCard(card08html, { n: '08', title: 'Attention Lens', kind: '12 heads', blurb: 'New blurb.' }, 'html');
    expect(once).toContain('<span class="lab-card-kind mono">12 heads</span>');
    expect(once).toContain('New blurb.');
    expect(upsertCard(once, { n: '08', title: 'Attention Lens', kind: '12 heads', blurb: 'New blurb.' }, 'html')).toBe(once);
    const raw = upsertCard(card08rsc, { n: '08', title: 'Attention Lens', kind: '12 heads', blurb: 'New.' }, 'raw');
    expect(raw).toContain('"children":"12 heads"');
  });
  test('setLiveCount rewrites the "N live" counter', () => {
    expect(setLiveCount('phosphor · <!-- -->8<!-- --> live', 12, 'html')).toBe('phosphor · <!-- -->12<!-- --> live');
    expect(setLiveCount('"interactive · phosphor · ",8," live"', 12, 'raw')).toBe('"interactive · phosphor · ",12," live"');
  });
});

describe('hub cards in lazily-streamed rows', () => {
  // The real hub: the list holds early cards inline and later cards as "$L<row>" references.
  const listRow = '4:["$","ul",null,{"className":"lab-grid","children":[["$","li","/lab/01",{"children":"x"}],"$Ld"]}]';
  const cardRow = card08rsc.replace('["$","li","/lab/08"', 'd:["$","li","/lab/08"');
  const payload = `${listRow}\n${cardRow}\n`;
  const card = { n: '09', title: 'Neuron Foundry', kind: 'live', blurb: 'Train.' };
  test('a new card goes into the list after the lazy reference, keeping every row valid JSON', () => {
    const out = upsertCard(payload, card, 'raw');
    for (const line of out.trim().split('\n')) expect(() => JSON.parse(line.slice(line.indexOf(':') + 1))).not.toThrow();
    expect(out.split('\n')[0]).toContain('"$Ld",["$","li","/lab/09"');
  });
  test('the escaped (HTML-embedded) form behaves the same', () => {
    const esc = payload.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    const out = upsertCard(esc, card, 'escaped');
    expect(out).toContain('\\"$Ld\\",[\\"$\\",\\"li\\",\\"/lab/09\\"');
  });
});

test('replacing a card whose child is a lazy reference does not swallow later rows', () => {
  const list = '4:["$","ul",null,{"children":[["$","li","/lab/03",{"children":["$","a",null,{"href":"/lab/03/","className":"lab-card","children":[["$","span",null,{"className":"lab-card-title","children":"Old"}],"$L8"]}]}],"$L9"]}]';
  const payload = `${list}\n8:["$","span",null,{"className":"lab-card-go mono","children":"play →"}]\n9:${card08rsc.replace('/lab/08', '/lab/04').replace('/lab/08/', '/lab/04/')}\n`;
  const out = upsertCard(payload, { n: '03', title: 'New', kind: 'k', blurb: 'b' }, 'raw');
  expect(out).toContain('"$L9"');
  expect(out).toContain('9:["$","li","/lab/04"');
  for (const line of out.trim().split('\n')) expect(() => JSON.parse(line.slice(line.indexOf(':') + 1))).not.toThrow();
});

test('setLiveCount also rewrites the escaped (HTML-embedded) counter', () => {
  expect(setLiveCount('[\\"interactive · phosphor · \\",8,\\" live\\"]', 12, 'escaped')).toBe('[\\"interactive · phosphor · \\",12,\\" live\\"]');
});
