import Link from "next/link";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <section className="section">
      <div className="wrap about">
        <div>
          <div className="section-head">
            <h2>About</h2>
            <span className="meta">rudhvish patel</span>
          </div>
          <p style={{ color: "var(--steel)", maxWidth: "60ch", lineHeight: 1.6 }}>
            Null Overflow is the studio front for production AI/ML work: LLM & RAG systems, ML engineering on AWS,
            data platforms, computer vision, applied research, and secure automation agents.
            Lead profile — AI/ML Engineer Technical Lead; MS AI, DePaul University.
          </p>
          <div className="chips">
            <span className="chip">AWS AI Practitioner</span>
            <span className="chip">AWS Cloud</span>
            <span className="chip">CompTIA Security+</span>
            <span className="chip">IEEE eScience 2025</span>
            <span className="chip">Fremont, CA</span>
          </div>
        </div>
        <div className="card">
          <div className="mono">engagement</div>
          <h3>No public packages</h3>
          <p>Scope is defined per engagement. This site does not list rates.</p>
          <p style={{ marginTop: "1rem" }}>
            <Link href="/contact" className="btn btn-signal">Contact</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
