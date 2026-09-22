import Link from "next/link";
import ScaleArena from "@/components/ScaleArena";
import MagnitudeRun from "@/components/MagnitudeRun";

export const metadata = { title: "AI Lab / Play" };

export default function LabPage() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <h2>AI Lab / Play</h2>
          <span className="meta">interactive · phosphor</span>
        </div>
        <p className="lab-lede">
          Lightweight experiments on the CRT. Scale intuition first, then
          MAGNITUDE RUN silhouette calibration — drag amber to match the phosphor
          reference across five daily rounds.
        </p>

        <article className="lab-game-panel">
          <div className="lab-game-head">
            <div>
              <div className="mono">lab/01 · game</div>
              <h3>Scale Arena</h3>
            </div>
            <span className="meta">size-compare</span>
          </div>
          <ScaleArena />
        </article>

        <article className="lab-game-panel" style={{ marginTop: "1.5rem" }}>
          <div className="lab-game-head">
            <div>
              <div className="mono">lab/02 · game</div>
              <h3>MAGNITUDE RUN</h3>
            </div>
            <span className="meta">
              <Link href="/lab/02">silhouette calibration</Link>
            </span>
          </div>
          <MagnitudeRun />
        </article>

        <p style={{ marginTop: "1.75rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/lab/02" className="btn">
            lab/02 + Save Progress →
          </Link>
          <Link href="/lab/blog" className="btn">
            Lab blog
          </Link>
          <Link href="/" className="btn">
            ← Home
          </Link>
        </p>
      </div>
    </section>
  );
}
