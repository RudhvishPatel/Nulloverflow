import Link from "next/link";
import { capabilities, work, stack, lab } from "@/lib/content";
import GlitchSection from "@/components/GlitchSection";
import CapabilityPanel from "@/components/CapabilityPanel";

export default function HomePage() {
  return (
    <>
      <section className="boot-hero">
        <div className="matrix-rain" aria-hidden="true" />
        <div className="wrap">
          <p className="boot-kicker">system boot · null∅verflow · crt phosphor</p>
          <h1>Build, ship, and harden intelligent systems.</h1>
          <p className="lede">
            AI/ML studio led by Rudhvish Patel — MS AI (DePaul), AI/ML Engineer Technical Lead.
            Production GenAI, ML platforms, and research that survives contact with reality.
            Inquiry only. No public pricing.
          </p>
          <div className="boot-actions">
            <Link href="/work" className="btn btn-signal">
              View work
            </Link>
            <Link href="/lab" className="btn">
              AI Lab / Play
            </Link>
            <Link href="/contact" className="btn">
              Contact
            </Link>
            <a className="bmc" href="#" title="Buy Me a Coffee — URL TBD" rel="noopener noreferrer">
              Buy me a coffee
            </a>
          </div>
        </div>
      </section>

      <GlitchSection>
        <div className="wrap">
          <div className="section-head">
            <h2>Work</h2>
            <span className="meta">selected systems</span>
          </div>
          <div className="overflow-bar" aria-hidden="true">
            <i style={{ ["--fill" as string]: "62%" }} />
          </div>
          <div className="cards cards-dense">
            {work.map((w) => (
              <article key={w.title} className="card card-dense">
                <div className="mono">{w.meta}</div>
                <h3>{w.title}</h3>
                <p className="outcome">{w.outcome}</p>
                <p className="mono stack-line">{w.stack}</p>
              </article>
            ))}
          </div>
          <p style={{ marginTop: "1.25rem" }}>
            <Link href="/work" className="btn">
              All case cards →
            </Link>
          </p>
        </div>
      </GlitchSection>

      <GlitchSection id="capabilities">
        <div className="wrap">
          <div className="section-head">
            <h2>Capabilities</h2>
            <span className="meta">01–06 · terminal panels</span>
          </div>
          <p className="cap-lede mono">
            &gt; cat /capabilities/*.term — problem · approach · deliverable · stack
          </p>
          <div className="cap-panels">
            {capabilities.map((c) => (
              <CapabilityPanel key={c.id} c={c} />
            ))}
          </div>
          <p style={{ marginTop: "1.25rem" }}>
            <Link href="/capabilities" className="btn">
              Full capabilities →
            </Link>
          </p>
        </div>
      </GlitchSection>

      <GlitchSection>
        <div className="wrap">
          <div className="section-head">
            <h2>Stack wall</h2>
            <span className="meta">tools that ship</span>
          </div>
          <div className="stack-wall">
            {stack.map((s) => (
              <div key={s} className="stack-chip">
                {s}
              </div>
            ))}
          </div>
        </div>
      </GlitchSection>

      <GlitchSection>
        <div className="wrap">
          <div className="section-head">
            <h2>Lab</h2>
            <span className="meta">live-feeling demos</span>
          </div>
          <div className="lab-strip">
            <Link href="/lab" className="lab-cell lab-cell-link">
              <div className="mono">lab/play · live</div>
              <h3>Scale Arena</h3>
              <p>Size-compare two objects. Phosphor UI, amber score. Tap A or B.</p>
            </Link>
            {lab.map((l) => (
              <div key={l.mono} className="lab-cell">
                <div className="mono">{l.mono}</div>
                <h3>{l.title}</h3>
                <p>{l.body}</p>
              </div>
            ))}
          </div>
        </div>
      </GlitchSection>

      <GlitchSection>
        <div className="wrap about">
          <div>
            <div className="section-head" style={{ marginBottom: "1rem" }}>
              <h2>About</h2>
              <span className="meta">operator</span>
            </div>
            <p className="about-copy">
              Fremont-based AI engineer. Focused on production GenAI/ML that businesses can actually run —
              not slideware. MS in Computer Science (AI), DePaul; AI/ML Engineer — Technical Lead.
            </p>
            <div className="chips">
              <span className="chip">AWS AI Practitioner</span>
              <span className="chip">AWS Cloud</span>
              <span className="chip">Security+</span>
              <span className="chip">IEEE eScience 2025</span>
            </div>
          </div>
          <div className="panel">
            <div className="mono">next / support</div>
            <h3>No rates on this site</h3>
            <p>Tell me what you&apos;re building. Buy me a coffee if you want to fuel a late-night train run.</p>
            <p className="panel-actions">
              <Link href="/contact" className="btn btn-signal">
                Contact
              </Link>
              <a className="bmc" href="#" title="Buy Me a Coffee — URL TBD" rel="noopener noreferrer">
                Buy me a coffee
              </a>
            </p>
          </div>
        </div>
      </GlitchSection>
    </>
  );
}
