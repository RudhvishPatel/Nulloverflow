import type { Capability } from "@/lib/content";

export default function CapabilityPanel({ c }: { c: Capability }) {
  return (
    <article className="cap-panel" data-id={c.id}>
      <div className="cap-panel-chrome">
        <span className="cap-panel-dots" aria-hidden="true">
          <i /><i /><i />
        </span>
        <span className="mono cap-panel-path">
          null∅verflow:/capabilities/{c.id}.term
        </span>
        <span className="mono cap-panel-status">PHOSPHOR · OK</span>
      </div>
      <div className="cap-panel-body">
        <div className="cap-panel-title-row">
          <span className="idx">{c.id}</span>
          <h3>{c.title}</h3>
        </div>
        <dl className="cap-fields">
          <div>
            <dt>&gt; PROBLEM</dt>
            <dd>{c.problem}</dd>
          </div>
          <div>
            <dt>&gt; APPROACH</dt>
            <dd>{c.approach}</dd>
          </div>
          <div>
            <dt>&gt; DELIVERABLE</dt>
            <dd>{c.deliverable}</dd>
          </div>
        </dl>
        <div className="cap-stack">
          <span className="mono cap-stack-label">stack_tags[]</span>
          <div className="cap-tags">
            {c.stack.map((t) => (
              <span key={t} className="cap-tag">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
