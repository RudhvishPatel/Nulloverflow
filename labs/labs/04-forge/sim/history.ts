// Version history for prompts: every run is a commit; rollback moves HEAD; committing
// from an older version starts a new branch lane.
export const MAX_VERSIONS = 12;

export interface Version { id: string; n: number; parent: string | null; blocks: string[]; score: number; lane: number }

export class History {
  readonly versions: Version[] = [];
  head: string | null = null;

  get full(): boolean { return this.versions.length >= MAX_VERSIONS; }
  get best(): Version | null { return this.versions.reduce<Version | null>((a, v) => (!a || v.score > a.score ? v : a), null); }

  get(id: string): Version {
    const v = this.versions.find((x) => x.id === id);
    if (!v) throw new Error(`unknown version ${id}`);
    return v;
  }

  commit(blocks: string[], score: number): string {
    if (this.full) throw new Error('history is full');
    const parent = this.head ? this.get(this.head) : null;
    const siblings = this.versions.filter((v) => v.parent === (parent?.id ?? null));
    const lane = !parent ? 0 : siblings.length === 0 ? parent.lane : Math.max(...this.versions.map((v) => v.lane)) + 1;
    const v: Version = { id: `v${this.versions.length + 1}`, n: this.versions.length + 1, parent: parent?.id ?? null, blocks: [...blocks], score, lane };
    this.versions.push(v);
    this.head = v.id;
    return v.id;
  }

  checkout(id: string): Version {
    const v = this.get(id);
    this.head = v.id;
    return v;
  }
}

export type DiffOp = { op: 'same' | 'add' | 'del'; text: string };

/** Line diff via longest common subsequence. */
export function diffLines(a: string[], b: string[]): DiffOp[] {
  const m = a.length, n = b.length;
  const L = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) L[i]![j] = a[i] === b[j] ? L[i + 1]![j + 1]! + 1 : Math.max(L[i + 1]![j]!, L[i]![j + 1]!);
  const out: DiffOp[] = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) { out.push({ op: 'same', text: a[i]! }); i++; j++; }
    else if (L[i + 1]![j]! >= L[i]![j + 1]!) out.push({ op: 'del', text: a[i++]! });
    else out.push({ op: 'add', text: b[j++]! });
  }
  while (i < m) out.push({ op: 'del', text: a[i++]! });
  while (j < n) out.push({ op: 'add', text: b[j++]! });
  return out;
}
