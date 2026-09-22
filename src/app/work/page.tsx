import { work } from "@/lib/content";

export const metadata = { title: "Work" };

export default function WorkPage() {
  return (
    <section className="section" data-glitch data-inview="true">
      <div className="wrap">
        <div className="section-head">
          <h2>Work</h2>
          <span className="meta">{work.length} systems</span>
        </div>
        <div className="overflow-bar" aria-hidden="true">
          <i style={{ ["--fill" as string]: "72%" }} />
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
      </div>
    </section>
  );
}
