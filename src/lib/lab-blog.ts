export type LabBlogPost = {
  slug: string;
  title: string;
  date: string; // ISO date
  excerpt: string;
  body?: string[];
};

/** Original Null Overflow lab stubs — AI/ML notes, not scraped. */
export const LAB_BLOG_POSTS: LabBlogPost[] = [
  {
    slug: "calibration-loops-for-genai",
    title: "Calibration loops for GenAI product sense",
    date: "2026-09-10",
    excerpt:
      "Why human-in-the-loop magnitude checks beat raw leaderboard chasing when shipping retrieval and tool-use stacks.",
    body: [
      "Most GenAI demos optimize for fluency. Production systems need calibrated confidence: when the model should abstain, escalate, or ask for a narrower query.",
      "A practical pattern is a daily calibration loop — small, timed tasks that force operators to estimate scale (latency budgets, corpus size, error cost) before tuning prompts.",
      "MAGNITUDE RUN in the lab is one such loop: silhouette scaling makes relative error visceral, the same way eval dashboards should surface off-by-factor mistakes, not only accuracy percentages.",
    ],
  },
  {
    slug: "embedding-drift-on-crt-time",
    title: "Embedding drift on CRT time",
    date: "2026-08-28",
    excerpt:
      "Vector indexes age quietly. A short field note on monitoring centroid shift without drowning in dashboards.",
    body: [
      "Embedding models get swapped; corpora grow; user language shifts. Drift often shows up as a slow rise in near-miss retrievals before any single metric alarms.",
      "We track a lightweight centroid fingerprint per collection and a weekly silhouette of nearest-neighbor overlap. If overlap collapses, re-index before rewriting prompts.",
    ],
  },
  {
    slug: "eval-harnesses-that-fit-in-a-terminal",
    title: "Eval harnesses that fit in a terminal",
    date: "2026-08-04",
    excerpt:
      "Small golden sets, deterministic seeds, and phosphor-readable failure traces — how we keep evals runnable on a laptop.",
  },
  {
    slug: "tool-calling-without-the-circus",
    title: "Tool calling without the circus",
    date: "2026-07-19",
    excerpt:
      "Schema discipline, idempotent side effects, and a refusal path that does not soft-hallucinate arguments.",
  },
  {
    slug: "latency-budgets-as-product-copy",
    title: "Latency budgets as product copy",
    date: "2026-06-30",
    excerpt:
      "If p95 is 4.2s, the UI should say so — treating timing as UX copy instead of an infra footnote.",
  },
];

export function getPost(slug: string): LabBlogPost | undefined {
  return LAB_BLOG_POSTS.find((p) => p.slug === slug);
}
