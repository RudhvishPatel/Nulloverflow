// The Vision Lab CNN in plain TypeScript: int8 weights dequantised on load, a forward pass
// that keeps every intermediate feature map, a backward pass for input saliency, and
// MNIST-style preprocessing for hand-drawn digits.
//   conv 1→8 (3×3) · ReLU · maxpool 2 → conv 8→16 (3×3) · ReLU · maxpool 2 → dense 400→32 · ReLU → dense 32→10

interface Tensor { shape: number[]; scale: number; data: string }
export interface Model { w1: Float32Array; b1: Float32Array; w2: Float32Array; b2: Float32Array; w3: Float32Array; b3: Float32Array; w4: Float32Array; b4: Float32Array; accuracy: number }

function dequant(t: Tensor): Float32Array {
  const bin = atob(t.data);
  const out = new Float32Array(bin.length);
  for (let i = 0; i < bin.length; i++) { const v = bin.charCodeAt(i); out[i] = (v > 127 ? v - 256 : v) * t.scale; }
  return out;
}

export function loadModel(json: { accuracy: number; tensors: Record<string, Tensor> }): Model {
  const t = json.tensors;
  return {
    w1: dequant(t['c1.weight']!), b1: dequant(t['c1.bias']!), w2: dequant(t['c2.weight']!), b2: dequant(t['c2.bias']!),
    w3: dequant(t['f1.weight']!), b3: dequant(t['f1.bias']!), w4: dequant(t['f2.weight']!), b4: dequant(t['f2.bias']!), accuracy: json.accuracy,
  };
}

/** Valid 3×3 convolution. in: [C][H][W] flat, w: [O][C][3][3]. */
function conv(input: Float32Array, C: number, H: number, W: number, w: Float32Array, b: Float32Array, O: number): Float32Array {
  const oh = H - 2, ow = W - 2, out = new Float32Array(O * oh * ow);
  for (let o = 0; o < O; o++) for (let y = 0; y < oh; y++) for (let x = 0; x < ow; x++) {
    let s = b[o]!;
    for (let c = 0; c < C; c++) for (let ky = 0; ky < 3; ky++) for (let kx = 0; kx < 3; kx++) s += w[((o * C + c) * 3 + ky) * 3 + kx]! * input[(c * H + y + ky) * W + x + kx]!;
    out[(o * oh + y) * ow + x] = s;
  }
  return out;
}

/** 2×2 max-pool (floor), returning values and the flat index each came from. */
function pool(input: Float32Array, C: number, H: number, W: number): { out: Float32Array; arg: Int32Array; H: number; W: number } {
  const ph = Math.floor(H / 2), pw = Math.floor(W / 2), out = new Float32Array(C * ph * pw), arg = new Int32Array(C * ph * pw);
  for (let c = 0; c < C; c++) for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) {
    let best = -Infinity, bi = 0;
    for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) { const i = (c * H + 2 * y + dy) * W + 2 * x + dx; if (input[i]! > best) { best = input[i]!; bi = i; } }
    const o = (c * ph + y) * pw + x;
    out[o] = best; arg[o] = bi;
  }
  return { out, arg, H: ph, W: pw };
}

const relu = (a: Float32Array) => a.map((v) => (v > 0 ? v : 0));

export interface Forward {
  logits: number[];
  probs: number[];
  maps1: Float32Array[];   // 8 × 26×26 (after ReLU)
  maps2: Float32Array[];   // 16 × 11×11 (after ReLU)
  hidden: Float32Array;    // 32
  cache: { x: Float32Array; z1: Float32Array; a1: Float32Array; p1: ReturnType<typeof pool>; z2: Float32Array; a2: Float32Array; p2: ReturnType<typeof pool>; z3: Float32Array };
}

export function forward(m: Model, x: Float32Array): Forward {
  const z1 = conv(x, 1, 28, 28, m.w1, m.b1, 8), a1 = relu(z1), p1 = pool(a1, 8, 26, 26);
  const z2 = conv(p1.out, 8, 13, 13, m.w2, m.b2, 16), a2 = relu(z2), p2 = pool(a2, 16, 11, 11);
  const z3 = new Float32Array(32);
  for (let j = 0; j < 32; j++) { let s = m.b3[j]!; for (let i = 0; i < 400; i++) s += m.w3[j * 400 + i]! * p2.out[i]!; z3[j] = s; }
  const h = relu(z3);
  const logits = Array.from({ length: 10 }, (_, k) => { let s = m.b4[k]!; for (let j = 0; j < 32; j++) s += m.w4[k * 32 + j]! * h[j]!; return s; });
  const mx = Math.max(...logits), e = logits.map((v) => Math.exp(v - mx)), sum = e.reduce((a, b) => a + b, 0);
  return {
    logits, probs: e.map((v) => v / sum),
    maps1: Array.from({ length: 8 }, (_, c) => a1.slice(c * 676, (c + 1) * 676)),
    maps2: Array.from({ length: 16 }, (_, c) => a2.slice(c * 121, (c + 1) * 121)),
    hidden: h,
    cache: { x, z1, a1, p1, z2, a2, p2, z3 },
  };
}

/** d logit[cls] / d input, by backprop through dense → pool → conv → pool → conv. */
export function saliency(m: Model, x: Float32Array, cls: number): Float32Array {
  const { cache: k } = forward(m, x);
  const gz3 = new Float32Array(32);
  for (let j = 0; j < 32; j++) gz3[j] = k.z3[j]! > 0 ? m.w4[cls * 32 + j]! : 0;
  const gp2 = new Float32Array(400);
  for (let i = 0; i < 400; i++) { let s = 0; for (let j = 0; j < 32; j++) s += gz3[j]! * m.w3[j * 400 + i]!; gp2[i] = s; }
  const gz2 = new Float32Array(16 * 121);
  gp2.forEach((g, o) => { const i = k.p2.arg[o]!; if (k.z2[i]! > 0) gz2[i]! += g; });
  const gp1 = new Float32Array(8 * 169);
  for (let o = 0; o < 16; o++) for (let y = 0; y < 11; y++) for (let xx = 0; xx < 11; xx++) {
    const g = gz2[(o * 11 + y) * 11 + xx]!;
    if (!g) continue;
    for (let c = 0; c < 8; c++) for (let ky = 0; ky < 3; ky++) for (let kx = 0; kx < 3; kx++) gp1[(c * 13 + y + ky) * 13 + xx + kx]! += g * m.w2[((o * 8 + c) * 3 + ky) * 3 + kx]!;
  }
  const gz1 = new Float32Array(8 * 676);
  gp1.forEach((g, o) => { const i = k.p1.arg[o]!; if (k.z1[i]! > 0) gz1[i]! += g; });
  const gx = new Float32Array(784);
  for (let o = 0; o < 8; o++) for (let y = 0; y < 26; y++) for (let xx = 0; xx < 26; xx++) {
    const g = gz1[(o * 26 + y) * 26 + xx]!;
    if (!g) continue;
    for (let ky = 0; ky < 3; ky++) for (let kx = 0; kx < 3; kx++) gx[(y + ky) * 28 + xx + kx]! += g * m.w1[(o * 3 + ky) * 3 + kx]!;
  }
  return gx;
}

/** MNIST-style: fit the ink's bounding box into 20×20, then shift its centre of mass to (14, 14). */
export function centre(raw: Float32Array): Float32Array {
  let x0 = 28, x1 = -1, y0 = 28, y1 = -1;
  for (let y = 0; y < 28; y++) for (let x = 0; x < 28; x++) if (raw[y * 28 + x]! > 0.05) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const out = new Float32Array(784);
  if (x1 < 0) return out;
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1, s = 20 / Math.max(bw, bh);
  const nw = Math.max(1, Math.round(bw * s)), nh = Math.max(1, Math.round(bh * s));
  const ox = Math.floor((28 - nw) / 2), oy = Math.floor((28 - nh) / 2);
  const sample = (fx: number, fy: number) => {
    const ix = Math.min(27, Math.max(0, Math.floor(fx))), iy = Math.min(27, Math.max(0, Math.floor(fy)));
    const tx = fx - ix, ty = fy - iy, at = (x: number, y: number) => raw[Math.min(27, y) * 28 + Math.min(27, x)]!;
    return at(ix, iy) * (1 - tx) * (1 - ty) + at(ix + 1, iy) * tx * (1 - ty) + at(ix, iy + 1) * (1 - tx) * ty + at(ix + 1, iy + 1) * tx * ty;
  };
  const tmp = new Float32Array(784);
  for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) tmp[(oy + y) * 28 + ox + x] = Math.min(1, sample(x0 + (x + 0.5) / s - 0.5, y0 + (y + 0.5) / s - 0.5));
  let mx = 0, my = 0, mass = 0;
  tmp.forEach((v, i) => { mx += (i % 28) * v; my += Math.floor(i / 28) * v; mass += v; });
  const dx = Math.round(14 - mx / mass), dy = Math.round(14 - my / mass);
  for (let y = 0; y < 28; y++) for (let x = 0; x < 28; x++) {
    const sx = x - dx, sy = y - dy;
    if (sx >= 0 && sx < 28 && sy >= 0 && sy < 28) out[y * 28 + x] = tmp[sy * 28 + sx]!;
  }
  return out;
}
