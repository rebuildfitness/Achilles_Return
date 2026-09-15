import { formatDuration } from "../data/workoutExperience.js";
import type { Session } from "../types";

export function History({ sessions }: { sessions: Session[] }) {
  return (
    <>
      {sessions.length === 0 ? (
        <p>No saved workout on this date.</p>
      ) : (
        [...sessions]
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map((s) => (
            <details className="history-row" key={s.id}>
              <summary>
                {s.workoutTitle || s.workoutId}{" "}
                <small>{s.status.replaceAll("_", " ").toLowerCase()}</small>
              </summary>
              {s.domain && (
                <p>
                  {s.exposureLevel} · {s.minutes} minutes · Session RPE{" "}
                  {s.sessionRPE ?? "—"} · Quality:{" "}
                  {s.movementQuality || "not recorded"}
                </p>
              )}
              <p>
                Difficulty:{" "}
                {s.overallDifficulty || s.sessionRPE || "Not recorded"} ·
                Immediate Achilles response:{" "}
                {s.immediateAchillesResponse || "Not recorded"}
              </p>
              {s.durationMs != null && <p>Workout time: {formatDuration(s.durationMs)}</p>}
              {!!s.nextDayResponse && (
                <details>
                  <summary>Next-morning details</summary>
                  <pre>{JSON.stringify(s.nextDayResponse, null, 2)}</pre>
                </details>
              )}
              {Object.entries(s.exerciseLog || {}).map(([id, entry]) => (
                <div key={id}>
                  <h3>
                    {s.plannedItems?.find((e) => e.id === id)?.name || id}
                  </h3>
                  {entry.sets.filter(Boolean).map((set, i) => (
                    <p key={i}>
                      Set {i + 1}: {set.load || "—"} lb × {set.reps || "—"}{" "}
                      {set.complete ? "✓" : ""}
                      {set.rpe ? ` · RPE ${set.rpe}` : ""}
                      {set.quality ? ` · ${set.quality} quality` : ""}
                      {set.symptoms ? ` · symptoms: ${set.symptoms}` : ""}
                      {!!set.inheritedFields?.length && ` · Carried ${set.inheritedFields.join(", ")}: ${set.feedbackConfirmed ? "confirmed" : "unconfirmed"}`}
                    </p>
                  ))}
                </div>
              ))}
              {s.notes && <p>{s.notes}</p>}
              <small>
                Saved {new Date(s.createdAt).toLocaleString()} · Rules{" "}
                {s.rulesetVersion || "legacy"}
              </small>
            </details>
          ))
      )}
    </>
  );
}
