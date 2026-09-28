"""Download OFL fonts from google/fonts, pin variable axes, subset to Latin, write woff2.

Run with a Python that has fonttools + brotli:  ~/miniconda3/bin/python fonts.py
Output: ../../assets/lab/<slug>/<name>.woff2
"""
import io
import pathlib
import urllib.request

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HERE = pathlib.Path(__file__).parent
OUT = HERE.parent.parent / "assets" / "lab"
CACHE = HERE / ".fontcache"
RAW = "https://raw.githubusercontent.com/google/fonts/main/"

UNICODES = "U+0020-007E,U+00A0-00FF,U+2013-2014,U+2018-201D,U+2022,U+2026,U+2190-2193,U+2205,U+2713,U+2717"

# (slug, output name, repo path, variable-axis pins or None)
FONTS = [
    ("arena", "anton", "ofl/anton/Anton-Regular.ttf", None),
    ("arena", "oswald-500", "ofl/oswald/Oswald[wght].ttf", {"wght": 500}),
    ("arena", "oswald-700", "ofl/oswald/Oswald[wght].ttf", {"wght": 700}),
    ("blueprint", "architects", "ofl/architectsdaughter/ArchitectsDaughter-Regular.ttf", None),
    ("blueprint", "plexmono-400", "ofl/ibmplexmono/IBMPlexMono-Regular.ttf", None),
    ("blueprint", "plexmono-600", "ofl/ibmplexmono/IBMPlexMono-SemiBold.ttf", None),
    ("bureau", "cutive", "ofl/cutivemono/CutiveMono-Regular.ttf", None),
    ("bureau", "courierprime-400", "ofl/courierprime/CourierPrime-Regular.ttf", None),
    ("bureau", "courierprime-700", "ofl/courierprime/CourierPrime-Bold.ttf", None),
    ("forge", "alfaslab", "ofl/alfaslabone/AlfaSlabOne-Regular.ttf", None),
    ("forge", "bitter-400", "ofl/bitter/Bitter[wght].ttf", {"wght": 400}),
    ("forge", "bitter-700", "ofl/bitter/Bitter[wght].ttf", {"wght": 700}),
    ("siege", "imfell-sc", "ofl/imfellenglishsc/IMFeENsc28P.ttf", None),
    ("siege", "imfell", "ofl/imfellenglish/IMFeENrm28P.ttf", None),
    ("green", "fraunces-800", "ofl/fraunces/Fraunces[SOFT,WONK,opsz,wght].ttf",
     {"wght": 800, "opsz": 72, "SOFT": 100, "WONK": 1}),
    ("green", "nunito-500", "ofl/nunito/Nunito[wght].ttf", {"wght": 500}),
    ("green", "nunito-800", "ofl/nunito/Nunito[wght].ttf", {"wght": 800}),
    ("atelier", "cormorant-600", "ofl/cormorantgaramond/CormorantGaramond[wght].ttf", {"wght": 600}),
    ("atelier", "cormorant-italic-500", "ofl/cormorantgaramond/CormorantGaramond-Italic[wght].ttf", {"wght": 500}),
    ("atelier", "caveat-600", "ofl/caveat/Caveat[wght].ttf", {"wght": 600}),
    ("noir", "bebas", "ofl/bebasneue/BebasNeue-Regular.ttf", None),
    ("abyss", "syne-700", "ofl/syne/Syne[wght].ttf", {"wght": 700}),
    ("abyss", "syne-500", "ofl/syne/Syne[wght].ttf", {"wght": 500}),
    ("cosmos", "orbitron-700", "ofl/orbitron/Orbitron[wght].ttf", {"wght": 700}),
    ("cosmos", "orbitron-500", "ofl/orbitron/Orbitron[wght].ttf", {"wght": 500}),
    ("darkroom", "dmserif", "ofl/dmserifdisplay/DMSerifDisplay-Regular.ttf", None),
    ("darkroom", "dmserif-italic", "ofl/dmserifdisplay/DMSerifDisplay-Italic.ttf", None),
    ("arcade", "pressstart", "ofl/pressstart2p/PressStart2P-Regular.ttf", None),
    ("arcade", "vt323", "ofl/vt323/VT323-Regular.ttf", None),
]


def fetch(path: str) -> bytes:
    cached = CACHE / path.replace("/", "__")
    if not cached.exists():
        CACHE.mkdir(exist_ok=True)
        with urllib.request.urlopen(RAW + urllib.request.quote(path)) as r:
            cached.write_bytes(r.read())
    return cached.read_bytes()


def build(slug: str, name: str, path: str, pins) -> pathlib.Path:
    font = TTFont(io.BytesIO(fetch(path)))
    if pins:
        font = instancer.instantiateVariableFont(font, pins)
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["kern", "liga", "calt"]
    opts.name_IDs = ["*"]  # keep licence/copyright names
    opts.notdef_outline = True
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=subset.parse_unicodes(UNICODES))
    sub.subset(font)
    dest = OUT / slug / f"{name}.woff2"
    dest.parent.mkdir(parents=True, exist_ok=True)
    font.flavor = "woff2"
    font.save(dest)
    return dest


if __name__ == "__main__":
    for row in FONTS:
        d = build(*row)
        print(f"{d.stat().st_size // 1024:>4} KB  {d.relative_to(OUT)}")
