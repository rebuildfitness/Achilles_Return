import { MeasurementJournal } from "../components/MeasurementJournal";
import { useState, type FormEvent } from "react";
import { Card, PrimaryButton } from "../components/ui";
import { AssessmentResult } from "./Baseline";
import { monthlyStatus, assessmentLabel } from "../data/assessmentHistory.js";
import { BASELINE_SECTIONS } from "../data/baseline.js";
import { CHECKPOINTS } from "../data/checkpoints.js";
import { checkpointAvailability } from "../rules/progression.js";
import { dayKey } from "../data/provisionalWeek.js";
import { get } from "../db.js";
import type { Assessment, Session, Values } from "../types";

export function TestsScreen({
  assessment,
  assessments,
  draft,
  checkpoints,
  onBaseline,
  onCheckpoint,
  sessions,
}: {
  assessment?: Assessment;
  assessments: Assessment[];
  draft?: Assessment;
  checkpoints: Values;
  onBaseline: () => void;
  onCheckpoint: (v: Values) => Promise<void>;
  sessions: Session[];
}) {
  const [editing, setEditing] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function review(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = new FormData(e.currentTarget);
      await onCheckpoint({
        ...checkpoints,
        [editing]: String(data.get("result")),
        [`${editing}_evidence`]: String(data.get("evidence")),
        [`${editing}_date`]: String(data.get("date")),
      });
      setEditing("");
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="screen-heading">
        <h1>Tests</h1>
        <p>Measure what matters. Retest with the same setup.</p>
      </div>
      <Card>
        <h2>
          {assessment ? "Baseline & reassessment" : "Establish your baseline"}
        </h2>
        <p>
          {assessment
            ? `Last completed ${new Date(assessment.completedAt!).toLocaleDateString()}`
            : "A guided assessment of symptoms, strength, balance, function and confidence."}
        </p>
        <div className="baseline-pair">
          <span>
            Starting data
            <strong>
              {monthlyStatus(assessments).startDone
                ? "Recorded"
                : "Not recorded"}
            </strong>
          </span>
          <span>
            Finishing data
            <strong>
              {monthlyStatus(assessments).finishDone
                ? "Recorded"
                : "Not recorded"}
            </strong>
          </span>
        </div>
        <p className="helper">
          {monthlyStatus(assessments).month} · Record finishing data near{" "}
          {monthlyStatus(assessments).finishDate}.
        </p>
        <PrimaryButton onClick={onBaseline}>
          {Object.keys(draft?.values || {}).length
            ? "Resume assessment"
            : assessment
              ? "Start reassessment"
              : "Start Baseline"}
        </PrimaryButton>
      </Card>
      <MeasurementJournal editable />
      {assessment && (
        <details className="detail-section">
          <summary>Current entry criteria</summary>
          <AssessmentResult assessment={assessment} />
        </details>
      )}
      <details className="detail-section">
        <summary>Capacity reviews</summary>
        <Card>
          <h2>Capacity reviews</h2>
          <p>
            More advanced assessments become available as their existing
            prerequisites are met. Record the result of a performed assessment.
            These reviews address qualitative prerequisites in the approved
            plan; a score alone is not clearance.
          </p>
          {CHECKPOINTS.map((c) => (
            <details key={c.id} className="review-row">
              <summary>
                {checkpoints[c.id] === "yes" ? "✓" : "○"} {c.label}
              </summary>
              <p>{c.description}</p>
              {checkpoints[`${c.id}_evidence`] && (
                <p>
                  Recorded evidence: {String(checkpoints[`${c.id}_evidence`])} (
                  {String(checkpoints[`${c.id}_date`])})
                </p>
              )}
              <button
                className="text-button"
                disabled={
                  !assessment ||
                  !checkpointAvailability(
                    c.id,
                    assessment.values,
                    checkpoints,
                    sessions,
                  )
                }
                onClick={() => {
                  setEditing(c.id);
                  setError("");
                }}
              >
                {assessment &&
                checkpointAvailability(
                  c.id,
                  assessment.values,
                  checkpoints,
                  sessions,
                )
                  ? "Record review"
                  : "Not needed yet"}
              </button>
            </details>
          ))}
          {editing && (
            <form onSubmit={review} className="review-form">
              <h3>{CHECKPOINTS.find((c) => c.id === editing)?.label}</h3>
              <label>
                Result
                <select name="result" required defaultValue="">
                  <option value="">Choose…</option>
                  <option value="yes">Demonstrated / reviewed as met</option>
                  <option value="no">Not yet met</option>
                  <option value="unsure">Needs further review</option>
                </select>
              </label>
              <label>
                Assessment date
                <input
                  name="date"
                  type="date"
                  max={dayKey()}
                  defaultValue={dayKey()}
                  required
                />
              </label>
              <label>
                Measurements, setup, movement quality and reviewer
                <textarea
                  name="evidence"
                  required
                  minLength={12}
                  rows={4}
                  placeholder="Describe the assessment performed and its result."
                />
              </label>
              <p className="helper">
                High-speed and unrestricted sport reviews should include your
                clinician/performance professional. Record actual findings; do
                not check a gate simply to unlock it.
              </p>
              <PrimaryButton disabled={busy}>Save review</PrimaryButton>
              <button
                type="button"
                className="text-button"
                onClick={() => setEditing("")}
              >
                Cancel
              </button>
            </form>
          )}
          {error && <p role="alert">{error}</p>}
        </Card>
      </details>
      {assessments.length > 0 && (
        <Card>
          <h2>Assessment history</h2>
          {assessments.map((a) => (
            <details key={a.id}>
              <summary>{assessmentLabel(a)}</summary>
              <AssessmentResult assessment={a} />
              <details>
                <summary>All saved answers & measurements</summary>
                <dl>
                  {BASELINE_SECTIONS.flatMap((s) => s.fields).map((f) => (
                    <div key={f.id}>
                      <dt>{f.label}</dt>
                      <dd>
                        {a.values[f.id] === undefined || a.values[f.id] === ""
                          ? "Not recorded"
                          : Array.isArray(a.values[f.id])
                            ? (a.values[f.id] as string[]).join(", ") ||
                              "None selected"
                            : String(a.values[f.id])}
                      </dd>
                    </div>
                  ))}
                </dl>
              </details>
            </details>
          ))}
        </Card>
      )}
    </>
  );
}
