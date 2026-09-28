// three.js starfield: 8,000 additive point sprites, camera flights, analogy beams.
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Color, Line, LineBasicMaterial, PerspectiveCamera,
  Points, PointsMaterial, Scene, Vector3, WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Tier } from '../../../core/quality';
import { pixelRatio } from '../../../core/quality';
import type { Galaxy } from '../sim/space';
import { starColour, type Focus, type Labels, type StarMap } from './stars';

const R = 10; // world radius of the galaxy

function sprite(): CanvasTexture {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d')!, grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(0.25, 'rgba(255,255,255,.6)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

export class Stars3D implements StarMap {
  readonly kind = '3d' as const;
  readonly canvas: HTMLCanvasElement;
  private gl: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(55, 1, 0.05, 200);
  private controls: OrbitControls;
  private hot: Points;
  private beams: Line[] = [];
  private raf = 0;
  private flight: { from: Vector3; to: Vector3; tFrom: Vector3; tTo: Vector3; t0: number } | null = null;
  private w = 800; private h = 480;

  constructor(private g: Galaxy, private labels: Labels, tier: Tier) {
    this.gl = new WebGLRenderer({ antialias: tier === 'high' });
    this.gl.setPixelRatio(pixelRatio(tier));
    this.canvas = this.gl.domElement;
    this.canvas.className = 'cs-canvas';
    const n = g.words.length, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos.set([g.coords[i * 3]! * R, g.coords[i * 3 + 2]! * R * 0.7, g.coords[i * 3 + 1]! * R], i * 3);
      col.set(starColour(g, i), i * 3);
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(pos, 3));
    geo.setAttribute('color', new BufferAttribute(col, 3));
    const tex = sprite();
    this.scene.add(new Points(geo, new PointsMaterial({ size: 0.16, map: tex, vertexColors: true, transparent: true, depthWrite: false, blending: AdditiveBlending, sizeAttenuation: true })));
    this.hot = new Points(new BufferGeometry(), new PointsMaterial({ size: 0.6, map: tex, color: new Color('#ffd27a'), transparent: true, depthWrite: false, blending: AdditiveBlending }));
    this.scene.add(this.hot);
    this.camera.position.set(0, 6, 22);
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.minDistance = 1.2;
    this.controls.maxDistance = 45;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.25;
    const tick = () => {
      this.raf = requestAnimationFrame(tick);
      if (this.flight) {
        const t = Math.min(1, (performance.now() - this.flight.t0) / 1600), e = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
        this.camera.position.lerpVectors(this.flight.from, this.flight.to, e);
        this.controls.target.lerpVectors(this.flight.tFrom, this.flight.tTo, e);
        if (t >= 1) this.flight = null;
      }
      this.controls.update();
      this.gl.render(this.scene, this.camera);
      this.labels.place((i) => this.project(i));
    };
    tick();
  }

  private world(i: number): Vector3 { return new Vector3(this.g.coords[i * 3]! * R, this.g.coords[i * 3 + 2]! * R * 0.7, this.g.coords[i * 3 + 1]! * R); }

  private project(i: number): [number, number, boolean] {
    const v = this.world(i).project(this.camera);
    return [(v.x * 0.5 + 0.5) * this.w, (-v.y * 0.5 + 0.5) * this.h, v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1];
  }

  resize(w: number, h: number): void {
    this.w = w; this.h = h;
    this.gl.setSize(w, h, false);
    this.canvas.style.height = `${h}px`;
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
  }

  focus(f: Focus, instant: boolean): void {
    this.labels.set(f.indices, f.highlight);
    const pts = (f.highlight.length ? f.highlight : f.indices).map((i) => this.world(i));
    const hp = new Float32Array(f.highlight.length * 3);
    f.highlight.forEach((i, k) => hp.set(this.world(i).toArray(), k * 3));
    this.hot.geometry.dispose();
    this.hot.geometry = new BufferGeometry();
    this.hot.geometry.setAttribute('position', new BufferAttribute(hp, 3));
    for (const b of this.beams) { this.scene.remove(b); b.geometry.dispose(); }
    this.beams = f.beams.map(([a, b]) => {
      const line = new Line(new BufferGeometry().setFromPoints([this.world(a), this.world(b)]), new LineBasicMaterial({ color: '#ffd27a', transparent: true, opacity: 0.85 }));
      this.scene.add(line);
      return line;
    });
    if (!pts.length) return;
    this.controls.autoRotate = false;
    const centre = pts.reduce((a, p) => a.add(p), new Vector3()).multiplyScalar(1 / pts.length);
    const spread = Math.max(1.5, ...pts.map((p) => p.distanceTo(centre))) * 2.6;
    const to = centre.clone().add(new Vector3(0.35, 0.3, 1).normalize().multiplyScalar(spread));
    if (instant) { this.camera.position.copy(to); this.controls.target.copy(centre); return; }
    this.flight = { from: this.camera.position.clone(), to, tFrom: this.controls.target.clone(), tTo: centre, t0: performance.now() };
  }

  dispose(): void { cancelAnimationFrame(this.raf); this.controls.dispose(); this.gl.dispose(); }
}
