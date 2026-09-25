import { useEffect, useRef, useState } from "react";
import { analyzeGuidance, decideGuidance } from "../../persistence/guidance.js";
import { listV2 } from "../../persistence/v2Repository.js";
import { subjectIntent, valueOf } from "../../domain/v2/guidance.js";
import { recordedSet, terminal } from "../../domain/v2/execution.js";
import "./GuidancePanel.css";
const today = () => new Date().toLocaleDateString("en-CA");
export function GuidancePanel({
  subjectId,
  changeToken,
  trigger,
  getSubject,
  onApplied,
  onModify,
  lock,
}: any) {
  const [result, setResult] = useState<any>(null),
    [decisions, setDecisions] = useState<any[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [all, setAll] = useState(false),
    [proposal, setProposal] = useState<any>(null),
    [selected, setSelected] = useState(""),
    [amount, setAmount] = useState("");
  const [evaluatedToken, setEvaluatedToken] = useState<any>(null);
  const alive = useRef(true),
    latest = useRef(changeToken);
  latest.current = changeToken;
  const stale = !!result && evaluatedToken !== changeToken;
  async function work(fn: any) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      if (alive.current) setError(String(e));
    } finally {
      if (alive.current) setBusy(false);
    }
  }
  async function analyze() {
    const token = latest.current;
    const subject = await getSubject();
    const next = await analyzeGuidance(subject, subject.planning ? subject.date : today());
    const ds = await listV2("v2GuidanceDecisions");
    if (!alive.current) return;
    setResult({ ...next, subject });
    setDecisions(ds);
    setEvaluatedToken(token);
    setProposal(null);
  }
  useEffect(() => {
    alive.current = true;
    work(analyze);
    return () => {
      alive.current = false;
    };
  }, [subjectId]);
  const firstTrigger = useRef(true);
  useEffect(() => {
    if (firstTrigger.current) {
      firstTrigger.current = false;
      return;
    }
    work(analyze);
  }, [trigger]);
  useEffect(() => {
    const invalidate = () => setEvaluatedToken(null);
    window.addEventListener("focus", invalidate);
    return () => window.removeEventListener("focus", invalidate);
  }, []);
  async function decide(event: any, action: string) {
    lock(true);
    try {
      await commitDecision(event, action);
    } finally {
      lock(false);
    }
  }
  async function commitDecision(event: any, action: string) {
    const subject = await getSubject();
    if (stale || latest.current !== evaluatedToken)
      throw Error("Workout changed. Analyze guidance again.");
    const response = await decideGuidance(
      subject,
      event,
      action,
      result,
      action === "accepted"
        ? { setId: selected, amount: amount === "" ? NaN : Number(amount) }
        : null,
    );
    setDecisions((ds) => [...ds, response.decision]);
    setProposal(null);
    if (action === "accepted") {
      await onApplied(response.subject);
      const next = await analyzeGuidance(response.subject, response.subject.planning ? response.subject.date : today());
      setResult({ ...next, subject: response.subject });
      setEvaluatedToken(
        JSON.stringify(response.subject.snapshot || response.subject),
      );
    }
  }
  const events = result?.events || [],
    visible = all ? events : events.slice(0, 3);
  const target =
    proposal?.proposal &&
    subjectIntent(result.subject).occurrences.find(
      (o: any) => o.id === proposal.proposal.targetId,
    );
  const editableSets =
    target?.sets.filter(
      (s: any) => !result.subject.execution || !recordedSet(s),
    ) || [];
  return (
    <section className="card v2-guidance" aria-label="Workout guidance">
      <div className="guidance-heading">
        <h2>Workout guidance</h2>
        <button disabled={busy} onClick={() => work(analyze)}>
          {result ? "Refresh guidance" : "Analyze workout"}
        </button>
      </div>
      <p className="helper">
        Advice supports your choices. You can start, log and save your workout.
      </p>
      {busy && <p role="status">Reviewing saved workout…</p>}
      {error && (
        <p role="alert">
          Guidance unavailable: {error}. Your workout remains available.
        </p>
      )}
      {stale && (
        <p role="status">
          Workout or context changed. Previous guidance is stale. Refresh to
          review current findings.
        </p>
      )}
      {result && !events.length && (
        <p>
          No guidance findings from the available information. This is not
          medical clearance.
        </p>
      )}
      {!stale &&
        visible.map((e: any) => {
          const decision = decisions
            .filter((d) => d.guidanceId === e.id)
            .at(-1);
          const occurrence = subjectIntent(result.subject).occurrences.find(
            (o: any) => o.id === e.occurrenceId,
          );
          return (
            <article
              key={e.id}
              className={"guidance-finding guidance-" + e.level.toLowerCase()}
            >
              <p className="guidance-level">{e.level.replace("_", " ")}</p>
              <h3>{e.finding}</h3>
              {occurrence && (
                <p className="helper">
                  Exercise {occurrence.order + 1}:{" "}
                  {valueOf(occurrence.definitionSnapshot.name)}
                </p>
              )}
              <p>{e.explanation}</p>
              <details>
                <summary>
                  {e.level === "CAUTION" ? "View Guidance" : "View Why"}
                </summary>
                <p>
                  Finding based on the saved workout and recorded context.
                  Missing:{" "}
                  {e.missingInputs.join(" · ") ||
                    "No additional missing inputs identified for this finding."}
                </p>
                {e.benchmarks && (
                  <ul>
                    {e.benchmarks.map((b: any) => (
                      <li key={b.id}>
                        {b.label}: {b.status.replaceAll("-", " ")}
                      </li>
                    ))}
                  </ul>
                )}
                {e.evidence.map((source: any) => (
                  <p key={source.id}>
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {source.title}
                      </a>
                    ) : (
                      source.title
                    )}
                    <br />
                    {source.type} · {source.strength}
                    <br />
                    {source.summary}
                    {source.limitations && (
                      <>
                        <br />
                        {typeof source.limitations === "string"
                          ? source.limitations
                          : JSON.stringify(source.limitations)}
                      </>
                    )}
                  </p>
                ))}
                <p className="helper">
                  Rule {e.ruleId} · version {e.ruleVersion} · evidence{" "}
                  {e.evidenceVersion} · workout revision {e.subjectRevision} ·{" "}
                  {new Date(e.at).toLocaleString()}
                </p>
                <details>
                  <summary>Recorded inputs and interpretation</summary>
                  <pre>
                    {JSON.stringify(
                      {
                        assessment: e.inputs.context.assessment,
                        checkIn: e.inputs.context.checkIn,
                        checkpoints: e.inputs.context.checkpoints,
                        observations: e.inputs.context.observations,
                        sourceSessionIds: e.supportingSessionIds,
                        interpretation: e.interpretation,
                        exerciseEvidence:
                          occurrence?.definitionSnapshot.evidence,
                        exerciseSource:
                          occurrence?.definitionSnapshot.sourceMetadata,
                      },
                      null,
                      2,
                    )}
                  </pre>
                </details>
              </details>
              {decision ? (
                <p className="guidance-decision">
                  Recorded decision: {decision.action.replaceAll("-", " ")}.{" "}
                  {e.level === "STRONG_WARNING"
                    ? "The warning remains; this is not medical clearance."
                    : "Your choice is recorded separately from the finding."}
                </p>
              ) : (
                e.level !== "INFORMATION" && (
                  <div className="builder-actions">
                    {!terminal(result.subject) && (
                      <button
                        disabled={busy}
                        onClick={() => {
                          setProposal(e);
                          setSelected("");
                          setAmount("");
                        }}
                      >
                        Modify Workout
                      </button>
                    )}
                    <button
                      disabled={busy}
                      onClick={() =>
                        work(() =>
                          decide(
                            e,
                            e.level === "STRONG_WARNING"
                              ? "continued-anyway"
                              : e.level === "CAUTION"
                                ? "acknowledged"
                                : "dismissed",
                          ),
                        )
                      }
                    >
                      {e.level === "STRONG_WARNING"
                        ? "Continue Anyway"
                        : e.level === "CAUTION"
                          ? "Continue"
                          : "Dismiss"}
                    </button>
                  </div>
                )
              )}
            </article>
          );
        })}
      {events.length > 3 && (
        <button onClick={() => setAll(!all)}>
          {all
            ? "Show important guidance"
            : `View All Guidance (${events.length})`}
        </button>
      )}
      {proposal && !stale && (
        <section
          className="guidance-proposal"
          aria-label="Suggested adjustment"
        >
          <h3>Suggested adjustment</h3>
          <p>
            {proposal.proposal?.description ||
              "Review the workout and choose the changes that suit your situation. No automatic dose is supplied."}
          </p>
          {proposal.proposal?.kind === "edit-target" && (
            <>
              <label>
                Upcoming set
                <select
                  aria-label="Proposal set"
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  <option value="">Choose a set</option>
                  {editableSets.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      Set {s.order + 1} · target{" "}
                      {valueOf(s.target.load?.amount) ?? "unknown"}{" "}
                      {valueOf(s.target.load?.unit)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Proposed target load
                <input
                  aria-label="Proposed target load"
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </label>
              <p>
                Changes only the selected upcoming target, not actual
                performance or other sets.
              </p>
            </>
          )}
          {["edit-target", "replace"].includes(proposal.proposal?.kind) ? (
            <button
              disabled={busy}
              onClick={() => work(() => decide(proposal, "accepted"))}
            >
              Apply Change
            </button>
          ) : (
            <button
              onClick={() => {
                setProposal(null);
                onModify();
              }}
            >
              Edit workout manually
            </button>
          )}
          <button
            disabled={busy}
            onClick={() => work(() => decide(proposal, "declined"))}
          >
            Keep Workout
          </button>
        </section>
      )}
    </section>
  );
}
