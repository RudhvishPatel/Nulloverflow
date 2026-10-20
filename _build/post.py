"""Second pass on /home/claude/out: FAQ in the header nav, favicon set, og:image."""
import os, re, shutil, glob

OUT = "/home/claude/out"
LIVE = "/home/claude/live"
OLD_CHUNK = "layout-9e1c0a55e7c2b3a1"
NEW_CHUNK = "layout-7fa90c1d2e3b4a5f"
SITE = "https://null-overflow.com"

# 1. New layout chunk with FAQ in the nav array (new name: old one is cached immutable for a year)
js = open(f"{LIVE}/chunks/{OLD_CHUNK}.js", encoding="utf-8").read()
old_nav = '{href:"/about",label:"About"},{href:"/contact",label:"Contact"}'
assert js.count(old_nav) == 1
js = js.replace(old_nav, '{href:"/about",label:"About"},{href:"/faq",label:"FAQ"},{href:"/contact",label:"Contact"}')
os.makedirs(f"{OUT}/_next/static/chunks/app", exist_ok=True)
open(f"{OUT}/_next/static/chunks/app/{NEW_CHUNK}.js", "w", encoding="utf-8").write(js)

# 2. Icons + og image
for f in ["favicon.ico", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "icon-32.png", "og-image.png"]:
    shutil.copy(f"/home/claude/icons/{f}", f"{OUT}/{f}")
shutil.copy(f"{LIVE}/404root.html", f"{OUT}/404.html")
os.makedirs(f"{OUT}/404", exist_ok=True)
shutil.copy(f"{LIVE}/404dir.html", f"{OUT}/404/index.html")

ICON_TAGS = ('<link rel="icon" href="/favicon.ico" sizes="any"/>'
             '<link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png"/>'
             '<link rel="apple-touch-icon" href="/apple-touch-icon.png"/>'
             '<link rel="manifest" href="/site.webmanifest"/>'
             '<meta name="theme-color" content="#050805"/>')
OG_TAGS = (f'<meta property="og:image" content="{SITE}/og-image.png"/>'
           '<meta property="og:image:width" content="1200"/><meta property="og:image:height" content="630"/>'
           '<meta property="og:image:alt" content="Null Overflow — AI/ML studio"/>'
           f'<meta name="twitter:image" content="{SITE}/og-image.png"/>')
open(f"{OUT}/site.webmanifest", "w").write(
    '{"name":"Null Overflow","short_name":"Null Overflow","icons":[{"src":"/icon-192.png","sizes":"192x192","type":"image/png"},'
    '{"src":"/icon-512.png","sizes":"512x512","type":"image/png"}],"theme_color":"#050805","background_color":"#050805","display":"browser"}\n')

D_CONTACT = '<a href="/contact/">Contact</a>'
D_FAQ = '<a href="/faq/">FAQ</a>'
M_CONTACT = '<a href="/contact/"><span aria-hidden="true">&gt; </span>Contact</a>'
M_FAQ = '<a href="/faq/"><span aria-hidden="true">&gt; </span>FAQ</a>'

report = []
for path in sorted(glob.glob(f"{OUT}/**/*", recursive=True)):
    if not (path.endswith(".html") or path.endswith(".txt")) or "google1c5" in path or path.endswith("robots.txt"):
        continue
    s = open(path, encoding="utf-8").read(); o = s
    s = s.replace(OLD_CHUNK, NEW_CHUNK)  # script src + RSC payload refs
    if path.endswith(".html"):
        is_faq = path.endswith("/faq/index.html")
        if 'aria-current="page" href="/contact/"' in s and D_FAQ not in s:
            s = s.replace('<a aria-current="page" href="/contact/">Contact</a>', D_FAQ + '<a aria-current="page" href="/contact/">Contact</a>', 1)
            s = s.replace('<a aria-current="page" href="/contact/"><span aria-hidden="true">&gt; </span>Contact</a>', M_FAQ + '<a aria-current="page" href="/contact/"><span aria-hidden="true">&gt; </span>Contact</a>', 1)
        if D_CONTACT in s and D_FAQ not in s and 'aria-current="page" href="/faq/"' not in s:
            fd = '<a aria-current="page" href="/faq/">FAQ</a>' if is_faq else D_FAQ
            fm = '<a aria-current="page" href="/faq/"><span aria-hidden="true">&gt; </span>FAQ</a>' if is_faq else M_FAQ
            s = s.replace(D_CONTACT, fd + D_CONTACT, 1).replace(M_CONTACT, fm + M_CONTACT, 1)
        if 'rel="icon"' not in s:
            s = s.replace("</head>", ICON_TAGS + "</head>", 1)
        if "og:description" in s and "og:image" not in s:
            s = s.replace('<meta name="twitter:card" content="summary"/>', '<meta name="twitter:card" content="summary_large_image"/>')
            s = s.replace("</head>", OG_TAGS + "</head>", 1)
    if s != o:
        open(path, "w", encoding="utf-8").write(s)
    rel = path[len(OUT) + 1:]
    report.append(f"{rel}: chunk={NEW_CHUNK in s} faqnav={'href=\"/faq/\"' in s if path.endswith('.html') else '-'} icon={'rel=\"icon\"' in s if path.endswith('.html') else '-'}")
print("\n".join(report))
