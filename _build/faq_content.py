EMAIL = "rudhvish@null-overflow.com"

FAQ_GROUPS = [
    ("Cost, timeline and getting started", [
        ("How much does it cost to build an AI chatbot, RAG system or automation?",
         "Null Overflow does not publish fixed prices because cost is set by scope, not by a package. "
         "The main cost drivers are: how many data sources the system reads (PDFs, a website, SharePoint, a database, SAP), "
         "whether answers must respect user permissions, how many languages and channels (web chat, WhatsApp) it supports, "
         "which tools it connects to, how much testing and security review it needs, and the ongoing model and hosting usage. "
         "If you are not sure what to build yet, the AI readiness review is a short, fixed-scope engagement that ends with a ranked shortlist and a cost model."),
        ("How long does an AI project take?",
         "It depends on scope, so there is no standard timeline. Work is staged so you see results early: "
         "a readiness review or a pilot on a narrow slice first (for example a few document types, one language, or selected cameras), "
         "measured on your own data, then a production rollout once the pilot meets the agreed accuracy and cost targets."),
        ("How do I know if my business is ready for AI, and where should I start?",
         "Start with the problem, not the tool. The AI readiness review looks at your list of ideas, the data you can actually access, budget, "
         "and risk appetite, compares build versus buy, and gives you a written plan: what to build first, what to skip, and what each item needs to succeed."),
        ("What should I send to get a quote?",
         f"Email {EMAIL} with three things: the problem you want solved, the data and systems involved (for example Gmail, a CRM, SAP, PDFs, CCTV), "
         "and your timeline. There is no contact form and no automated pricing; you get a direct reply if the project is a fit."),
    ]),
    ("AI chatbots and assistants", [
        ("Can an AI chatbot answer questions from my own documents, PDFs and website?",
         "Yes. This is called retrieval-augmented generation (RAG). Your documents are indexed, the most relevant passages are retrieved for each question, "
         "and the model (Claude, Amazon Bedrock or Mistral models) answers from those passages with citations back to the source, "
         "so staff and customers can check where an answer came from."),
        ("How do you stop an AI chatbot from making up answers (hallucinations)?",
         "Four controls: answers are grounded in retrieved source text with citations; the bot is built to say it does not know, ask a narrower question, "
         "or hand off to a human instead of guessing; every release runs against an evaluation set of real questions with expected answers before it ships; "
         "and production conversations are logged so wrong answers can be found and fixed."),
        ("Can the chatbot reply in my customers' languages?",
         "Yes. A multilingual chatbot detects the language of each message, retrieves from shared or per-language knowledge, and answers in the customer's language. "
         "Quality is tested per language with its own test set, not only in English."),
        ("Can the AI chatbot work on WhatsApp as well as my website?",
         "Yes. Chatbots are delivered as a web widget and can be connected to WhatsApp through the WhatsApp Business API, "
         "with handoff to a human agent that includes the full conversation transcript."),
        ("Can an AI agent take actions, like updating our CRM or sending emails, safely?",
         "Yes, inside a defined blast radius. Agents get least-privilege tool access, secrets stay in a vault, any irreversible action "
         "(moving money, deleting records, sending data out) waits for human approval, and every action is written to an audit log."),
    ]),
    ("Automation and documents", [
        ("Should I use n8n or Zapier for business automation?",
         "Zapier is quick for simple, low-volume connections between popular SaaS apps. n8n suits higher volume, custom logic, and teams that want to "
         "self-host for data control, add code or custom nodes, and keep workflows versioned in git. The choice is made by volume, risk, and who will maintain it; "
         "n8n workflows are delivered documented and monitored, with a handover session so your team can edit them safely."),
        ("Can you automate work between our CRM, SAP or ERP, email and spreadsheets?",
         "Yes. The process is mapped first, then the tool is chosen by volume and risk: n8n, serverless functions (AWS Lambda), or queues. "
         "Each automated flow has failure alerts and a named owner, and anything that moves money or data out keeps a human approval step."),
        ("Can AI read invoices, forms and PDFs and enter the data for us?",
         "Yes. OCR plus LLM extraction pulls fields into a fixed schema, validation rules check them against your system of record, "
         "and low-confidence fields go to a review queue instead of being entered blindly. Accuracy is measured on your own documents before go-live."),
    ]),
    ("Computer vision, security and data", [
        ("Can AI detect theft or suspicious activity on my existing CCTV cameras?",
         "Yes, using your current IP cameras (RTSP streams) on an edge device or in the cloud. Typical events are restricted-zone entry, after-hours motion, "
         "loitering and item removal, sent to staff as alerts with the video clip attached. It starts as a pilot on selected cameras with precision and recall "
         "measured on your footage. Face recognition is off by default, retention is short, and signage and legal requirements are reviewed before go-live."),
        ("Is my company data safe, and who can see it?",
         "Systems are built on governed data: the assistant only retrieves what the user is allowed to see, credentials are kept in a vault rather than in code "
         "or workflows, access is least-privilege, and actions are audit-logged. The model provider and its data-retention settings are chosen per project "
         "and documented with you before launch."),
        ("Can you test our existing chatbot for prompt injection and data leakage?",
         "Yes, on systems you own and authorize in writing. The system is threat-modelled, attacked with automated and manual suites aligned to the "
         "OWASP Top 10 for LLM applications, and you receive a findings report ranked by severity, guardrail fixes, and a regression suite for your CI pipeline."),
        ("Do I need a lot of data to use machine learning?",
         "Not always. Chatbots and document extraction can work from the documents you already have. Custom prediction models, such as fraud scoring, "
         "forecasting or recommendations, need enough historical examples of the outcome you want to predict; the readiness review checks that before anything is built."),
        ("What happens after the AI system goes live?",
         "Production systems ship with monitoring that alerts a person when something breaks, drift and cost tracking, retraining or re-indexing loops, "
         "and regression tests so future changes do not silently lower quality."),
    ]),
    ("About Null Overflow", [
        ("Who is behind Null Overflow?",
         "Null Overflow is the AI/ML studio led by Rudhvish Patel, an AI/ML Engineer and Technical Lead with an MS in Computer Science (AI concentration) from DePaul University. "
         "Credentials include AWS AI Practitioner, AWS Cloud, CompTIA Security+, and research published at IEEE eScience 2025. "
         "Past work includes production GenAI inside SAP workflows, SageMaker ML platforms, multilingual LLM systems, and computer vision pipelines on AWS."),
    ]),
]
