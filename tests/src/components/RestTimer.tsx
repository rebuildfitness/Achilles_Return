import { useEffect, useState } from "react";

export function RestTimer({
  storageKey,
  signal,
}: {
  storageKey: string;
  signal: { seconds: number; at: number } | null;
}) {
  const [deadline, setDeadline] = useState(() => {
    try {
      return Number(sessionStorage.getItem(storageKey)) || 0;
    } catch {
      return 0;
    }
  });
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (signal) {
      setDeadline(signal.at + signal.seconds * 1000);
      setNow(Date.now());
    }
  }, [signal]);
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, String(deadline));
    } catch {
      /* Timing remains available in memory. */
    }
  }, [deadline, storageKey]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));
  return (
    <div className="rest-timer">
      <div>
        <span className="eyebrow">REST TIMER</span>
        <strong aria-label="Rest remaining">
          {deadline
            ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
            : "Ready"}
        </strong>
        <small>
          {deadline && !seconds
            ? "Rest complete. Continue when ready."
            : "Starts when you complete a set."}
        </small>
      </div>
      <div className="timer-actions">
        <button
          className="text-button"
          onClick={() => {
            setDeadline(Math.max(Date.now(), deadline) + 30000);
            setNow(Date.now());
          }}
        >
          +30 sec
        </button>
        <button className="text-button" onClick={() => setDeadline(0)}>
          Clear
        </button>
      </div>
    </div>
  );
}
