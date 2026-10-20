import json, os, re, html, shutil, datetime
from faq_content import FAQ_GROUPS, EMAIL

LIVE = "/home/claude/live"
OUT = "/home/claude/out"
SITE = "https://null-overflow.com"
TODAY = datetime.date.today().isoformat()
OLD_DESC = "Retro-terminal AI/ML studio led by Rudhvish Patel. Production GenAI, ML engineering, research — inquiry only."
H1_CSS = ('<style>.section-head h1{font-family:var(--display);font-size:clamp(1.7rem,3vw,2.3rem);margin:0;'
          'letter-spacing:-.01em;color:var(--phosphor-glow);text-shadow:0 0 10px rgba(57,255,20,.16)}'
          '.faq-group{margin:2.2rem 0 0}.faq-group h2{font-family:var(--display);font-size:1.25rem;margin:0 0 .6rem;color:var(--phosphor-glow)}'
          '.faq-item{border:1px solid rgba(57,255,20,.25);margin:.5rem 0;padding:.2rem 1rem}'
          '.faq-item summary{cursor:pointer;padding:.7rem 0;font-weight:600;list-style-position:inside}'
          '.faq-item h3{display:inline;font-size:1rem;margin:0;font-weight:600}'
          '.faq-item p{margin:0 0 .9rem;line-height:1.6;opacity:.92}.faq-intro{max-width:70ch;line-height:1.6}</style>')

# path -> (local file stem, new title or None, new description or None, kind)
PAGES = {
 "/": ("home", "Null Overflow — AI/ML Studio: Chatbots, RAG and Automation",
       "Null Overflow is an AI/ML studio that builds production LLM and RAG chatbots, AI agents, n8n workflow automation, computer vision and ML systems on AWS.", "next"),
 "/services/": ("services", "AI Chatbot, RAG and Automation Services · Null Overflow",
       "AI/ML services: LLM and RAG chatbots, multilingual and WhatsApp bots, n8n automation, document AI, CCTV theft detection, MLOps and LLM security testing.", "static"),
 "/capabilities/": ("capabilities", "AI/ML Capabilities: LLM, MLOps, Vision · Null Overflow",
       "How Null Overflow delivers LLM and RAG systems, ML engineering on SageMaker, data platforms, computer vision and OCR, applied research and secure AI agents.", "next"),
 "/work/": ("work", "AI/ML Case Studies and Projects · Null Overflow",
       "Selected AI/ML work: GenAI in SAP workflows, IEEE eScience 2025 research, multilingual LLM recommendations, SageMaker lead scoring and road-sign OCR on AWS.", "next"),
 "/about/": ("about", "About Rudhvish Patel, AI/ML Engineer · Null Overflow",
       "Null Overflow is led by Rudhvish Patel, AI/ML Engineer and Technical Lead, DePaul MS in AI, AWS AI Practitioner, CompTIA Security+, IEEE eScience 2025 author.", "next"),
 "/contact/": ("contact", "Contact Null Overflow for an AI/ML Project",
       "Start an AI/ML project with Null Overflow. Email the problem, the data and systems involved, and your timeline for a direct reply. No forms, no auto-pricing.", "next"),
 "/faq/": (None, "AI Chatbot and Automation FAQ · Null Overflow",
       "Answers to common questions about AI chatbots, RAG, n8n automation, document AI, CCTV theft detection, data safety, cost drivers and timelines.", "faq"),
 "/lab/": ("lab", "AI Lab: 12 Interactive ML Games · Null Overflow",
       "Play 12 free browser-based AI and machine learning experiments: gradient descent golf, attention heads, CNN digits, embeddings, RL agents and prompt security.", "next"),
 "/lab/blog/": ("lab_blog", "AI/ML Engineering Blog · Null Overflow Lab",
       "Short engineering notes from Null Overflow on GenAI calibration, embedding drift, retrieval quality and running ML systems in production.", "next"),
 "/lab/blog/calibration-loops-for-genai/": ("lab_blog_calibration-loops-for-genai", None,
       "Why production GenAI needs calibrated confidence, when models should abstain or escalate, and how daily calibration loops improve product judgment.", "next"),
 "/lab/blog/embedding-drift-on-crt-time/": ("lab_blog_embedding-drift-on-crt-time", None,
       "How to detect embedding drift in RAG systems with centroid fingerprints and nearest-neighbor overlap, and when to re-index before rewriting prompts.", "next"),
}
for i in range(1, 13):
    PAGES[f"/lab/{i:02d}/"] = (f"lab_{i:02d}", None, None, "static")

ORG = {"@type": "ProfessionalService", "@id": SITE + "/#org", "name": "Null Overflow",
       "url": SITE + "/", "email": EMAIL,
       "description": "AI/ML studio building LLM and RAG systems, AI chatbots and agents, workflow automation, computer vision and ML engineering.",
       "founder": {"@type": "Person", "name": "Rudhvish Patel", "jobTitle": "AI/ML Engineer, Technical Lead",
                   "alumniOf": "DePaul University"},
       "address": {"@type": "PostalAddress", "addressLocality": "Fremont", "addressRegion": "CA", "addressCountry": "US"},
       "knowsAbout": ["Large language models", "Retrieval-augmented generation", "AI chatbots", "AI agents", "n8n automation",
                      "Workflow automation", "Document processing", "Computer vision", "OCR", "Anomaly detection",
                      "MLOps", "Recommendation systems", "LLM security"]}

def jsonld(obj):
    return '<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", **obj} if "@graph" not in obj else {"@context": "https://schema.org", **obj}, ensure_ascii=False) + "</script>"

def head_extra(path, title, desc, kind):
    url = SITE + path
    t, d = html.escape(title, quote=True), html.escape(desc, quote=True)
    tags = [f'<link rel="canonical" href="{url}"/>',
            '<meta name="robots" content="index, follow, max-image-preview:large"/>',
            '<meta property="og:site_name" content="Null Overflow"/>',
            f'<meta property="og:type" content="{"article" if "/blog/" in path and path != "/lab/blog/" else "website"}"/>',
            f'<meta property="og:url" content="{url}"/>', f'<meta property="og:title" content="{t}"/>',
            f'<meta property="og:description" content="{d}"/>', '<meta name="twitter:card" content="summary"/>',
            f'<meta name="twitter:title" content="{t}"/>', f'<meta name="twitter:description" content="{d}"/>']
    graph = []
    if path == "/":
        graph += [ORG, {"@type": "WebSite", "@id": SITE + "/#site", "url": SITE + "/", "name": "Null Overflow", "publisher": {"@id": SITE + "/#org"}}]
    elif path in ("/services/", "/about/", "/contact/"):
        graph.append(ORG)
    if path == "/faq/":
        graph.append({"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
            for _, items in FAQ_GROUPS for q, a in items]})
    if path.startswith("/lab/blog/") and path != "/lab/blog/":
        graph.append({"@type": "BlogPosting", "headline": title.split(" · ")[0], "description": desc, "url": url,
                      "datePublished": {"calibration": "2026-09-10", "embedding": "2026-08-28"}[path.split("/")[3].split("-")[0]],
                      "author": {"@type": "Person", "name": "Rudhvish Patel"}, "publisher": {"@id": SITE + "/#org"}})
    crumbs = [("Home", "/")]
    parts = [p for p in path.strip("/").split("/") if p]
    for i, p in enumerate(parts):
        crumbs.append((p.replace("-", " ").title() if p != "faq" else "FAQ", "/" + "/".join(parts[:i + 1]) + "/"))
    if len(crumbs) > 1:
        graph.append({"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": n, "item": SITE + u} for i, (n, u) in enumerate(crumbs)]})
    if graph:
        tags.append('<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False) + "</script>")
    return "\n".join(tags) + "\n"

def write(rel, text):
    p = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w", encoding="utf-8").write(text)

def faq_html(services_src):
    head_end = services_src.index("</head>")
    head = services_src[:head_end]
    body_start = services_src.index("<header")
    header = services_src[body_start:services_src.index("</header>") + 9].replace(' aria-current="page"', "")
    footer = services_src[services_src.index("<footer"):]
    groups = []
    for gi, (gname, items) in enumerate(FAQ_GROUPS):
        qs = "".join(f'<details class="faq-item"{" open" if gi == 0 and qi == 0 else ""}><summary><h3>{html.escape(q)}</h3></summary><p>{html.escape(a)}</p></details>'
                     for qi, (q, a) in enumerate(items))
        groups.append(f'<section class="faq-group"><h2>{html.escape(gname)}</h2>{qs}</section>')
    main = ('<main><section class="section"><div class="wrap">'
            '<div class="section-head"><h1>Frequently asked questions</h1><span class="meta">AI chatbots · automation · ML · data</span></div>'
            '<p class="cap-lede mono">&gt; man null-overflow — straight answers before you email</p>'
            '<p class="faq-intro">Direct answers to the questions businesses ask before starting an AI chatbot, RAG, automation, computer vision or machine learning project. '
            f'Not covered here? Email <a href="mailto:{EMAIL}">{EMAIL}</a>.</p>'
            + "".join(groups) +
            '<div class="svc-cta" style="margin-top:2rem"><a class="btn btn-signal" href="/contact/">Contact</a><a class="btn" href="/services/">Services</a></div>'
            '</div></section></main>\n')
    return head + "</head>\n<body>\n" + header + "\n" + main + footer

shutil.rmtree(OUT, ignore_errors=True)
report = []
services_src = open(f"{LIVE}/services.html", encoding="utf-8").read()
for path, (stem, title, desc, kind) in PAGES.items():
    if kind == "faq":
        src = faq_html(services_src)
    else:
        src = open(f"{LIVE}/{stem}.html", encoding="utf-8").read()
    old_title = re.search(r"<title>([^<]*)</title>", src).group(1)
    old_desc = html.unescape(re.search(r'<meta name="description" content="([^"]*)"', src).group(1))
    new_title = title or old_title
    new_desc = desc or old_desc
    if kind != "faq":
        assert len([m for m in re.finditer(re.escape(old_title), src)]) >= 1
    # replace in head + RSC payload (title/desc have no quotes/backslashes)
    for s in (new_title, new_desc):
        assert '"' not in s and "\\" not in s, s
    src = src.replace(f"<title>{old_title}</title>", f"<title>{html.escape(new_title, quote=False)}</title>")
    src = re.sub(r'<meta name="description" content="[^"]*"/?>', f'<meta name="description" content="{html.escape(new_desc, quote=True)}"/>', src, count=1)
    payload_hits = 0
    if kind == "next":
        payload_hits += src.count(f'\\"children\\":\\"{old_title}\\"') + src.count(f'\\"content\\":\\"{old_desc}\\"')
        src = src.replace(f'\\"children\\":\\"{old_title}\\"', f'\\"children\\":\\"{new_title}\\"')
        src = src.replace(f'\\"content\\":\\"{old_desc}\\"', f'\\"content\\":\\"{new_desc}\\"')
        txt = open(f"{LIVE}/{stem}.txt", encoding="utf-8").read()
        tt = txt.replace(f'"children":"{old_title}"', f'"children":"{new_title}"').replace(f'"content":"{old_desc}"', f'"content":"{new_desc}"')
        write(path.lstrip("/") + "index.txt", tt)
        report.append(f"  txt changes: {txt != tt}")
    # remove any existing robots noindex (none expected on real pages)
    src = re.sub(r'<meta name="robots" content="[^"]*"/>', "", src)
    extra = head_extra(path, new_title, new_desc, kind)
    if kind in ("static", "faq"):
        # promote page heading to h1 on static pages (no hydration)
        if "<h1" not in src:
            src = re.sub(r'<div class="section-head"><h2>(.*?)</h2>', r'<div class="section-head"><h1>\1</h1>', src, count=1)
        extra += H1_CSS + "\n"
    src = src.replace("</head>", extra + "</head>", 1)
    if path == "/services/":
        src = src.replace('<a class="btn" href="/capabilities/">How we work</a>',
                          '<a class="btn" href="/capabilities/">How we work</a><a class="btn" href="/faq/">FAQ</a>')
    write(path.lstrip("/") + "index.html", src)
    report.append(f"{path} [{kind}] title={len(new_title)}c desc={len(new_desc)}c payload_hits={payload_hits}")

write("robots.txt", f"User-agent: *\nAllow: /\nDisallow: /404/\n\nSitemap: {SITE}/sitemap.xml\n")
prio = {"/": "1.0", "/services/": "0.9", "/faq/": "0.9", "/contact/": "0.8", "/capabilities/": "0.8", "/work/": "0.8", "/about/": "0.7"}
urls = "".join(f"  <url><loc>{SITE}{p}</loc><lastmod>{TODAY}</lastmod><priority>{prio.get(p, '0.5')}</priority></url>\n" for p in PAGES)
write("sitemap.xml", f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n')
print("\n".join(report))
