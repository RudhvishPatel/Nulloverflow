"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  MODE_META,
  RUN_ROUNDS,
  dailyRun,
  formatMagnitude,
  scoreGuess,
  utcDateKey,
  type MagnitudeMode,
  type MagnitudePuzzle,
} from "@/lib/magnitude-run";

const STREAK_KEY = "no-magnitude-run-streak-v1";
const MODES: MagnitudeMode[] = ["size", "pop", "geo"];

/** Reference silhouette occupies this fraction of stage height (visual). */
const REF_FRAC = 0.42;
/** Guess scale relative to reference visual height; 1 = same visual height as ref. */
const GUESS_MIN = 0.08;
const GUESS_MAX = 8;

function SilhouetteSvg({
  path,
  className,
  title,
}: {
  path: string;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d={path} />
    </svg>
  );
}

export default function MagnitudeRun() {
  const dateKey = useMemo(() => utcDateKey(), []);
  const [mode, setMode] = useState<MagnitudeMode>("size");
  const [run, setRun] = useState<MagnitudePuzzle[]>(() => dailyRun("size", dateKey));
  const [round, setRound] = useState(0);
  const [guessScale, setGuessScale] = useState(1);
  const [viewZoom, setViewZoom] = useState(1);
  const [locked, setLocked] = useState(false);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const [lastResult, setLastResult] = useState<{ score: number; offByPct: number; guessH: number } | null>(
    null
  );
  const [streak, setStreak] = useState(0);
  const [finished, setFinished] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startScale: number } | null>(null);

  const puzzle = run[round] ?? run[0];
  const totalScore = roundScores.reduce((a, b) => a + b, 0);
  const meta = MODE_META[mode];

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STREAK_KEY);
      if (raw) {
        const n = Number(raw);
        if (Number.isFinite(n) && n >= 0) setStreak(n);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persistStreak = useCallback((next: number) => {
    setStreak(next);
    try {
      sessionStorage.setItem(STREAK_KEY, String(next));
    } catch {
      /* ignore */
    }
  }, []);

  const resetGuess = useCallback((p: MagnitudePuzzle) => {
    // Start guess at geometric mid between tiny and a bit larger than ratio of heights
    const ratio = p.target.heightMeters / p.reference.heightMeters;
    const mid = Math.sqrt(Math.min(GUESS_MAX, Math.max(GUESS_MIN, ratio)) * 1);
    setGuessScale(Math.min(GUESS_MAX, Math.max(GUESS_MIN, mid * 0.55)));
    setViewZoom(1);
    setLocked(false);
    setLastResult(null);
  }, []);

  const switchMode = useCallback(
    (m: MagnitudeMode) => {
      const next = dailyRun(m, dateKey);
      setMode(m);
      setRun(next);
      setRound(0);
      setRoundScores([]);
      setFinished(false);
      resetGuess(next[0]);
    },
    [dateKey, resetGuess]
  );

  const stageHeightPx = () => stageRef.current?.clientHeight ?? 320;
  const refPx = () => stageHeightPx() * REF_FRAC * viewZoom;
  const guessHeightMeters = () =>
    puzzle.reference.heightMeters * (guessScale);

  const onHandlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (locked || finished) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startY: e.clientY, startScale: guessScale };
  };

  const onHandlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current || locked) return;
    const dy = dragRef.current.startY - e.clientY;
    const pxPerUnit = refPx() || 1;
    const next = dragRef.current.startScale + dy / pxPerUnit;
    setGuessScale(Math.min(GUESS_MAX, Math.max(GUESS_MIN, next)));
  };

  const onHandlePointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragRef.current = null;
  };

  const lockIn = useCallback(() => {
    if (locked || finished || !puzzle) return;
    const guessH = puzzle.reference.heightMeters * guessScale;
    const result = scoreGuess(guessH, puzzle.target.heightMeters);
    setLastResult({ ...result, guessH });
    setLocked(true);
    setRoundScores((s) => [...s, result.score]);
    if (result.score >= 80) persistStreak(streak + 1);
    else persistStreak(0);
  }, [locked, finished, puzzle, guessScale, persistStreak, streak]);

  const nextRound = useCallback(() => {
    if (round + 1 >= RUN_ROUNDS) {
      setFinished(true);
      return;
    }
    const next = round + 1;
    setRound(next);
    resetGuess(run[next]);
  }, [round, run, resetGuess]);

  const restart = useCallback(() => {
    const next = dailyRun(mode, dateKey);
    setRun(next);
    setRound(0);
    setRoundScores([]);
    setFinished(false);
    resetGuess(next[0]);
  }, [mode, dateKey, resetGuess]);

  if (!puzzle) return null;

  const actualScale = puzzle.target.heightMeters / puzzle.reference.heightMeters;
  const guessH = guessHeightMeters();

  return (
    <div className="magnitude-run">
      <div className="scale-chrome">
        <span className="mono">lab/02 · magnitude-run · silhouette</span>
        <span className="scale-score mono" aria-live="polite">
          ROUND <strong>{Math.min(round + 1, RUN_ROUNDS)}</strong>
          <span className="scale-score-sep">/</span>
          {RUN_ROUNDS}
          <span className="scale-score-sep"> · </span>
          SCORE <strong>{totalScore}</strong>
          <span className="scale-score-sep">/</span>
          {RUN_ROUNDS * 100}
          {streak > 0 ? <span className="scale-streak"> · streak {streak}</span> : null}
        </span>
      </div>

      <div className="mag-tabs" role="tablist" aria-label="Magnitude modes">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            className={`mag-tab${mode === m ? " is-active" : ""}`}
            onClick={() => switchMode(m)}
          >
            {MODE_META[m].label}
          </button>
        ))}
      </div>

      <p className="mono mag-seed">
        &gt; DAILY SEED {dateKey} · channel {meta.code} · 5-round run
      </p>

      {finished ? (
        <div className="mag-summary scale-done">
          <p className="mono">&gt; RUN COMPLETE</p>
          <h3>
            TOTAL <span className="scale-final">{totalScore}</span> / {RUN_ROUNDS * 100}
          </h3>
          <p className="scale-done-copy">
            Silhouette calibration locked for {meta.label}. Same daily seed tomorrow
            reshuffles this mode&apos;s bank.
          </p>
          <button type="button" className="btn btn-signal" onClick={restart}>
            Replay today&apos;s run
          </button>
        </div>
      ) : (
        <>
          <p className="scale-prompt mono">
            &gt; QUERY [{meta.code}] — Scale{" "}
            <strong>{puzzle.target.name}</strong> to match{" "}
            <strong>{puzzle.reference.name}</strong> ({formatMagnitude(puzzle.reference.heightMeters)}{" "}
            {puzzle.unitLabel})
          </p>

          <div className="mag-stage-toolbar">
            <span className="mono mag-hint">
              drag amber corner · zoom view
            </span>
            <div className="mag-zoom">
              <button
                type="button"
                className="mag-zoom-btn"
                aria-label="Zoom out"
                disabled={locked}
                onClick={() => setViewZoom((z) => Math.max(0.45, +(z - 0.15).toFixed(2)))}
              >
                −
              </button>
              <span className="mono mag-zoom-label">{Math.round(viewZoom * 100)}%</span>
              <button
                type="button"
                className="mag-zoom-btn"
                aria-label="Zoom in"
                disabled={locked}
                onClick={() => setViewZoom((z) => Math.min(2.2, +(z + 0.15).toFixed(2)))}
              >
                +
              </button>
            </div>
          </div>

          <div className="mag-stage" ref={stageRef}>
            <div className="mag-grid" aria-hidden />
            <div className="mag-baseline" aria-hidden />

            <div
              className="mag-sil-slot mag-sil-slot--ref"
              style={{
                height: `${REF_FRAC * 100 * viewZoom}%`,
                maxHeight: "92%",
              }}
            >
              <span className="mag-sil-label mono">REF</span>
              <SilhouetteSvg
                path={puzzle.reference.silhouette}
                className="mag-silhouette mag-sil--ref"
                title={puzzle.reference.name}
              />
              <span className="mag-sil-name mono">{puzzle.reference.name}</span>
            </div>

            <div
              className="mag-sil-slot mag-sil-slot--guess"
              style={{
                height: `${REF_FRAC * 100 * viewZoom * guessScale}%`,
                maxHeight: "92%",
              }}
            >
              <span className="mag-sil-label mono">GUESS</span>
              <SilhouetteSvg
                path={puzzle.target.silhouette}
                className="mag-silhouette mag-sil--guess"
                title={puzzle.target.name}
              />
              {!locked ? (
                <button
                  type="button"
                  className="mag-handle"
                  aria-label="Drag to scale silhouette"
                  onPointerDown={onHandlePointerDown}
                  onPointerMove={onHandlePointerMove}
                  onPointerUp={onHandlePointerUp}
                  onPointerCancel={onHandlePointerUp}
                />
              ) : null}
              <span className="mag-sil-name mono">{puzzle.target.name}</span>
            </div>

            {locked ? (
              <div
                className="mag-sil-slot mag-sil-slot--actual"
                style={{
                  height: `${REF_FRAC * 100 * viewZoom * actualScale}%`,
                  maxHeight: "92%",
                }}
              >
                <span className="mag-sil-label mono">ACTUAL</span>
                <SilhouetteSvg
                  path={puzzle.target.silhouette}
                  className="mag-silhouette mag-sil--actual"
                  title={`Actual ${puzzle.target.name}`}
                />
              </div>
            ) : null}
          </div>

          <p className="mono mag-estimate">
            ESTIMATE{" "}
            <strong>
              {formatMagnitude(guessH)} {puzzle.unitLabel}
            </strong>
          </p>

          {!locked ? (
            <div className="mag-actions">
              <button type="button" className="btn btn-signal mag-lock" onClick={lockIn}>
                Lock In
              </button>
            </div>
          ) : lastResult ? (
            <div
              className={`mag-reveal${lastResult.score >= 70 ? " is-hit" : " is-miss"}`}
            >
              <p className="mono">
                &gt; SCORE {lastResult.score}/100 · Off by {lastResult.offByPct}%
              </p>
              <p className="mono mag-truth">
                Your answer {formatMagnitude(lastResult.guessH)} {puzzle.unitLabel}
                <span className="mag-truth-sep"> · </span>
                Actual {formatMagnitude(puzzle.target.heightMeters)} {puzzle.unitLabel}
              </p>
              <button type="button" className="btn" onClick={nextRound}>
                {round + 1 >= RUN_ROUNDS ? "See run total →" : "Next Round →"}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
