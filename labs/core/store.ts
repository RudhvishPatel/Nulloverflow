// Per-visitor progress in localStorage. Storage can be missing or throw (private
// mode, blocked site data), so every access is guarded and falls back silently.
const PREFIX = 'n0-lab:';

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* progress just isn't kept */
  }
}
