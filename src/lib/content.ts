export type Capability = {
  id: string;
  title: string;
  problem: string;
  approach: string;
  deliverable: string;
  stack: string[];
};

export const capabilities: Capability[] = [
  {
    id: "01",
    title: "LLM & RAG systems",
    problem:
      "Enterprise knowledge is trapped in silos; chat demos collapse under permissions, latency, and hallucination risk.",
    approach:
      "Ground Claude / Bedrock / Mistral with retrieval over governed corpora, tool-use contracts, and eval gates before any user-facing path ships.",
    deliverable:
      "Production RAG + agent surfaces with citation trails, rate limits, and rollback — not slideware demos.",
    stack: ["Claude", "Bedrock", "Mistral", "LangChain", "pgvector", "FastAPI"],
  },
  {
    id: "02",
    title: "ML engineering",
    problem:
      "Models that look good in notebooks fail under drift, cost spikes, and missing ops once real traffic arrives.",
    approach:
      "Train, evaluate, and deploy on SageMaker/AWS with feature contracts, shadow traffic, and monitoring that pages humans — not dashboards nobody reads.",
    deliverable:
      "Endpoints with SLOs, cost envelopes, and retrain loops that survive production load.",
    stack: ["SageMaker", "PyTorch", "scikit-learn", "Lambda", "CloudWatch", "MLflow"],
  },
  {
    id: "03",
    title: "Data & analytics platforms",
    problem:
      "Models starve when pipelines are brittle, schemas drift, and SAP/analytics truth is untrusted.",
    approach:
      "Build validated ingestion, quality gates, and analytics stacks that keep downstream ML fed with reproducible, auditable data.",
    deliverable:
      "Pipelines + marts with lineage, freshness SLAs, and clear ownership — so models stop guessing.",
    stack: ["Airflow", "Spark", "Postgres", "SAP", "dbt", "S3"],
  },
  {
    id: "04",
    title: "Computer vision / OCR",
    problem:
      "Detection and document/sign pipelines stall between dataset design and shippable inference.",
    approach:
      "Own the loop: labeling strategy, model selection (YOLO/OCR), latency budgets, and AWS packaging as one system.",
    deliverable:
      "Inference services with measured accuracy, batch + online paths, and ops hooks for bad frames.",
    stack: ["YOLO", "OpenCV", "OCR", "PyTorch", "AWS", "Docker"],
  },
  {
    id: "05",
    title: "Applied research",
    problem:
      "Papers and prototypes die in the lab when product constraints never enter the experiment design.",
    approach:
      "Design studies with transfer criteria up front — metrics, compute envelopes, and failure modes that map to a shippable surface.",
    deliverable:
      "Published or internal research plus a prototype→product handoff path when the science has to land.",
    stack: ["PyTorch", "HPC", "scikit-learn", "experiment tracking", "IEEE"],
  },
  {
    id: "06",
    title: "Automation & agents",
    problem:
      "Manual ops burn cycles; naive agents amplify risk when AppSec is bolted on after the demo.",
    approach:
      "Replace brittle workflows with constrained agents — least privilege, vault secrets, human checkpoints, and audit logs from day one.",
    deliverable:
      "Agentic ops that cut toil without opening the blast radius — measurable time saved, not vibes.",
    stack: ["agents", "FastAPI", "vault", "IAM", "LangChain", "queues"],
  },
];

export const work = [
  { meta: "IAP · GenAI / SAP · 2025–", title: "Commercial Intelligence OS", outcome: "Billing NLP in production inside SAP Joule workflows.", stack: "Bedrock · SAP · Python" },
  { meta: "RUSH / DePaul · Research · 2025", title: "Syndemics · IEEE eScience", outcome: "Ensemble clustering published at IEEE eScience 2025.", stack: "PyTorch · scikit · HPC" },
  { meta: "ReDDDoT · LLM · 2024–", title: "Multilingual LLM + recs", outcome: "Multilingual gen + ranking tuned for live journeys.", stack: "Transformers · FastAPI" },
  { meta: "Techify · ML platform · 2023–", title: "SageMaker lead ML", outcome: "Lead ML + voice follow-up closed the score loop.", stack: "SageMaker · Lambda" },
  { meta: "CV / OCR · Systems", title: "Road-sign vision pipeline", outcome: "Detection + OCR shipped as one AWS system.", stack: "YOLO · OCR · AWS" },
  { meta: "Education · Recsys", title: "Education video recommender", outcome: "Ranking that respects pedagogy, not just clicks.", stack: "Recsys · Feature store" },
];

export const stack = [
  "Python", "PyTorch", "TensorFlow", "scikit-learn", "Hugging Face",
  "AWS SageMaker", "Bedrock", "Lambda", "S3", "FastAPI",
  "Next.js", "TypeScript", "Prisma", "Postgres", "Docker",
  "RAG", "LangChain", "OpenCV", "Spark", "Airflow",
];

export const lab = [
  { mono: "lab/01", title: "Eval harness", body: "Offline + online metrics for RAG and classifiers — before anything ships." },
  { mono: "lab/02", title: "Prompt forge", body: "Versioned system prompts with regression suites, not vibes." },
  { mono: "lab/03", title: "Secure ops", body: "Least privilege, vault secrets, and rate limits on every public surface." },
];

export type ScalePair = {
  id: string;
  left: { name: string; sizeLabel: string; sizeMeters: number };
  right: { name: string; sizeLabel: string; sizeMeters: number };
};

/** Larger sizeMeters = physically bigger. Player picks which is larger. */
export const scaleArenaPairs: ScalePair[] = [
  {
    id: "camel-palm",
    left: { name: "Camel", sizeLabel: "~2.1 m tall", sizeMeters: 2.1 },
    right: { name: "Palm tree", sizeLabel: "~15 m tall", sizeMeters: 15 },
  },
  {
    id: "field-yacht",
    left: { name: "Football field", sizeLabel: "~110 m long", sizeMeters: 110 },
    right: { name: "Superyacht", sizeLabel: "~70 m long", sizeMeters: 70 },
  },
  {
    id: "blue-whale-bus",
    left: { name: "Blue whale", sizeLabel: "~25 m long", sizeMeters: 25 },
    right: { name: "City bus", sizeLabel: "~12 m long", sizeMeters: 12 },
  },
  {
    id: "eiffel-statue",
    left: { name: "Eiffel Tower", sizeLabel: "~330 m tall", sizeMeters: 330 },
    right: { name: "Statue of Liberty", sizeLabel: "~93 m tall", sizeMeters: 93 },
  },
  {
    id: "ant-grain",
    left: { name: "Ant", sizeLabel: "~5 mm", sizeMeters: 0.005 },
    right: { name: "Grain of rice", sizeLabel: "~6 mm", sizeMeters: 0.006 },
  },
  {
    id: "iss-airbus",
    left: { name: "ISS (length)", sizeLabel: "~109 m", sizeMeters: 109 },
    right: { name: "Airbus A380", sizeLabel: "~73 m", sizeMeters: 73 },
  },
  {
    id: "moon-earth",
    left: { name: "Moon diameter", sizeLabel: "~3,474 km", sizeMeters: 3_474_000 },
    right: { name: "Earth diameter", sizeLabel: "~12,742 km", sizeMeters: 12_742_000 },
  },
  {
    id: "piano-fridge",
    left: { name: "Grand piano", sizeLabel: "~1.5 m long", sizeMeters: 1.5 },
    right: { name: "Fridge", sizeLabel: "~1.8 m tall", sizeMeters: 1.8 },
  },
];
