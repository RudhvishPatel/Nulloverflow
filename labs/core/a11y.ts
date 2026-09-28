// Accessibility helpers shared by every lab.
export function prefersReducedMotion(): boolean {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let region: HTMLElement | null = null;

/** Politely announce a game event (score, result) to screen readers. */
export function announce(text: string): void {
  if (!region) {
    region = document.createElement('p');
    region.className = 'sr-only';
    region.setAttribute('aria-live', 'polite');
    document.body.append(region);
  }
  region.textContent = '';
  requestAnimationFrame(() => { if (region) region.textContent = text; });
}

/** Keyboard shortcuts, ignored while typing in form fields. Returns an unsubscribe. */
export function onKeys(map: Record<string, (e: KeyboardEvent) => void>): () => void {
  const handler = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && e.key !== 'Escape') return;
    const fn = map[e.key];
    if (fn) { e.preventDefault(); fn(e); }
  };
  addEventListener('keydown', handler);
  return () => removeEventListener('keydown', handler);
}
