import { PlannedExposure } from "../components/PlannedExposure";
import { displayDate } from "../data/displayDates.js";
import { SectionSwitch } from "../components/SectionSwitch";
import { useState } from "react";
import { Card, PrimaryButton, CalendarCard } from "../components/ui";
import { RescheduleWorkout } from "../components/RescheduleWorkout";
import { weeklyPlan } from "../rules/planner.js";
import { dayKey } from "../data/provisionalWeek.js";
import type { Assessment, Profile, Session, Exercise } from "../types";
import { History } from "./History";

export function PlanScreen({
  checkpoints,
  onExposure,
  onMovement,
  profile,
  assessment,
  sessions,
  readiness,
  onTests,
  onReload,
}: {
  checkpoints: Record<string, any>;
  onExposure: (domain: string) => void;
  onMovement: (date: string) => void;
  profile?: Profile;
  assessment?: Assessment;
  sessions: Session[];
  readiness: string;
  onTests: () => void;
  onReload: () => Promise<void>;
}) {
  const [selected, setSelected] = useState(dayKey()),
    [offset, setOffset] = useState(0);
  const [view, setView] = useState("week");
  const date = new Date();
  date.setDate(date.getDate() + offset * 7);
  const days = weeklyPlan(profile, assessment, sessions, date, readiness, checkpoints, dayKey());
  return (
    <>
      <div className="screen-heading">
        <h1>Plan</h1>
        <p>Your full week. Capacity first, recovery built in.</p><p className="helper">The plan updates automatically when saved criteria and responses support the next dose. Future work remains provisional.</p>
      </div>
      <SectionSwitch
        label="Plan views"
        value={view}
        onChange={setView}
        options={[
          ["week", "Week"],
          ["history", "Calendar"],
          ["schedule", "Reschedule"],
        ]}
      />
      {view === "schedule" && assessment && (
        <RescheduleWorkout
          profile={profile}
          assessment={assessment}
          sessions={sessions}
          onSaved={onReload}
        />
      )}
      {!assessment && (
        <Card>
          <h2>Baseline first</h2>
          <p>A personalized plan becomes active after assessment.</p>
          <PrimaryButton onClick={onTests}>Start Baseline</PrimaryButton>
        </Card>
      )}
      {view === "week" && (
        <>
          <div className="calendar-heading">
            <button
              aria-label="Previous week"
              onClick={() => setOffset(offset - 1)}
            >
              ‹
            </button>
            <h2>
              {days[0].dateObj.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}{" "}
              –{" "}
              {days[6].dateObj.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </h2>
            <button
              aria-label="Next week"
              onClick={() => setOffset(offset + 1)}
            >
              ›
            </button>
          </div>
          {days.map((day) => (
            <Card key={day.date} className={`plan-day-card ${day.date === dayKey() ? "is-today" : ""}`}>
              <details className="plan-day">
                <summary>
                  <span className="plan-date" aria-hidden="true"><span>{day.dateObj.toLocaleDateString(undefined,{weekday:"short"})}</span><b>{day.dateObj.getDate()}</b></span>
                  <div><strong>
                    {day.dateObj.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · {day.title}
                  </strong>
                  <small>
                    {sessions.some((s) => s.date === day.date && !s.domain)
                      ? "Workout saved"
                      : day.workout
                        ? `${day.workout.items.length} exercises · ${day.focus}`
                        : day.focus}
                  </small>{day.date===dayKey() && <span className="pill">Today</span>}</div>
                </summary>
                <p className="plan-context">{day.note}</p>{assessment && day.workout && <button className="text-button" onClick={()=>setView("schedule")}>Reschedule workout →</button>}
                {day.date <= dayKey() && (
                  <button
                    className="text-button"
                    onClick={() => onMovement(day.date)}
                  >
                    Optional movement support →
                  </button>
                )}
                {day.retest && (
                  <p className="notice">
                    Reassessment due after more than 10 missed days. Resume with
                    a reduced dose after retesting.
                  </p>
                )}
                {day.workout?.items.map((ex: Exercise) => (
                  <div key={ex.id} className="preview-row">
                    <span className="exercise-bullet" />
                    <span>{ex.name}</span>
                    <span>
                      {ex.sets} × {ex.reps}{ex.progressionTarget && <small>{ex.progressionTarget.text}</small>}
                    </span>
                  </div>
                ))}
                <PlannedExposure exposure={day.exposure} onStart={onExposure} />
                {day.progressionReviews.map((r: any) => <p className="helper" key={r.domain}>{r.level}: {r.reason}</p>)}
                {day.high && (
                  <p className="helper">
                    Eligible running or sport work belongs on a loading day,
                    before strength when appropriate. Your eligible dose is scheduled
                    automatically; other options remain in Progress; do not add separate catch-up sessions.
                  </p>
                )}
                {day.workout?.notes?.map((note: string) => (
                  <p key={note} className="helper">
                    {note}
                  </p>
                ))}
              </details>
            </Card>
          ))}
        </>
      )}
      {view === "history" && (
        <>
          <div className="section-heading">
            <h2>Workout Calendar</h2>
          </div>
          <CalendarCard
            modifiedDates={sessions
              .filter(
                (s) =>
                  s.readiness?.level.startsWith("YELLOW") ||
                  ["BORDERLINE", "NOT_TOLERATED", "MEDICAL_FLAG"].includes(
                    s.status,
                  ),
              )
              .map((s) => s.date)}
            sessionDates={sessions.map((s) => s.date)}
            onSelect={setSelected}
          />
          {assessment && selected <= dayKey() && (
            <Card>
              <h2>Movement & Recovery</h2>
              <button
                className="secondary-button"
                onClick={() => onMovement(selected)}
              >
                View / log movement · {displayDate(selected)}
              </button>
            </Card>
          )}
          <Card>
            <h2>
              {new Date(selected + "T12:00:00").toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
              })}
            </h2>
            <History sessions={sessions.filter((s) => s.date === selected)} allSessions={sessions} />
          </Card>
        </>
      )}
    </>
  );
}
