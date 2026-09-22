export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 640 }}>
        <div className="section-head">
          <h2>Contact</h2>
          <span className="meta">inquiry</span>
        </div>
        <p style={{ color: "var(--steel)" }}>
          Tell me what you&apos;re building. Prefer email for first contact — no automated pricing, no file uploads on this form yet.
        </p>
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <div className="mono">email</div>
          <h3>
            <a href="mailto:Rudhvishp@gmail.com">Rudhvishp@gmail.com</a>
          </h3>
          <p>Include context: problem, data/systems involved, timeline. I&apos;ll respond if it&apos;s a fit.</p>
        </div>
      </div>
    </section>
  );
}
