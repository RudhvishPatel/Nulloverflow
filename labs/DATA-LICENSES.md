# Data and model licences

| Asset | Source | Licence | Used by |
|---|---|---|---|
| `assets/lab/10/data/galaxy.json` | GloVe 6B 50d, Pennington, Socher & Manning (2014), Stanford NLP | Public Domain Dedication and License (PDDL) | lab/10 Embedding Galaxy (8,000 words, int8) |
| `assets/lab/11/data/cnn.json`, `digits.json` | Model trained on MNIST (LeCun, Cortes & Burges) by `scripts/data/mnist.py` | MNIST: CC BY-SA 3.0; model weights: ours | lab/11 CNN Vision Lab |
| `assets/lab/<theme>/*.woff2` | Google Fonts repository, `ofl/` folder | SIL Open Font License 1.1 | all lab themes |

Rebuild data: `~/miniconda3/bin/python scripts/data/glove.py` and `scripts/data/mnist.py`.
