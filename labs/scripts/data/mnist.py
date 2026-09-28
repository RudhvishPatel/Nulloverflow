"""Train the CNN Vision Lab model offline and export it for the browser.

Model: conv 1→8 (3×3) · ReLU · maxpool 2 · conv 8→16 (3×3) · ReLU · maxpool 2 · dense 400→32 · ReLU · dense 32→10
Data:  MNIST (Yann LeCun, Corinna Cortes, Christopher Burges; CC BY-SA 3.0), loaded via tf.keras.
Out:   ../../../assets/lab/11/data/cnn.json   int8 weights (base64) + per-tensor scales + shapes
       ../../../assets/lab/11/data/digits.json 40 test digits (uint8, base64) + labels for the adversarial round
       ../../tests/11-vision/fixtures.json     20 digits + dequantised-model logits for the TS parity test
Run:   ~/miniconda3/bin/python mnist.py
"""
import base64
import json
import pathlib

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

HERE = pathlib.Path(__file__).parent
SITE = HERE.parents[2]
OUT = SITE / "assets" / "lab" / "11" / "data"
FIX = HERE.parents[1] / "tests" / "11-vision"
torch.manual_seed(7)
np.random.seed(7)


class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.c1 = nn.Conv2d(1, 8, 3)
        self.c2 = nn.Conv2d(8, 16, 3)
        self.f1 = nn.Linear(16 * 5 * 5, 32)
        self.f2 = nn.Linear(32, 10)

    def forward(self, x):
        x = F.max_pool2d(F.relu(self.c1(x)), 2)
        x = F.max_pool2d(F.relu(self.c2(x)), 2)
        x = F.relu(self.f1(x.flatten(1)))
        return self.f2(x)


def load():
    import tensorflow as tf  # only for the dataset download

    (xtr, ytr), (xte, yte) = tf.keras.datasets.mnist.load_data()
    return xtr, ytr, xte, yte


def main():
    xtr, ytr, xte, yte = load()
    Xtr = torch.tensor(xtr, dtype=torch.float32).unsqueeze(1) / 255.0
    Xte = torch.tensor(xte, dtype=torch.float32).unsqueeze(1) / 255.0
    Ytr, Yte = torch.tensor(ytr, dtype=torch.long), torch.tensor(yte, dtype=torch.long)
    net = Net()
    opt = torch.optim.Adam(net.parameters(), lr=2e-3)
    sched = torch.optim.lr_scheduler.StepLR(opt, step_size=5, gamma=0.2)
    for epoch in range(8):
        perm = torch.randperm(len(Xtr))
        net.train()
        for i in range(0, len(Xtr), 128):
            idx = perm[i : i + 128]
            # light augmentation: random ±2 px shifts
            xb = torch.roll(Xtr[idx], shifts=(int(np.random.randint(-2, 3)), int(np.random.randint(-2, 3))), dims=(2, 3))
            loss = F.cross_entropy(net(xb), Ytr[idx])
            opt.zero_grad()
            loss.backward()
            opt.step()
        sched.step()
        net.eval()
        with torch.no_grad():
            acc = (net(Xte).argmax(1) == Yte).float().mean().item()
        print(f"epoch {epoch + 1}: test accuracy {acc:.4f}")

    # Quantise each tensor to int8 with a symmetric per-tensor scale.
    tensors = {}
    deq = {}
    for name, p in net.state_dict().items():
        a = p.detach().numpy().astype(np.float32)
        scale = float(np.abs(a).max() / 127) or 1.0
        q = np.clip(np.round(a / scale), -127, 127).astype(np.int8)
        tensors[name] = {"shape": list(a.shape), "scale": scale, "data": base64.b64encode(q.tobytes()).decode()}
        deq[name] = torch.tensor(q.astype(np.float32) * scale)
    qnet = Net()
    qnet.load_state_dict(deq)
    qnet.eval()
    with torch.no_grad():
        qacc = (qnet(Xte).argmax(1) == Yte).float().mean().item()
    print(f"int8 model test accuracy {qacc:.4f}")

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "cnn.json").write_text(json.dumps({"accuracy": round(qacc, 4), "tensors": tensors}))
    rng = np.random.default_rng(3)
    pick = rng.choice(len(xte), 60, replace=False)
    digits = pick[:40]
    (OUT / "digits.json").write_text(json.dumps({
        "labels": [int(yte[i]) for i in digits],
        "pixels": [base64.b64encode(xte[i].astype(np.uint8).tobytes()).decode() for i in digits],
        "source": "MNIST test set (LeCun, Cortes, Burges), CC BY-SA 3.0",
    }))
    fx = pick[40:]
    with torch.no_grad():
        logits = qnet(Xte[fx]).numpy().tolist()
    FIX.mkdir(parents=True, exist_ok=True)
    (FIX / "fixtures.json").write_text(json.dumps({
        "pixels": [base64.b64encode(xte[i].astype(np.uint8).tobytes()).decode() for i in fx],
        "labels": [int(yte[i]) for i in fx],
        "logits": logits,
    }))
    size = (OUT / "cnn.json").stat().st_size
    print(f"wrote cnn.json ({size / 1024:.1f} KB), digits.json, fixtures.json")


if __name__ == "__main__":
    main()
