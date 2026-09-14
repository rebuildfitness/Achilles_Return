import { ExerciseIllustration } from "./ExerciseIllustration";
import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import type { Exercise, SetLog, Tab } from "../types";
import { dayKey } from "../data/provisionalWeek.js";

export function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    Today: (
      <>
        <path d="m3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9" />
      </>
    ),
    Plan: (
      <>
        <rect x="4" y="5" width="16" height="16" rx="2" />
        <path d="M8 3v4m8-4v4M4 11h16M8 15h2m4 0h2m-8 3h2" />
      </>
    ),
    Progress: (
      <>
        <path d="M4 20V4m0 16h17M7 15l4-5 4 2 6-7m-5 0h5v5" />
      </>
    ),
    Tests: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4V2h6v2M8 12l3 3 5-6" />
      </>
    ),
    More: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <path d="m9 5 7 7-7 7" />,
    profile: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
      </>
    ),
    strength: (
      <>
        <path d="m6 6 12 12M3 8l5-5m8 18 5-5M2 5l3-3m14 20 3-3" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    alert: (
      <>
        <path d="m12 3 10 18H2L12 3Z" />
        <path d="M12 9v5m0 3v1" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    play: <path d="m8 4 12 8-12 8V4Z" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.arrow}
    </svg>
  );
}
export function AppHeader({ onProfile }: { onProfile: () => void }) {
  return (
    <header className="app-header">
      <a className="brand" href="#Today" aria-label="Achilles Return home">
        <svg viewBox="0 0 36 36" width="32" height="32" aria-hidden="true">
          <path
            d="M3 6v14l12 10V16L3 6Zm30 0v14L21 30V16L33 6Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
        <span>Achilles Return</span>
      </a>
      <button
        className="profile-button"
        onClick={onProfile}
        aria-label="Profile and settings"
      >
        <Icon name="profile" size={20} />
      </button>
    </header>
  );
}
export function BottomNav({
  tab,
  onSelect,
}: {
  tab: Tab;
  onSelect: (tab: Tab) => void;
}) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {(["Today", "Plan", "Progress", "Tests", "More"] as Tab[]).map((item) => (
        <button
          key={item}
          aria-current={tab === item ? "page" : undefined}
          onClick={() => onSelect(item)}
        >
          <Icon name={item} />
          <span>{item}</span>
        </button>
      ))}
    </nav>
  );
}
export function AppShell({
  tab,
  onSelect,
  children,
}: {
  tab: Tab;
  onSelect: (tab: Tab) => void;
  children: ReactNode;
}) {
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Skip to content
      </a>
      <AppHeader onProfile={() => onSelect("More")} />
      <main id="main" className="content" tabIndex={-1}>
        {children}
      </main>
      <BottomNav tab={tab} onSelect={onSelect} />
    </div>
  );
}
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`card ${className}`}>{children}</section>;
}
export function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`primary-button ${props.className || ""}`} />
  );
}
export function StatusCard({
  tone,
  title,
  children,
}: {
  tone: "ready" | "modified" | "stop" | "neutral";
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className={`status-card ${tone}`}>
      <span className="status-symbol">
        <Icon
          name={
            tone === "ready" ? "check" : tone === "neutral" ? "clock" : "alert"
          }
          size={28}
        />
      </span>
      <div>
        <h2>{title}</h2>
        <div className="status-copy">{children}</div>
      </div>
    </Card>
  );
}
export function ProgressStage({
  title,
  state,
  index,
}: {
  title: string;
  state: "current" | "locked" | "complete";
  index: number;
}) {
  return (
    <div className={`progress-stage ${state}`}>
      <span className="stage-symbol">
        {state === "complete" ? <Icon name="check" size={18} /> : index}
      </span>
      <div>
        <h3>{title}</h3>
        <small>
          {state === "current"
            ? "Current focus"
            : state === "complete"
              ? "Completed"
              : "Locked until criteria are met"}
        </small>
      </div>
    </div>
  );
}
export function TestCard({
  title,
  locked = false,
}: {
  title: string;
  locked?: boolean;
}) {
  return (
    <Card className="test-card">
      <Icon name={locked ? "lock" : "Tests"} />
      <div>
        <h3>{title}</h3>
        <small>{locked ? "Not needed yet" : "Measurements and history"}</small>
      </div>
    </Card>
  );
}
export function CalendarCard({
  sessionDates,
  onSelect,
  modifiedDates = [],
}: {
  sessionDates: string[];
  onSelect: (date: string) => void;
  modifiedDates?: string[];
}) {
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState(dayKey());
  const year = cursor.getFullYear(),
    month = cursor.getMonth();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  return (
    <Card>
      <div className="calendar-heading">
        <button
          aria-label="Previous month"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
        >
          ‹
        </button>
        <h3>
          {cursor.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <button
          aria-label="Next month"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
        >
          ›
        </button>
      </div>
      <div className="calendar-grid">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <small key={`day-${i}`}>{d}</small>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from(
          { length: new Date(year, month + 1, 0).getDate() },
          (_, i) => {
            const key = dayKey(new Date(year, month, i + 1)),
              completed = sessionDates.includes(key);
            return (
              <button
                key={key}
                className={`${selected === key ? "selected" : ""} ${completed ? "has-session" : ""} ${modifiedDates.includes(key) ? "modified-session" : ""}`}
                aria-label={`${key}${completed ? ", saved workout" : ""}`}
                aria-pressed={selected === key}
                onClick={() => {
                  setSelected(key);
                  onSelect(key);
                }}
              >
                {i + 1}
              </button>
            );
          },
        )}
      </div>
      <p className="calendar-legend">
        <span /> Saved workout
        <span className="modified-dot" /> Modified / response needs attention
      </p>
    </Card>
  );
}
export function SetRow({
  exercise,
  index,
  value,
  previous,
  onChange,
  completionLocked = false,
}: {
  completionLocked?: boolean;
  exercise: Exercise;
  index: number;
  value: SetLog;
  previous?: SetLog;
  onChange: (value: SetLog) => void;
}) {
  return (
    <div className="set-group">
      <div className={`set-row ${value.complete ? "set-complete" : ""}`}>
        <span>{index + 1}</span>
        <span className="previous">
          {previous ? `${previous.load || "—"} × ${previous.reps || "—"}` : "—"}
        </span>
        <input
          aria-label={`${exercise.name} set ${index + 1} load`}
          inputMode="decimal"
          type="number"
          min="0"
          step="any"
          placeholder="lb"
          value={value.load || ""}
          onChange={(e) => onChange({ ...value, load: e.target.value })}
        />
        <input
          aria-label={`${exercise.name} set ${index + 1} reps`}
          inputMode="numeric"
          type="number"
          min="0"
          step="1"
          placeholder="—"
          value={value.reps || ""}
          onChange={(e) => onChange({ ...value, reps: e.target.value })}
        />
        <button
          className="set-check"
          disabled={completionLocked}
          aria-label={`${exercise.name} set ${index + 1} complete`}
          aria-pressed={!!value.complete}
          onClick={() => onChange({ ...value, complete: !value.complete })}
        >
          <Icon name="check" size={19} />
        </button>
      </div>
      <details className="set-quality">
        <summary>Set {index + 1} · RPE, quality & symptoms</summary>
        <div className="quality-fields">
          <label>
            RPE
            <input
              aria-label={`${exercise.name} set ${index + 1} RPE`}
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={value.rpe || ""}
              onChange={(e) => onChange({ ...value, rpe: e.target.value })}
            />
          </label>
          <label>
            Quality
            <select
              value={value.quality || ""}
              onChange={(e) => onChange({ ...value, quality: e.target.value })}
            >
              <option value="">Choose…</option>
              <option value="good">Good height / control</option>
              <option value="reduced">Height / control reduced</option>
            </select>
          </label>
          <label>
            Symptoms
            <select
              value={value.symptoms || ""}
              onChange={(e) => onChange({ ...value, symptoms: e.target.value })}
            >
              <option value="">Choose…</option>
              <option value="none">None / baseline</option>
              <option value="increased">Increased</option>
            </select>
          </label>
        </div>
      </details>
    </div>
  );
}
export function ExerciseCard({
  exercise,
  children,
  online = true,
}: {
  exercise: Exercise;
  children?: ReactNode;
  online?: boolean;
}) {
  return (
    <Card className="exercise-card">
      <ExerciseIllustration key={exercise.id} exerciseId={exercise.id} name={exercise.name}>
        <h3>{exercise.name}</h3>
        <p className="exercise-prescription">
          {exercise.sets} × {exercise.reps}{" "}
          <span>
            · RPE {exercise.rpe} ·{" "}
            {exercise.restSec ? `${exercise.restSec}s rest` : "Continuous"}
          </span>
        </p>
        <div className="exercise-actions">
          {exercise.videoUrl && online ? (
            <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer">
              <Icon name="play" size={15} /> Short Demo
            </a>
          ) : (
            <span className="muted">
              {online ? "Short Demo unavailable" : "Video requires internet"}
            </span>
          )}
          <details>
            <summary>Why?</summary>
            <p>{exercise.purpose}</p>
            <p>{exercise.evidence}</p>
          </details>
        </div>
      </ExerciseIllustration>
      {exercise.adjustment && (
        <p className="adjustment">{exercise.adjustment}</p>
      )}
      {children}
      <p className="cue">{exercise.cue}</p>
    </Card>
  );
}
