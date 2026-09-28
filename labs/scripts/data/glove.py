"""Prepare Embedding Galaxy data from GloVe 6B 50d (Stanford NLP, PDDL public-domain licence).

Out: ../../../assets/lab/10/data/galaxy.json  words, int8 50-d vectors (base64), 3-D PCA coords, puzzles
     ../../tests/10-galaxy/fixtures.json       float nearest neighbours for 20 queries (TS parity test)
Run: ~/miniconda3/bin/python glove.py   (needs .cache/glove.6B.50d.txt)
"""
import base64
import json
import pathlib
import re

import numpy as np

HERE = pathlib.Path(__file__).parent
SRC = HERE / ".cache" / "glove.6B.50d.txt"
OUT = HERE.parents[2] / "assets" / "lab" / "10" / "data"
FIX = HERE.parents[1] / "tests" / "10-galaxy"
N = 8000

ANALOGIES = [
    ("king", "man", "woman", "queen"), ("brother", "man", "woman", "sister"), ("father", "man", "woman", "mother"),
    ("paris", "france", "italy", "rome"), ("berlin", "germany", "spain", "madrid"), ("tokyo", "japan", "china", "beijing"),
    ("london", "england", "france", "paris"), ("moscow", "russia", "japan", "tokyo"), ("athens", "greece", "egypt", "cairo"),
    ("walked", "walk", "swim", "swam"), ("went", "go", "see", "saw"), ("bigger", "big", "small", "smaller"),
    ("better", "good", "bad", "worse"), ("dogs", "dog", "cat", "cats"), ("children", "child", "man", "men"),
    ("actor", "man", "woman", "actress"), ("uncle", "man", "woman", "aunt"), ("son", "man", "woman", "daughter"),
    ("france", "french", "german", "germany"), ("dollar", "america", "japan", "yen"), ("slowly", "slow", "quick", "quickly"),
    ("husband", "man", "woman", "wife"), ("kings", "king", "queen", "queens"), ("played", "play", "write", "wrote"),
]
ODD_SETS = [
    ["apple", "banana", "orange", "grape", "truck"], ["piano", "guitar", "violin", "drum", "potato"],
    ["red", "blue", "green", "yellow", "january"], ["monday", "tuesday", "friday", "sunday", "kitchen"],
    ["lion", "tiger", "leopard", "cheetah", "keyboard"], ["football", "tennis", "basketball", "golf", "mathematics"],
    ["doctor", "nurse", "surgeon", "dentist", "volcano"], ["mars", "jupiter", "venus", "saturn", "carrot"],
    ["copper", "iron", "zinc", "nickel", "poetry"], ["river", "lake", "ocean", "sea", "senator"],
    ["chair", "table", "sofa", "desk", "hurricane"], ["python", "java", "ruby", "perl", "saxophone"],
    ["dog", "cat", "horse", "cow", "democracy"], ["bread", "cheese", "butter", "milk", "election"],
    ["january", "march", "april", "june", "guitar"], ["england", "france", "germany", "spain", "breakfast"],
    ["train", "bus", "truck", "car", "poetry"], ["gold", "silver", "copper", "iron", "happiness"],
    ["physics", "chemistry", "biology", "mathematics", "sandwich"], ["king", "queen", "prince", "princess", "engine"],
    ["rain", "snow", "wind", "storm", "painting"], ["piano", "guitar", "violin", "trumpet", "parliament"],
    ["doctor", "nurse", "hospital", "patient", "orchestra"], ["soldier", "army", "tank", "weapon", "flower"],
]


def main():
    words, vecs = [], []
    with SRC.open(encoding="utf8") as f:
        for line in f:
            parts = line.rstrip().split(" ")
            w = parts[0]
            if not re.fullmatch(r"[a-z]{2,}", w):
                continue
            words.append(w)
            vecs.append(np.array(parts[1:], dtype=np.float32))
            if len(words) >= N:
                break
    V = np.stack(vecs)
    V /= np.linalg.norm(V, axis=1, keepdims=True)
    # int8 quantisation (vectors are unit length, components well within ±1).
    scale = float(np.abs(V).max() / 127)
    Q = np.clip(np.round(V / scale), -127, 127).astype(np.int8)
    Vq = Q.astype(np.float32) * scale
    Vq /= np.linalg.norm(Vq, axis=1, keepdims=True)
    idx = {w: i for i, w in enumerate(words)}

    def nearest(v, k=5, exclude=()):
        sims = Vq @ v
        for e in exclude:
            sims[idx[e]] = -9
        return [words[i] for i in np.argsort(-sims)[:k]]

    analogies = []
    for a, b, c, want in ANALOGIES:
        if not all(w in idx for w in (a, b, c, want)):
            continue
        v = Vq[idx[a]] - Vq[idx[b]] + Vq[idx[c]]
        top = nearest(v / np.linalg.norm(v), 3, exclude=(a, b, c))
        if want in top:
            analogies.append({"a": a, "b": b, "c": c, "answer": want})
    odd = []
    for s in ODD_SETS:
        if not all(w in idx for w in s):
            continue
        M = Vq[[idx[w] for w in s]]
        mean_sim = (M @ M.T).sum(1) - 1
        if s[int(np.argmin(mean_sim))] == s[-1]:
            odd.append({"words": s, "answer": s[-1]})
    # 3-D PCA for the starfield.
    C = V - V.mean(0)
    _, _, vt = np.linalg.svd(C, full_matrices=False)
    P = C @ vt[:3].T
    P /= np.abs(P).max(0)
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "galaxy.json").write_text(json.dumps({
        "source": "GloVe 6B 50d (Pennington, Socher, Manning 2014), Public Domain Dedication and License (PDDL)",
        "dims": 50, "scale": scale, "words": words,
        "vectors": base64.b64encode(Q.tobytes()).decode(),
        "coords": base64.b64encode(np.round(P * 32767).astype(np.int16).tobytes()).decode(),
        "analogies": analogies, "odd": odd,
    }))
    queries = ["king", "computer", "river", "music", "doctor", "france", "happy", "car", "science", "money",
               "war", "summer", "coffee", "football", "red", "brain", "ocean", "king", "internet", "art"]
    FIX.mkdir(parents=True, exist_ok=True)
    (FIX / "fixtures.json").write_text(json.dumps({
        "queries": queries,
        "neighbours": [nearest(Vq[idx[q]], 5, exclude=(q,)) for q in queries],
    }))
    size = (OUT / "galaxy.json").stat().st_size
    print(f"{len(words)} words · {len(analogies)}/{len(ANALOGIES)} analogies kept · {len(odd)}/{len(ODD_SETS)} odd-one-out sets kept · {size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
