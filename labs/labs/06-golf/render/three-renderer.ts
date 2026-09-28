// High/medium tier: the loss surface as real 3D terrain.
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, CatmullRomCurve3, CircleGeometry, Color,
  ConeGeometry, CylinderGeometry, DirectionalLight, DoubleSide, Fog, Group, HemisphereLight, Mesh, MeshBasicMaterial,
  MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, Points, PointsMaterial, Scene, ShaderMaterial,
  SphereGeometry, SRGBColorSpace, TubeGeometry, Vector3, WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Tier } from '../../../core/quality';
import { pixelRatio } from '../../../core/quality';
import type { Hole } from '../sim/course';
import type { Vec2 } from '../sim/surfaces';
import { sampleHeightfield, type Heightfield } from './heightfield';
import { GHOST_COLOURS, shotDuration, type Renderer, type ShotView } from './types';

const WORLD = 20;          // terrain spans 20 world units on its long side
const HEIGHT = 4.2;        // normalised height 1 → 4.2 units
const BALL_R = 0.24;
const BASE = -1.6;         // bottom of the diorama skirt

const terrainVertex = /* glsl */ `
  varying float vH;
  varying vec3 vWorld;
  varying vec3 vNormal;
  void main() {
    vH = position.z;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const terrainFragment = /* glsl */ `
  uniform float uHeight;
  uniform vec3 uFog;
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vH;
  varying vec3 vWorld;
  varying vec3 vNormal;
  void main() {
    float h = clamp(vH / uHeight, 0.0, 1.0);
    // Green near the cup → fairway → rough → sand on the high ground.
    vec3 green = vec3(0.24, 0.62, 0.30);
    vec3 fairway = vec3(0.33, 0.66, 0.30);
    vec3 rough = vec3(0.35, 0.50, 0.22);
    vec3 sand = vec3(0.87, 0.78, 0.55);
    vec3 col = mix(green, fairway, smoothstep(0.02, 0.18, h));
    col = mix(col, rough, smoothstep(0.35, 0.6, h));
    col = mix(col, sand, smoothstep(0.75, 0.95, h));
    // Mown stripes.
    float stripe = step(0.5, fract((vWorld.x + vWorld.z) * 0.35));
    col *= mix(0.94, 1.05, stripe);
    // Contour lines every 1/14 of the height, anti-aliased with screen-space derivatives.
    float k = h * 14.0;
    float line = abs(fract(k - 0.5) - 0.5) / fwidth(k);
    col = mix(col * 0.72, col, clamp(line, 0.0, 1.0));
    // Lighting.
    vec3 L = normalize(vec3(0.4, 1.0, 0.3));
    float diff = clamp(dot(normalize(vNormal), L), 0.0, 1.0);
    col *= 0.45 + 0.65 * diff;
    // Fog.
    float d = length(vWorld - cameraPosition);
    col = mix(col, uFog, smoothstep(uFogNear, uFogFar, d));
    gl_FragColor = vec4(col, 1.0);
  }
`;

const flagVertex = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += sin(uTime * 4.0 + uv.x * 5.0) * 0.12 * uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const flagFragment = /* glsl */ `
  varying vec2 vUv;
  void main() { gl_FragColor = vec4(mix(vec3(0.84, 0.15, 0.24), vec3(0.7, 0.1, 0.18), vUv.x), 1.0); }
`;

function skyTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 4; c.height = 256;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#5fa8e8');
  grad.addColorStop(0.55, '#bfe0f5');
  grad.addColorStop(1, '#fdf2d8');
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 256);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const frame = () => new Promise<number>((r) => requestAnimationFrame(r));

export class ThreeRenderer implements Renderer {
  readonly kind = '3d' as const;
  readonly canvas: HTMLCanvasElement;
  private gl: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(38, 1, 0.1, 400);
  private controls: OrbitControls;
  private course = new Group();
  private trails = new Group();
  private ball: Mesh;
  private flag = new Group();
  private flagMat: ShaderMaterial;
  private confetti: Points | null = null;
  private hole: Hole | null = null;
  private hf: Heightfield | null = null;
  private sx = 1;
  private sz = 1;
  private raf = 0;
  private t0 = performance.now();
  private follow: Vector3 | null = null;
  /** Where the camera looks when not following the ball. */
  private centre = new Vector3();

  constructor(private tier: Tier) {
    this.gl = new WebGLRenderer({ antialias: tier === 'high', powerPreference: 'high-performance' });
    this.gl.setPixelRatio(pixelRatio(tier));
    this.gl.outputColorSpace = SRGBColorSpace;
    this.canvas = this.gl.domElement;
    this.canvas.className = 'golf-canvas golf-canvas-3d';
    this.scene.background = skyTexture();
    this.scene.fog = new Fog(0xdbeaf2, 30, 90);
    this.scene.add(new HemisphereLight(0xeaf6ff, 0x3c6b35, 1.1));
    const sun = new DirectionalLight(0xffffff, 1.6);
    sun.position.set(8, 20, 6);
    this.scene.add(sun, this.course, this.trails);

    this.ball = new Mesh(new SphereGeometry(BALL_R, 24, 16), new MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 }));
    this.scene.add(this.ball);

    this.flagMat = new ShaderMaterial({ vertexShader: flagVertex, fragmentShader: flagFragment, uniforms: { uTime: { value: 0 } }, side: DoubleSide });
    const pole = new Mesh(new CylinderGeometry(0.03, 0.03, 2.4, 8), new MeshStandardMaterial({ color: 0xfdfaf0 }));
    pole.position.y = 1.2;
    const cloth = new Mesh(new PlaneGeometry(1, 0.6, 12, 4), this.flagMat);
    cloth.position.set(0.5, 2.1, 0);
    const cup = new Mesh(new CircleGeometry(0.26, 32), new MeshBasicMaterial({ color: 0x0b140d }));
    cup.rotation.x = -Math.PI / 2;
    cup.position.y = 0.02;
    const rim = new Mesh(new CircleGeometry(0.34, 32), new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }));
    rim.rotation.x = -Math.PI / 2;
    rim.position.y = 0.015;
    this.flag.add(pole, cloth, rim, cup);
    this.scene.add(this.flag);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.maxPolarAngle = Math.PI * 0.47;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 60;

    const tick = () => {
      this.raf = requestAnimationFrame(tick);
      const t = (performance.now() - this.t0) / 1000;
      this.flagMat.uniforms.uTime!.value = t;
      if (this.follow) this.controls.target.lerp(this.follow, 0.08);
      this.controls.update();
      this.stepConfetti();
      this.gl.render(this.scene, this.camera);
    };
    tick();
  }

  /** Domain (x, y) → world position on the terrain surface. */
  private toWorld([px, py]: Vec2, lift = 0): Vector3 {
    const [x0, x1, y0, y1] = this.hole!.surface.bounds;
    // Off-course points (a wild shot) are drawn on the course edge, never above the sky.
    const x = Math.min(x1, Math.max(x0, px)), y = Math.min(y1, Math.max(y0, py));
    const wx = ((x - x0) / (x1 - x0) - 0.5) * this.sx;
    const wz = -((y - y0) / (y1 - y0) - 0.5) * this.sz;
    return new Vector3(wx, this.hf!.heightAt([x, y]) * HEIGHT + lift, wz);
  }

  async setHole(hole: Hole, ball: Vec2, flyover: boolean): Promise<void> {
    this.hole = hole;
    this.course.clear();
    this.clearTrails();
    const n = this.tier === 'high' ? 200 : this.tier === 'medium' ? 130 : 90;
    this.hf = sampleHeightfield(hole.surface, n);
    const [x0, x1, y0, y1] = hole.surface.bounds;
    const aspect = (x1 - x0) / (y1 - y0);
    this.sx = aspect >= 1 ? WORLD : WORLD * aspect;
    this.sz = aspect >= 1 ? WORLD / aspect : WORLD;

    const geo = new PlaneGeometry(this.sx, this.sz, n - 1, n - 1);
    const pos = geo.attributes.position as BufferAttribute;
    // PlaneGeometry rows run top (+y) to bottom; our grid row 0 is yMin (bottom).
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) pos.setZ(j * n + i, this.hf.h[(n - 1 - j) * n + i]! * HEIGHT);
    geo.computeVertexNormals();
    const mat = new ShaderMaterial({
      vertexShader: terrainVertex,
      fragmentShader: terrainFragment,
      uniforms: { uHeight: { value: HEIGHT }, uFog: { value: new Color(0xdbeaf2) }, uFogNear: { value: 30 }, uFogFar: { value: 90 } },
    });
    const terrain = new Mesh(geo, mat);
    terrain.rotation.x = -Math.PI / 2;
    this.course.add(terrain, this.skirt(n));

    // Tee marker.
    const tee = new Mesh(new ConeGeometry(0.12, 0.3, 12), new MeshStandardMaterial({ color: 0xe07a1f }));
    tee.position.copy(this.toWorld(hole.tee, 0.15));
    this.course.add(tee);

    this.flag.position.copy(this.toWorld(hole.cup, 0));
    this.placeBall(ball);

    const target = new Vector3(0, HEIGHT * 0.15, 0);
    this.centre.copy(target);
    const rest = target.clone().add(new Vector3(0, WORLD * 1.02, WORLD * 0.74));
    this.follow = null;
    this.controls.target.copy(target);
    if (!flyover) {
      this.camera.position.copy(rest);
      return;
    }
    // Cinematic flyover: sweep in from a high, wide orbit.
    const start = target.clone().add(new Vector3(-WORLD * 1.1, WORLD * 1.2, -WORLD * 0.4));
    const dur = 2.2;
    const t0 = performance.now();
    for (;;) {
      const t = Math.min(1, (performance.now() - t0) / 1000 / dur);
      const e = easeInOut(t);
      const p = start.clone().lerp(rest, e);
      p.y += Math.sin(e * Math.PI) * 4;
      this.camera.position.copy(p);
      this.controls.target.copy(target);
      if (t >= 1) break;
      await frame();
    }
  }

  /** Earth walls from the terrain edge down to the base, so the course reads as a diorama. */
  private skirt(n: number): Mesh {
    const hf = this.hf!, W = this.sx, D = this.sz;
    const edge: Vector3[] = [];
    const at = (i: number, j: number) => new Vector3((i / (n - 1) - 0.5) * W, hf.h[j * n + i]! * HEIGHT, -(j / (n - 1) - 0.5) * D);
    for (let i = 0; i < n; i++) edge.push(at(i, 0));
    for (let j = 1; j < n; j++) edge.push(at(n - 1, j));
    for (let i = n - 2; i >= 0; i--) edge.push(at(i, n - 1));
    for (let j = n - 2; j >= 0; j--) edge.push(at(0, j));
    const pos = new Float32Array(edge.length * 2 * 3), col = new Float32Array(edge.length * 2 * 3);
    const top = new Color('#6b4a2b'), bottom = new Color('#2e2016');
    edge.forEach((v, k) => {
      pos.set([v.x, v.y, v.z, v.x, BASE, v.z], k * 6);
      col.set([top.r, top.g, top.b, bottom.r, bottom.g, bottom.b], k * 6);
    });
    const idx: number[] = [];
    for (let k = 0; k < edge.length - 1; k++) { const a = k * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(pos, 3));
    geo.setAttribute('color', new BufferAttribute(col, 3));
    geo.setIndex(idx);
    return new Mesh(geo, new MeshBasicMaterial({ vertexColors: true, side: DoubleSide }));
  }

  placeBall(p: Vec2): void {
    if (this.hole) this.ball.position.copy(this.toWorld(p, BALL_R));
  }

  private tube(path: Vec2[], colour: string, radius: number, opacity: number): Mesh | null {
    if (path.length < 2) return null;
    const pts = path.map((p) => this.toWorld(p, BALL_R * 0.6));
    const curve = new CatmullRomCurve3(pts);
    const segs = Math.min(600, path.length * 4);
    const geo = new TubeGeometry(curve, segs, radius, 6, false);
    geo.setDrawRange(0, 0);
    const mat = new MeshBasicMaterial({ color: new Color(colour), transparent: true, opacity, blending: AdditiveBlending, depthWrite: false });
    const mesh = new Mesh(geo, mat);
    this.trails.add(mesh);
    return mesh;
  }

  private clearTrails(): void {
    for (const c of [...this.trails.children]) {
      const m = c as Mesh;
      m.geometry.dispose();
      (m.material as MeshBasicMaterial).dispose();
    }
    this.trails.clear();
  }

  async playShot(view: ShotView): Promise<void> {
    this.clearTrails();
    const main = this.tube(view.path, '#fff6c8', 0.07, 0.9);
    const ghosts = view.ghosts.map((g) => ({ g, mesh: this.tube(g.path, GHOST_COLOURS[g.club] ?? '#fff', 0.035, 0.55) }));
    const reveal = (mesh: Mesh | null, frac: number) => {
      if (!mesh) return;
      const idx = mesh.geometry.index!.count;
      mesh.geometry.setDrawRange(0, Math.floor((idx * frac) / 6) * 6);
    };
    const pointAt = (path: Vec2[], frac: number): Vec2 => {
      const f = frac * (path.length - 1);
      const i = Math.min(path.length - 2, Math.floor(f));
      const a = path[i]!, b = path[i + 1] ?? a, u = f - i;
      return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
    };

    if (view.instant) {
      reveal(main, 1);
      ghosts.forEach(({ mesh }) => reveal(mesh, 1));
      if (!view.hazard) this.placeBall(view.path.at(-1)!);
      if (view.holed) this.burst();
      return;
    }

    const dur = shotDuration(view.path.length);
    const t0 = performance.now();
    for (;;) {
      const t = Math.min(1, (performance.now() - t0) / 1000 / dur);
      const e = 1 - (1 - t) ** 2;
      reveal(main, e);
      ghosts.forEach(({ mesh }) => reveal(mesh, e));
      const p = pointAt(view.path, e);
      this.ball.position.copy(this.toWorld(p, BALL_R));
      this.ball.rotation.x -= 0.25;
      this.follow = this.ball.position.clone();
      if (t >= 1) break;
      await frame();
    }
    if (view.hazard) {
      // Water hazard: the ball flies off the course and splashes.
      const from = this.ball.position.clone();
      const dir = from.clone().setY(0).normalize().multiplyScalar(6);
      const t1 = performance.now();
      for (;;) {
        const t = Math.min(1, (performance.now() - t1) / 700);
        this.ball.position.set(from.x + dir.x * t, from.y + Math.sin(t * Math.PI) * 3 - t * 4, from.z + dir.z * t);
        if (t >= 1) break;
        await frame();
      }
      this.placeBall(view.path[0]!);
    }
    if (view.holed) {
      this.ball.position.copy(this.flag.position).setY(this.flag.position.y - 0.05);
      this.burst();
    }
    // Drift the view back to the whole course.
    this.follow = this.centre.clone();
  }

  /** Confetti when the ball drops. */
  private burst(): void {
    if (this.confetti) { this.scene.remove(this.confetti); this.confetti.geometry.dispose(); }
    const n = this.tier === 'high' ? 420 : 200;
    const pos = new Float32Array(n * 3), vel = new Float32Array(n * 3), col = new Float32Array(n * 3);
    const palette = [new Color('#d7263d'), new Color('#f2b233'), new Color('#ffffff'), new Color('#7aa33c'), new Color('#7fd1ff')];
    const o = this.flag.position;
    for (let i = 0; i < n; i++) {
      pos.set([o.x, o.y + 0.3, o.z], i * 3);
      const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 4;
      vel.set([Math.cos(a) * s * 0.5, 4 + Math.random() * 5, Math.sin(a) * s * 0.5], i * 3);
      const c = palette[i % palette.length]!;
      col.set([c.r, c.g, c.b], i * 3);
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(pos, 3));
    geo.setAttribute('color', new BufferAttribute(col, 3));
    geo.userData = { vel, born: performance.now() };
    this.confetti = new Points(geo, new PointsMaterial({ size: 0.14, vertexColors: true, transparent: true }));
    this.scene.add(this.confetti);
  }

  private stepConfetti(): void {
    const c = this.confetti;
    if (!c) return;
    const age = (performance.now() - c.geometry.userData.born) / 1000;
    if (age > 2.2) { this.scene.remove(c); c.geometry.dispose(); this.confetti = null; return; }
    const pos = c.geometry.attributes.position as BufferAttribute;
    const vel = c.geometry.userData.vel as Float32Array;
    const dt = 1 / 60;
    for (let i = 0; i < pos.count; i++) {
      vel[i * 3 + 1]! -= 9 * dt;
      pos.setXYZ(i, pos.getX(i) + vel[i * 3]! * dt, pos.getY(i) + vel[i * 3 + 1]! * dt, pos.getZ(i) + vel[i * 3 + 2]! * dt);
    }
    pos.needsUpdate = true;
    (c.material as PointsMaterial).opacity = Math.max(0, 1 - age / 2.2);
  }

  resize(width: number, height: number): void {
    this.gl.setSize(width, height, false);
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    cancelAnimationFrame(this.raf);
    this.controls.dispose();
    this.clearTrails();
    this.gl.dispose();
  }
}
