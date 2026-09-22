import Link from "next/link";
import MagnitudeRun from "@/components/MagnitudeRun";
import SaveProgress from "@/components/SaveProgress";

export const metadata = { title: "MAGNITUDE RUN · lab/02" };

export default function MagnitudeRunPage() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <h2>MAGNITUDE RUN</h2>
          <span className="meta">lab/02 · silhouette calibration</span>
        </div>
        <p className="lab-lede">
          Daily seed picks five puzzles. Phosphor reference on the left, amber
          target on the right — drag the corner handle to scale, lock in, then
          read score /100 and how far you were off.
        </p>

        <article className="lab-game-panel">
          <div className="lab-game-head">
            <div>
              <div className="mono">lab/02 · game</div>
              <h3>MAGNITUDE RUN</h3>
            </div>
            <span className="meta">size · pop · geo</span>
          </div>
          <MagnitudeRun />
        </article>

        <SaveProgress />

        <p style={{ marginTop: "1.75rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/lab" className="btn">
            ← Lab
          </Link>
          <Link href="/lab/blog" className="btn">
            Lab blog
          </Link>
          <Link href="/" className="btn">
            Home
          </Link>
        </p>
      </div>
    </section>
  );
}
