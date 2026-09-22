import Link from "next/link";
import { LAB_BLOG_POSTS } from "@/lib/lab-blog";

export const metadata = { title: "Lab blog" };

export default function LabBlogIndex() {
  const posts = [...LAB_BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <h2>Lab blog</h2>
          <span className="meta">AI/ML stubs · CRT list</span>
        </div>
        <p className="lab-lede">
          Short field notes from the Null Overflow bench — original stubs, not a
          scraped feed.
        </p>

        <ul className="lab-blog-list">
          {posts.map((p) => (
            <li key={p.slug} className="lab-blog-item">
              <span className="lab-blog-meta mono">{p.date} · /lab/blog/{p.slug}</span>
              {p.body ? (
                <Link href={`/lab/blog/${p.slug}`}>{p.title}</Link>
              ) : (
                <span style={{ color: "var(--phosphor-glow)" }}>{p.title}</span>
              )}
              <p className="lab-blog-excerpt">{p.excerpt}</p>
            </li>
          ))}
        </ul>

        <p style={{ marginTop: "1.75rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/lab" className="btn">
            ← Lab
          </Link>
          <Link href="/lab/02" className="btn">
            MAGNITUDE RUN
          </Link>
        </p>
      </div>
    </section>
  );
}
