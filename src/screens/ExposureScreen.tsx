import { useEffect, useRef, useState } from "react";
import { Card, PrimaryButton } from "../components/ui";
import { DataField } from "./Baseline";
import { PROGRESSION_DOMAINS } from "../data/catalog.js";
import { CLINICAL_COPY } from "../data/evidence.js";
import { exposureDecision, exposureReentry } from "../rules/progression.js";
import {
  exposureContent,
  courtCap,
  validateExposureLog,
} from "../data/exposures.js";
import { dayKey } from "../data/provisionalWeek.js";
import { get, put } from "../db.js";
import type { Assessment, Session, Values } from "../types";

export function ExposureScreen({
  domain,
  assessment,
  checkpoints,
  sessions,
  readiness,
  onSave,
  onBack,
}: {
  domain: string;
  assessment: Assessment;
  checkpoints: Values;
  sessions: Session[];
  readiness: string;
  onSave: (
    v: Values,
    decision: ReturnType<typeof exposureDecision>,
  ) => Promise<void>;
  onBack: () => void;
}) {
  const decision = exposureDecision(
      domain,
      assessment.values,
      checkpoints,
      sessions,
      readiness,
    ),
    content = exposureContent(domain, decision.level),
    cap = courtCap(decision.level, sessions);
  const reentry = exposureReentry(
    domain,
    sessions,
    dayKey(),
    assessment.completedAt,
  );
  const needsDose = content.needsIndividualDose || reentry.reduction > 0;
  const [values, setValues] = useState<Values>({}),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const queue = useRef(Promise.resolve()),
    [draftReady, setDraftReady] = useState(false);
  const draftId = `exposure-draft-${domain}-${dayKey()}`;
  useEffect(() => {
    let active = true;
    get("settings", draftId)
      .then((record) => {
        if (active) {
          const draft = record as
            { level?: string; values?: Values } | undefined;
          if (draft?.level === decision.level) setValues(draft.values || {});
          setDraftReady(true);
        }
      })
      .catch((e) => setError(String(e)));
    return () => {
      active = false;
    };
  }, [draftId, decision.level]);
  function change(id: string, value: string | string[]) {
    const next = { ...values, [id]: value };
    setValues(next);
    queue.current = queue.current
      .catch(() => {})
      .then(async () => {
        await put("settings", {
          id: draftId,
          level: decision.level,
          values: next,
        });
      })
      .catch((e) => {
        setError(String(e));
        throw e;
      });
    void queue.current.catch(() => {});
  }
  const fields = [
    ...(domain === "cod" && decision.level === "D5" ? [
      {id:"drillsPerformed",label:"Movements performed",type:"checks",options:[["shuffle","Lateral shuffle"],["crossover","Crossovers / carioca"],["closeout","Closeout"],["backward","Backward jog — previously reviewed, overground"]]},
      {id:"drillDose",label:"Actual bouts, time or distance for each movement, and rest",type:"text"},
    ] : []),
    { id: "minutes", label: "Actual minutes", type: "number", min: 0 },
    {
      id: "sessionRPE",
      label: "Session RPE (0–10)",
      type: "number",
      min: 0,
      max: 10,
    },
    { id: "intensity", label: "Actual intensity / pace", type: "text" },
    ...(domain === "jumping"
      ? [
          {
            id: "contacts",
            label: "Total landing contacts (both sides)",
            type: "number",
            min: 0,
          },
        ]
      : []),
    ...(["speed", "cod"].includes(domain)
      ? [
          {
            id: "distance",
            label: "Total distance (metres)",
            type: "number",
            min: 0,
          },
        ]
      : []),
    {
      id: "movementQuality",
      label: "Movement quality",
      type: "select",
      options: [
        ["good", "Controlled / good"],
        ["reduced", "Reduced / deteriorated"],
      ],
    },
    {
      id: "immediateAchillesResponse",
      label: "Immediate Achilles response",
      type: "select",
      options: [
        ["good", "At usual baseline"],
        ["mild", "Mild increase"],
        ["worse", "Worse than expected"],
      ],
    },
    {
      id: "notes",
      label: "Repetitions, rest, surface, symptoms and notes",
      type: "text",
    },
  ];
  async function save() {
    const errors = validateExposureLog(
      domain,
      decision.level,
      values,
      sessions,
    );
    if (needsDose && !String(values.individualDose || "").trim())
      errors.push(
        "Record the individualized dose agreed with your clinician/performance professional.",
      );
    if (errors.length) {
      setError(errors.join(" "));
      return;
    }
    setBusy(true);
    try {
      await queue.current;
      await onSave(values, decision);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  if (!draftReady)
    return (
      <Card>
        <h2>Opening saved exposure…</h2>
        {error && <p role="alert">{error}</p>}
        <button className="text-button" onClick={onBack}>
          Back to Progress
        </button>
      </Card>
    );
  return (
    <>
      <button
        className="text-button page-back"
        onClick={async () => {
          try {
            await queue.current;
            onBack();
          } catch (e) {
            setError(String(e));
          }
        }}
      >
        ← Progress
      </button>
      <div className="screen-heading">
        <h1>
          {decision.level} ·{" "}
          {PROGRESSION_DOMAINS.find((d) => d.id === domain)?.title}
        </h1>
        <p>
          {decision.level === "B8" ? CLINICAL_COPY.candidate : decision.title}
        </p>
      </div>
      <Card>
        <h2>Planned exposure</h2>
        {reentry.reduction > 0 && (
          <p className="notice">
            Reduced re-entry: approximately {reentry.reduction * 100}% less work
            after {reentry.days} missed days. Record your reviewed reduced dose
            below. The ladder dose is shown for reference; this session cannot
            advance the ladder.
          </p>
        )}
        <p className="exercise-prescription">{decision.dose}</p>
        {cap && (
          <p className="notice">
            Today’s court cap: {cap} minutes. Record actual time honestly if you
            exceed it; exceeding the cap will block advancement.
          </p>
        )}
        <p>{content.warmup}</p>
        <p>{content.note}</p>
        {content.demos
          .filter((d: { videoUrl: string }) => d.videoUrl)
          .map(
            (d: {
              name: string;
              videoUrl: string;
              videoSource: string;
              note?: string;
            }) => (
              <p key={d.name}>
                <a href={d.videoUrl} target="_blank" rel="noreferrer">
                  Short Demo · {d.name} ↗
                </a>
                <small className="block">{d.videoSource}</small>
                {d.note && <p className="muted">{d.note}</p>}
              </p>
            ),
          )}
        <details>
          <summary>Why this dose?</summary>
          <p>{decision.reason}</p>
          <small>
            {decision.ruleId} · Rules {decision.rulesetVersion}
          </small>
        </details>
      </Card>
      <Card>
        <h2>Log this exposure</h2>
        {needsDose && (
          <DataField
            field={{
              id: "individualDose",
              label:
                "Agreed dose: bouts/reps, minutes, intensity and rest; reviewer/date",
              type: "text",
            }}
            values={values}
            onChange={change}
          />
        )}{" "}
        {fields.map((f) => (
          <DataField key={f.id} field={f} values={values} onChange={change} />
        ))}
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        <PrimaryButton
          disabled={
            busy ||
            !draftReady ||
            !decision.allowed ||
            content.missingDemos.length > 0
          }
          onClick={save}
        >
          {busy ? "Saving…" : "Save exposure"}
        </PrimaryButton>
        <p className="helper">
          Saved as pending until the next-morning response.
        </p>
      </Card>
    </>
  );
}
