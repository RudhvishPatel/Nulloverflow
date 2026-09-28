// A small multilayer perceptron with hand-written backprop and Adam, for 2-D binary
// classification. Weights are stored row-major per layer: w[i * out + j].
export type Activation = 'tanh' | 'relu' | 'gelu';

const C = Math.sqrt(2 / Math.PI);
const act = {
  tanh: { f: Math.tanh, d: (x: number) => 1 - Math.tanh(x) ** 2 },
  relu: { f: (x: number) => (x > 0 ? x : 0), d: (x: number) => (x > 0 ? 1 : 0) },
  gelu: {
    f: (x: number) => 0.5 * x * (1 + Math.tanh(C * (x + 0.044715 * x ** 3))),
    d: (x: number) => {
      const u = C * (x + 0.044715 * x ** 3), t = Math.tanh(u);
      return 0.5 * (1 + t) + 0.5 * x * (1 - t * t) * C * (1 + 3 * 0.044715 * x * x);
    },
  },
};
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

export interface Grads { w: Float64Array[]; b: Float64Array[] }
export interface StepOptions { lr: number; l2: number; batch: number; rand: () => number }

export class Net {
  readonly weights: Float64Array[] = [];
  readonly biases: Float64Array[] = [];
  private m: Float64Array[] = [];
  private v: Float64Array[] = [];
  private t = 0;

  constructor(readonly sizes: number[], readonly activation: Activation, rand: () => number) {
    for (let l = 0; l < sizes.length - 1; l++) {
      const fanIn = sizes[l]!, fanOut = sizes[l + 1]!;
      const scale = activation === 'relu' ? Math.sqrt(2 / fanIn) : Math.sqrt(1 / fanIn);
      const w = new Float64Array(fanIn * fanOut);
      for (let k = 0; k < w.length; k++) {
        const g = Math.sqrt(-2 * Math.log(Math.max(rand(), 1e-12))) * Math.cos(2 * Math.PI * rand());
        w[k] = g * scale;
      }
      this.weights.push(w);
      this.biases.push(new Float64Array(fanOut));
    }
    for (const arr of [...this.weights, ...this.biases]) { this.m.push(new Float64Array(arr.length)); this.v.push(new Float64Array(arr.length)); }
  }

  get params(): number { return this.weights.reduce((a, w) => a + w.length, 0) + this.biases.reduce((a, b) => a + b.length, 0); }

  /** Forward pass keeping pre-activations (z) and activations (a) per layer. */
  private forward(x: number[]): { zs: Float64Array[]; as: Float64Array[] } {
    const as: Float64Array[] = [Float64Array.from(x)], zs: Float64Array[] = [];
    const L = this.weights.length;
    for (let l = 0; l < L; l++) {
      const inp = as[l]!, w = this.weights[l]!, b = this.biases[l]!, out = b.length;
      const z = new Float64Array(out);
      for (let j = 0; j < out; j++) {
        let s = b[j]!;
        for (let i = 0; i < inp.length; i++) s += inp[i]! * w[i * out + j]!;
        z[j] = s;
      }
      zs.push(z);
      as.push(l === L - 1 ? z.map(sigmoid) : z.map(act[this.activation].f));
    }
    return { zs, as };
  }

  predict(x: number[]): number { const { as } = this.forward(x); return as[as.length - 1]![0]!; }

  private scratch: Float64Array[] | null = null;

  /** Allocation-free forward pass for rendering the decision boundary. */
  predictFast(x0: number, x1: number): number {
    const L = this.weights.length;
    if (!this.scratch) this.scratch = this.sizes.map((n) => new Float64Array(n));
    const s = this.scratch, f = act[this.activation].f;
    s[0]![0] = x0; s[0]![1] = x1;
    for (let l = 0; l < L; l++) {
      const inp = s[l]!, out = s[l + 1]!, w = this.weights[l]!, b = this.biases[l]!, n = out.length;
      for (let j = 0; j < n; j++) {
        let z = b[j]!;
        for (let i = 0; i < inp.length; i++) z += inp[i]! * w[i * n + j]!;
        out[j] = l === L - 1 ? sigmoid(z) : f(z);
      }
    }
    return s[L]![0]!;
  }

  lossAndGrads(xs: number[][], ys: number[], l2: number): { loss: number; grads: Grads } {
    const L = this.weights.length;
    const gw = this.weights.map((w) => new Float64Array(w.length)), gb = this.biases.map((b) => new Float64Array(b.length));
    let loss = 0;
    const n = xs.length;
    for (let s = 0; s < n; s++) {
      const { zs, as } = this.forward(xs[s]!);
      const p = Math.min(1 - 1e-12, Math.max(1e-12, as[L]![0]!)), y = ys[s]!;
      loss += -(y * Math.log(p) + (1 - y) * Math.log(1 - p));
      let delta = Float64Array.of(p - y); // dLoss/dz at the sigmoid output (BCE)
      for (let l = L - 1; l >= 0; l--) {
        const inp = as[l]!, out = delta.length, w = this.weights[l]!;
        for (let i = 0; i < inp.length; i++) for (let j = 0; j < out; j++) gw[l]![i * out + j]! += inp[i]! * delta[j]!;
        for (let j = 0; j < out; j++) gb[l]![j]! += delta[j]!;
        if (l > 0) {
          const prev = new Float64Array(inp.length);
          for (let i = 0; i < inp.length; i++) {
            let s2 = 0;
            for (let j = 0; j < out; j++) s2 += w[i * out + j]! * delta[j]!;
            prev[i] = s2 * act[this.activation].d(zs[l - 1]![i]!);
          }
          delta = prev;
        }
      }
    }
    loss /= n;
    let reg = 0;
    for (let l = 0; l < L; l++) {
      const w = this.weights[l]!;
      for (let k = 0; k < w.length; k++) { gw[l]![k] = gw[l]![k]! / n + l2 * w[k]!; reg += w[k]! * w[k]!; }
      for (let j = 0; j < gb[l]!.length; j++) gb[l]![j]! /= n;
    }
    return { loss: loss + 0.5 * l2 * reg, grads: { w: gw, b: gb } };
  }

  /** One Adam step on a random mini-batch. Returns the batch loss. */
  trainStep(xs: number[][], ys: number[], o: StepOptions): number {
    const idx = Array.from({ length: Math.min(o.batch, xs.length) }, () => Math.floor(o.rand() * xs.length));
    const { loss, grads } = this.lossAndGrads(idx.map((i) => xs[i]!), idx.map((i) => ys[i]!), o.l2);
    this.t++;
    const b1 = 0.9, b2 = 0.999, c1 = 1 - b1 ** this.t, c2 = 1 - b2 ** this.t;
    const params = [...this.weights, ...this.biases], gs = [...grads.w, ...grads.b];
    params.forEach((p, k) => {
      const g = gs[k]!, m = this.m[k]!, v = this.v[k]!;
      for (let i = 0; i < p.length; i++) {
        m[i] = b1 * m[i]! + (1 - b1) * g[i]!;
        v[i] = b2 * v[i]! + (1 - b2) * g[i]! * g[i]!;
        p[i]! -= (o.lr * (m[i]! / c1)) / (Math.sqrt(v[i]! / c2) + 1e-8);
      }
    });
    return loss;
  }
}
