"use client";

import { useCallback, useMemo, useState } from "react";
import { scaleArenaPairs, type ScalePair } from "@/lib/content";

type Side = "left" | "right";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function largerSide(pair: ScalePair): Side {
  return pair.left.sizeMeters >= pair.right.sizeMeters ? "left" : "right";
}

export default function ScaleArena() {
  const deck = useMemo(() => shuffle(scaleArenaPairs), []);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<Side | null>(null);
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState(false);

  const pair = deck[index];
  const correct = pair ? largerSide(pair) : "left";
  const total = deck.length;

  const pick = useCallback(
    (side: Side) => {
      if (!pair || answered || done) return;
      const ok = side === correct;
      setAnswered(side);
      if (ok) {
        setScore((s) => s + 1);
        setStreak((s) => s + 1);
      } else {
        setStreak(0);
      }
    },
    [pair, answered, done, correct]
  );

  const next = useCallback(() => {
    if (index + 1 >= total) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setAnswered(null);
  }, [index, total]);

  const restart = useCallback(() => {
    setIndex(0);
    setScore(0);
    setAnswered(null);
    setStreak(0);
    setDone(false);
  }, []);

  if (!pair) return null;

  return (
    <div className="scale-arena">
      <div className="scale-chrome">
        <span className="mono">lab/scale-arena · crt phosphor</span>
        <span className="scale-score mono" aria-live="polite">
          SCORE <strong>{score}</strong>
          <span className="scale-score-sep">/</span>
          {total}
          {streak > 1 && !done ? (
            <span className="scale-streak"> · streak {streak}</span>
          ) : null}
        </span>
      </div>

      {done ? (
        <div className="scale-done">
          <p className="mono">&gt; RUN COMPLETE</p>
          <h3>
            Final score{" "}
            <span className="scale-final">{score}</span>
            <span className="mono"> / {total}</span>
          </h3>
          <p className="scale-done-copy">
            {score === total
              ? "Perfect calibration. Sensors aligned."
              : score >= total * 0.6
                ? "Solid read. Recalibrate the misses and re-run."
                : "Scale drift detected. Try another pass."}
          </p>
          <button type="button" className="btn btn-signal" onClick={restart}>
            Re-run arena
          </button>
        </div>
      ) : (
        <>
          <p className="scale-prompt mono">
            &gt; QUERY [{index + 1}/{total}] — which object is physically larger?
          </p>
          <div className="scale-grid">
            {(["left", "right"] as Side[]).map((side) => {
              const obj = pair[side];
              let state = "";
              if (answered) {
                if (side === correct) state = "is-correct";
                else if (side === answered) state = "is-wrong";
              }
              return (
                <button
                  key={side}
                  type="button"
                  className={`scale-card ${state}`}
                  onClick={() => pick(side)}
                  disabled={!!answered}
                >
                  <span className="mono scale-card-side">{side === "left" ? "A" : "B"}</span>
                  <span className="scale-card-name">{obj.name}</span>
                  {answered ? (
                    <span className="mono scale-card-size">{obj.sizeLabel}</span>
                  ) : (
                    <span className="mono scale-card-hint">tap to select</span>
                  )}
                </button>
              );
            })}
          </div>
          {answered ? (
            <div className="scale-feedback">
              <p className="mono">
                {answered === correct ? (
                  <>&gt; HIT — larger is {pair[correct].name}</>
                ) : (
                  <>&gt; MISS — larger is {pair[correct].name} ({pair[correct].sizeLabel})</>
                )}
              </p>
              <button type="button" className="btn" onClick={next}>
                {index + 1 >= total ? "View score →" : "Next pair →"}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
