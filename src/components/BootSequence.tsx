"use client";

import { useEffect, useState } from "react";

const LINES = [
  "> null_overflow --boot",
  "> loading kernel modules .............. ok",
  "> mount /work /capabilities /lab ...... ok",
  "> phosphor calibration ................ ok",
  "> engineer profile: rudhvish.patel .... ready",
  "> enter",
];

export default function BootSequence() {
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("no-crt-boot") === "1") return;
    } catch { /* ignore */ }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    setShow(true);
  }, []);

  useEffect(() => {
    if (!show) return;
    if (visible >= LINES.length) {
      const t = window.setTimeout(() => {
        setDone(true);
        try { sessionStorage.setItem("no-crt-boot", "1"); } catch { /* ignore */ }
        window.setTimeout(() => setShow(false), 500);
      }, 450);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setVisible((v) => v + 1), visible === 0 ? 200 : 320);
    return () => window.clearTimeout(t);
  }, [show, visible]);

  if (!show) return null;

  return (
    <div className="boot-overlay" data-done={done ? "true" : "false"} aria-hidden={done}>
      <div className="boot-terminal" role="status">
        {LINES.slice(0, visible).map((l) => (
          <div key={l} className="line">{l}</div>
        ))}
        {visible < LINES.length ? (
          <div className="line">
            _
            <span className="cursor" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
