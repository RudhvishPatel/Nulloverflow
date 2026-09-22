import Link from "next/link";
import { capabilities } from "@/lib/content";
import CapabilityPanel from "@/components/CapabilityPanel";

export const metadata = { title: "Capabilities" };

export default function CapabilitiesPage() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <h2>Capabilities</h2>
          <span className="meta">01–06 · terminal · inquiry only</span>
        </div>
        <p className="cap-lede mono">
          &gt; cat /capabilities/*.term — problem · approach · deliverable · stack
        </p>
        <div className="cap-panels">
          {capabilities.map((c) => (
            <CapabilityPanel key={c.id} c={c} />
          ))}
        </div>
        <p style={{ marginTop: "1.75rem" }}>
          <Link href="/contact" className="btn btn-signal">
            Contact
          </Link>
        </p>
      </div>
    </section>
  );
}
