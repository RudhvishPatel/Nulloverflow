import Link from "next/link";
import { notFound } from "next/navigation";
import { LAB_BLOG_POSTS, getPost } from "@/lib/lab-blog";

export function generateStaticParams() {
  return LAB_BLOG_POSTS.filter((p) => p.body?.length).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  return { title: post ? post.title : "Lab post" };
}

export default async function LabBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post?.body?.length) notFound();

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <h2>{post.title}</h2>
          <span className="meta">{post.date}</span>
        </div>
        <p className="mono mag-seed">&gt; /lab/blog/{post.slug}</p>
        <article className="lab-blog-body">
          {post.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>
        <p style={{ marginTop: "1.75rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/lab/blog" className="btn">
            ← Blog
          </Link>
          <Link href="/lab" className="btn">
            Lab
          </Link>
        </p>
      </div>
    </section>
  );
}
